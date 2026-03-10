import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireCurrentUser } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const user = await requireCurrentUser()
    const { searchParams } = new URL(request.url)
    const threadId = searchParams.get("threadId")

    if (!threadId) {
      return NextResponse.json({ message: "threadId is required" }, { status: 400 })
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

    const messages = await prisma.chatMessage.findMany({
      where: { threadId },
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
    })
  } catch (error) {
    console.error("[chat.messages]", error)
    return NextResponse.json({ message: "Unable to load messages" }, { status: 500 })
  }
}

