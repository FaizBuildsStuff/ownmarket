import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireCurrentUser } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser()
    const body = await request.json().catch(() => ({}))
    const { threadId, status } = body as { threadId?: string; status?: "OPEN" | "IN_PROGRESS" | "CLOSED" }

    if (!threadId || !status) {
      return NextResponse.json({ message: "threadId and status are required" }, { status: 400 })
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

    // Only seller/admin can move to IN_PROGRESS
    if (status === "IN_PROGRESS" && thread.sellerId !== user.id) {
      return NextResponse.json({ message: "Only seller can start order" }, { status: 403 })
    }

    // Only buyer can close
    if (status === "CLOSED" && thread.buyerId !== user.id) {
      return NextResponse.json({ message: "Only buyer can close" }, { status: 403 })
    }

    const updated = await prisma.chatThread.update({
      where: { id: threadId },
      data: { status },
    })

    return NextResponse.json({ thread: updated })
  } catch (error) {
    console.error("[chat.status]", error)
    return NextResponse.json({ message: "Unable to update status" }, { status: 500 })
  }
}

