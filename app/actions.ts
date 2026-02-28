"use server";

import { db } from "@/lib/db";
import { products, users } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { eq, desc, inArray } from "drizzle-orm";

export async function fetchUserProducts() {
  const session = await getSession();
  if (!session || session.role !== "seller") return [];

  return await db
    .select()
    .from(products)
    .where(eq(products.sellerId, session.id as string))
    .orderBy(desc(products.createdAt));
}

export async function fetchAllProductsAction() {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Unauthorized");

  return await db.select().from(products).orderBy(desc(products.createdAt));
}

export async function fetchAllUsersAction() {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Unauthorized");

  return await db.select().from(users).orderBy(desc(users.createdAt));
}

export async function createProductAction(data: {
  name: string;
  price: number;
  quantity: number;
  description?: string;
  discordChannel?: string;
}) {
  const session = await getSession();
  if (!session || session.role !== "seller") throw new Error("Unauthorized");

  const [newProduct] = await db
    .insert(products)
    .values({
      sellerId: session.id as string,
      name: data.name,
      price: data.price.toString(),
      quantity: data.quantity,
      description: data.description || null,
      discordChannelLink: data.discordChannel || null,
    })
    .returning();

  return newProduct;
}

export async function updateProductAction(
  id: string,
  data: {
    name: string;
    price: number;
    quantity: number;
    description?: string;
    discordChannel?: string;
  },
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  let canEdit = false;
  if (session.role === "admin") {
    canEdit = true;
  } else if (session.role === "seller") {
    const [p] = await db.select().from(products).where(eq(products.id, id));
    if (p && p.sellerId === (session.id as string)) canEdit = true;
  }

  if (!canEdit) throw new Error("Unauthorized");

  await db
    .update(products)
    .set({
      name: data.name,
      price: data.price.toString(),
      quantity: data.quantity,
      description: data.description || null,
      discordChannelLink: data.discordChannel || null,
    })
    .where(eq(products.id, id));
}

export async function deleteProductAction(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  let canDelete = false;
  if (session.role === "admin") {
    canDelete = true;
  } else if (session.role === "seller") {
    const [p] = await db.select().from(products).where(eq(products.id, id));
    if (p && p.sellerId === session.id) canDelete = true;
  }

  if (!canDelete) throw new Error("Unauthorized");

  await db.delete(products).where(eq(products.id, id));
}

export async function setProductBadgeAction(id: string, badge: string | null) {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Unauthorized");

  await db.update(products).set({ badge }).where(eq(products.id, id));
}

export async function setUserBadgeAction(id: string, badge: string | null) {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Unauthorized");

  await db.update(users).set({ badge }).where(eq(users.id, id));
}

export async function banUserAction(id: string) {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Unauthorized");

  await db
    .update(users)
    .set({ banned: true, bannedUntil: null })
    .where(eq(users.id, id));
}

export async function timeoutUserAction(id: string, days: number) {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Unauthorized");

  const until = new Date();
  until.setDate(until.getDate() + days);

  await db
    .update(users)
    .set({ banned: false, bannedUntil: until })
    .where(eq(users.id, id));
}

export async function unbanUserAction(id: string) {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Unauthorized");

  await db
    .update(users)
    .set({ banned: false, bannedUntil: null })
    .where(eq(users.id, id));
}

export async function fetchMarketplaceProductsAction() {
  const result = await db
    .select({
      id: products.id,
      sellerId: products.sellerId,
      name: products.name,
      price: products.price,
      quantity: products.quantity,
      description: products.description,
      sellerUsername: users.username,
    })
    .from(products)
    .leftJoin(users, eq(products.sellerId, users.id))
    .orderBy(desc(products.createdAt));

  return result;
}

export async function fetchProductDetailsAction(productId: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId));
  if (!product) return null;

  const [seller] = await db
    .select({
      id: users.id,
      username: users.username,
      discordId: users.discordId,
      discordAvatar: users.discordAvatar,
      discordUsername: users.discordUsername,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, product.sellerId));

  return { product, seller };
}

export async function fetchSellerProfileAndProductsAction(sellerId: string) {
  const [seller] = await db
    .select({
      id: users.id,
      username: users.username,
      discordId: users.discordId,
      discordAvatar: users.discordAvatar,
      discordUsername: users.discordUsername,
      createdAt: users.createdAt,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, sellerId));

  if (!seller) return null;

  const sellerProducts = await db
    .select()
    .from(products)
    .where(eq(products.sellerId, sellerId))
    .orderBy(desc(products.createdAt));

  return { seller, products: sellerProducts };
}

export async function fetchCartProductsAction(productIds: string[]) {
  if (!productIds || productIds.length === 0) return [];

  const results = await db
    .select({
      id: products.id,
      name: products.name,
      price: products.price,
      quantity: products.quantity,
      sellerId: products.sellerId,
      sellerUsername: users.username,
      sellerDiscordUsername: users.discordUsername,
      sellerDiscordId: users.discordId,
    })
    .from(products)
    .leftJoin(users, eq(products.sellerId, users.id))
    .where(inArray(products.id, productIds));

  return results;
}

export async function fetchRecentProductsAction(limitCount = 6) {
  const result = await db
    .select({
      id: products.id,
      sellerId: products.sellerId,
      name: products.name,
      price: products.price,
      quantity: products.quantity,
      description: products.description,
      discordChannelLink: products.discordChannelLink,
      sellerUsername: users.username,
      sellerCreatedAt: users.createdAt,
    })
    .from(products)
    .leftJoin(users, eq(products.sellerId, users.id))
    .orderBy(desc(products.createdAt))
    .limit(limitCount);

  return result;
}
