import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireCurrentUser } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser()
    const body = await request.json().catch(() => ({}))
    const { threadId, content } = body as { threadId?: string; content?: string }

    if (!threadId || !content?.trim()) {
      return NextResponse.json({ message: "threadId and content are required" }, { status: 400 })
    }

    const thread = await prisma.chatThread.findUnique({
      where: { id: threadId },
    })

    if (!thread) {
      return NextResponse.json({ message: "Thread not found" }, { status: 404 })
    }

    if (thread.buyerId !== user.id && thread.sellerId !== user.id) {
      return NextResponse.json({ message: "Not allowed" }, { status: 403 })
    }

    if (thread.status === "CLOSED") {
      return NextResponse.json({ message: "Thread is closed" }, { status: 400 })
    }

    const message = await prisma.chatMessage.create({
      data: {
        threadId,
        senderId: user.id,
        content: content.trim(),
      },
      include: {
        sender: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({
      message: {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
        senderId: message.senderId,
        senderName: message.sender.name,
      },
    })
  } catch (error) {
    console.error("[chat.message]", error)
    return NextResponse.json({ message: "Unable to send message" }, { status: 500 })
  }
}

