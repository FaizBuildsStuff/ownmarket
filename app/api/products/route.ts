import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireCurrentUser } from "@/lib/auth"
import { sendEmailConfirmation } from "@/lib/emailjs"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mine = searchParams.get("mine") === "1" || searchParams.get("mine") === "true"

  try {
    if (mine) {
      const user = await requireCurrentUser()
      const products = await prisma.product.findMany({
        where: { sellerId: user.id },
        orderBy: { createdAt: "desc" },
      })
      return NextResponse.json({ products })
    }

    const products = await prisma.product.findMany({
      where: { isVisible: true },
      orderBy: { createdAt: "desc" },
      include: {
        seller: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error("[products.GET]", error)
    return NextResponse.json({ message: "Failed to load products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser()

    const body = await request.json().catch(() => ({}))
    const { title, description, price, category, image } = body as {
      title?: string
      description?: string
      price?: number
      category?: string
      image?: string
    }

    if (!title || typeof price !== "number" || !category) {
      return NextResponse.json(
        { message: "Title, price and category are required" },
        { status: 400 },
      )
    }

    if (user.role !== "SELLER" && user.role !== "ADMIN") {
      return NextResponse.json({ message: "Not allowed" }, { status: 403 })
    }

    const product = await prisma.product.create({
      data: {
        title,
        description: description ?? "",
        price,
        category,
        image: image || "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
        sellerId: user.id,
      },
    })

    // Trigger EmailJS Notification
    await sendEmailConfirmation({
      to_name: user.name || "Seller",
      to_email: user.email || "",
      product_title: product.title,
      price: product.price,
      image_url: product.image
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error("[products.POST]", error)
    return NextResponse.json(
      { message: "Could not create product" },
      { status: 500 },
    )
  }
}

