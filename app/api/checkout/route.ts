import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireCurrentUser } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser()
    const { items } = await request.json()

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 })
    }

    // Create purchases in a transaction
    const purchases = await prisma.$transaction(
      items.map((item: any) =>
        prisma.purchase.create({
          data: {
            userId: user.id,
            productId: item.id,
            pricePaid: item.price,
          },
        })
      )
    )

    return NextResponse.json({ message: "Purchase successful", purchases }, { status: 201 })
  } catch (error) {
    console.error("[checkout.POST]", error)
    return NextResponse.json({ message: "Checkout failed" }, { status: 500 })
  }
}
