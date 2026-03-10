import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireCurrentUser } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser()
    const body = await request.json().catch(() => ({}))
    const { productId } = body as { productId?: string }

    if (!productId) {
      return NextResponse.json({ message: "productId is required" }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    const sellerId = product.sellerId

    if (sellerId === user.id) {
      return NextResponse.json({ message: "You cannot chat with yourself" }, { status: 400 })
    }

    // Find existing open thread
    let thread = await prisma.chatThread.findFirst({
      where: {
        buyerId: user.id,
        sellerId,
        productId,
        status: { in: ["OPEN", "IN_PROGRESS"] },
      },
    })

    if (!thread) {
      thread = await prisma.chatThread.create({
        data: {
          buyerId: user.id,
          sellerId,
          productId,
        },
      })
    }

    const messages = await prisma.chatMessage.findMany({
      where: { threadId: thread.id },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json({
      thread,
      messages: messages.map((m) => ({
        id: m.id,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
        senderId: m.senderId,
        senderName: m.sender.name,
      })),
      currentUserId: user.id,
      currentUserRole: user.role,
    })
  } catch (error) {
    console.error("[chat.start]", error)
    return NextResponse.json({ message: "Unable to start chat" }, { status: 500 })
  }
}

