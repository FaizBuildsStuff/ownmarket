import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await requireAdmin()
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        seller: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            purchases: true,
            chatThreads: true,
          },
        },
      },
    })
    return NextResponse.json({ products }, { status: 200 })
  } catch (error: any) {
    console.error("[ADMIN_PRODUCTS_GET]", error)
    return NextResponse.json({ message: error.message || "Forbidden" }, { status: error.message === "UNAUTHORIZED" ? 403 : 401 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const { productId, title, price, category, description, isVisible } = body
    console.log("[ADMIN_PRODUCTS_PATCH] Body:", body)

    if (!productId) {
      return NextResponse.json({ message: "Product ID is required" }, { status: 400 })
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        title: title ?? undefined,
        price: price ?? undefined,
        category: category ?? undefined,
        description: description ?? undefined,
        // @ts-ignore - isVisible may not be in generated types yet
        isVisible: isVisible !== undefined ? isVisible : undefined,
      },
    })
    console.log("[ADMIN_PRODUCTS_PATCH] Updated Product:", updatedProduct)

    return NextResponse.json({ product: updatedProduct }, { status: 200 })
  } catch (error: any) {
    console.error("[ADMIN_PRODUCTS_PATCH]", error)
    return NextResponse.json({ message: error.message || "Forbidden" }, { status: error.message === "UNAUTHORIZED" ? 403 : 401 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ message: "Product ID is required" }, { status: 400 })
    }

    await prisma.product.delete({
      where: { id: productId },
    })

    return NextResponse.json({ message: "Product deleted" }, { status: 200 })
  } catch (error: any) {
    console.error("[ADMIN_PRODUCTS_DELETE]", error)
    return NextResponse.json({ message: error.message || "Forbidden" }, { status: error.message === "UNAUTHORIZED" ? 403 : 401 })
  }
}
