"use server";

import { db } from "@/lib/db";
import { conversations, messages, products, users } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { eq, or, and, desc, sql } from "drizzle-orm";

export async function getOrCreateConversationAction(
  sellerId: string,
  productId?: string,
) {
  const session = await getSession();
  if (!session || !session.id) throw new Error("Unauthorized");

  const buyerId = session.id as string;
  if (buyerId === sellerId) throw new Error("Cannot chat with yourself");

  // Check if conversation already exists
  let conditions = [
    eq(conversations.buyerId, buyerId),
    eq(conversations.sellerId, sellerId),
  ];

  if (productId) {
    conditions.push(eq(conversations.productId, productId));
  } else {
    // For cart orders without a specific product ID
    conditions.push(sql`${conversations.productId} IS NULL`);
  }

  const existing = await db
    .select()
    .from(conversations)
    .where(and(...conditions))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Create new conversation
  const [newConv] = await db
    .insert(conversations)
    .values({
      buyerId,
      sellerId,
      productId: productId || null,
      status: "open",
    })
    .returning();

  return newConv;
}

export async function fetchUserConversationsAction() {
  const session = await getSession();
  if (!session || !session.id) return [];

  const userId = session.id as string;

  const results = await db
    .select({
      id: conversations.id,
      status: conversations.status,
      amount: conversations.amount,
      updatedAt: conversations.updatedAt,
      buyer: {
        id: users.id,
        username: users.username,
        discordUsername: users.discordUsername,
        discordAvatar: users.discordAvatar,
        discordId: users.discordId,
      },
      sellerId: conversations.sellerId,
      buyerId: conversations.buyerId,
      productName: products.name,
      // We alias seller separately in a left join, so we can map it
      sellerUsername: sql<string>`seller_user.username`,
      sellerDiscordUsername: sql<string>`seller_user.discord_username`,
      sellerDiscordAvatar: sql<string>`seller_user.discord_avatar`,
      sellerDiscordId: sql<string>`seller_user.discord_id`,
      unreadCount: sql<number>`(SELECT count(*) FROM ${messages} WHERE ${messages.conversationId} = ${conversations.id} AND ${messages.senderId} != ${userId} AND ${messages.isRead} = false)::int`,
    })
    .from(conversations)
    .leftJoin(users, eq(conversations.buyerId, users.id))
    .leftJoin(products, eq(conversations.productId, products.id))
    .leftJoin(
      sql`${users} as seller_user`,
      sql`${conversations.sellerId} = seller_user.id`,
    )
    .where(
      or(eq(conversations.buyerId, userId), eq(conversations.sellerId, userId)),
    )
    .orderBy(desc(conversations.updatedAt));

  return results.map((row) => ({
    ...row,
    isBuyer: row.buyerId === userId,
    otherUser:
      row.buyerId === userId
        ? {
            id: row.sellerId,
            username: row.sellerUsername,
            discordUsername: row.sellerDiscordUsername,
            discordAvatar: row.sellerDiscordAvatar,
            discordId: row.sellerDiscordId,
          }
        : row.buyer,
  }));
}

export async function fetchMessagesAction(conversationId: string) {
  const session = await getSession();
  if (!session || !session.id) throw new Error("Unauthorized");
  const userId = session.id as string;

  // Verify access
  const [conv] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId));

  if (!conv || (conv.buyerId !== userId && conv.sellerId !== userId)) {
    throw new Error("Unauthorized access to conversation");
  }

  return await db
    .select({
      id: messages.id,
      content: messages.content,
      senderId: messages.senderId,
      createdAt: messages.createdAt,
      isRead: messages.isRead,
    })
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);
}

export async function sendMessageAction(
  conversationId: string,
  content: string,
) {
  const session = await getSession();
  if (!session || !session.id) throw new Error("Unauthorized");

  const userId = session.id as string;

  const [msg] = await db
    .insert(messages)
    .values({
      conversationId,
      senderId: userId,
      content,
    })
    .returning();

  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, conversationId));

  return {
    id: msg.id,
    content: msg.content,
    senderId: msg.senderId,
    createdAt: msg.createdAt,
    isRead: msg.isRead,
  };
}

export async function markConversationReadAction(conversationId: string) {
  const session = await getSession();
  if (!session || !session.id) return;
  const userId = session.id as string;

  await db
    .update(messages)
    .set({ isRead: true })
    .where(
      and(
        eq(messages.conversationId, conversationId),
        sql`${messages.senderId} != ${userId}`,
        eq(messages.isRead, false),
      ),
    );
}

export async function transferFundsAction(
  conversationId: string,
  amount: number,
) {
  const session = await getSession();
  if (!session || !session.id) throw new Error("Unauthorized");
  const userId = session.id as string;

  const [conv] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId));

  if (!conv || conv.buyerId !== userId) {
    throw new Error("Only the buyer can transfer funds");
  }

  await db
    .update(conversations)
    .set({
      amount: amount.toString(),
      status: "completed",
      updatedAt: new Date(),
    })
    .where(eq(conversations.id, conversationId));

  // Auto-send a system message
  await db.insert(messages).values({
    conversationId,
    senderId: userId,
    content: `💸 **FUNDS TRANSFERRED ($${amount.toFixed(2)})** - The buyer has confirmed receipt and transferred the simulated funds for this order.`,
  });

  return true;
}
