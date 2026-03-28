import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"

export async function GET() {
  try {
    await requireAdmin()
    const users = await prisma.user.findMany({
      orderBy: { id: "desc" },
      include: {
        _count: {
          select: {
            purchases: true,
            products: true,
          },
        },
      },
    })
    return NextResponse.json({ users }, { status: 200 })
  } catch (error: any) {
    console.error("[ADMIN_USERS_GET]", error)
    return NextResponse.json({ message: error.message || "Forbidden" }, { status: error.message === "UNAUTHORIZED" ? 403 : 401 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const { userId, role, status, badges, timeoutUntil } = body

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: role ?? undefined,
        status: status ?? undefined,
        badges: badges ?? undefined,
        timeoutUntil: timeoutUntil ? new Date(timeoutUntil) : undefined,
      },
    })

    return NextResponse.json({ user: updatedUser }, { status: 200 })
  } catch (error: any) {
    console.error("[ADMIN_USERS_PATCH]", error)
    return NextResponse.json({ message: error.message || "Forbidden" }, { status: error.message === "UNAUTHORIZED" ? 403 : 401 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({ message: "User deleted" }, { status: 200 })
  } catch (error: any) {
    console.error("[ADMIN_USERS_DELETE]", error)
    return NextResponse.json({ message: error.message || "Forbidden" }, { status: error.message === "UNAUTHORIZED" ? 403 : 401 })
  }
}
