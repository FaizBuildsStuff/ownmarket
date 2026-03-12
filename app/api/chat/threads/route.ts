import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await requireCurrentUser()

    const threads = await prisma.chatThread.findMany({
      where: {
        OR: [
          { buyerId: user.id },
          { sellerId: user.id },
        ],
      },
      orderBy: { updatedAt: "desc" },
      include: {
        product: {
          select: { id: true, title: true, image: true },
        },
        buyer: {
          select: { id: true, name: true, email: true },
        },
        seller: {
          select: { id: true, name: true, email: true },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: { select: { id: true, name: true } },
          },
        },
      },
    })

    const mapped = threads.map((t) => {
      const last = t.messages[0]
      return {
        id: t.id,
        status: t.status,
        updatedAt: t.updatedAt.toISOString(),
        product: t.product,
        buyer: t.buyer,
        seller: t.seller,
        lastMessage: last
          ? {
              id: last.id,
              content: last.content,
              createdAt: last.createdAt.toISOString(),
              senderId: last.senderId,
              senderName: last.sender.name,
            }
          : null,
      }
    })

    return NextResponse.json({
      threads: mapped,
      currentUserId: user.id,
      currentUserRole: user.role,
    })
  } catch (error) {
    console.error("[chat.threads]", error)
    return NextResponse.json({ message: "Unable to load threads" }, { status: 500 })
  }
}

