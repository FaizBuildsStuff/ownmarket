import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await requireCurrentUser()

    // 1. Fetch real purchases
    const purchases = await prisma.purchase.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            seller: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
    })

    // 2. Calculate real stats
    const totalSpent = purchases.reduce((acc, p) => acc + p.pricePaid, 0)
    
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const monthlyPurchases = purchases.filter(p => new Date(p.createdAt) >= startOfMonth)
    const monthlySpent = monthlyPurchases.reduce((acc, p) => acc + p.pricePaid, 0)

    // 3. Map to library items
    const library = purchases.map(p => ({
      id: p.product.id,
      title: p.product.title,
      price: p.product.price,
      image: p.product.image,
      category: p.product.category,
      date: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      sellerName: p.product.seller.name
    }))

    return NextResponse.json({
      stats: {
        totalSpent,
        monthlySpent,
        itemsBoughtThisMonth: monthlyPurchases.length
      },
      library
    })
  } catch (error) {
    console.error("[dashboard.buyer.GET]", error)
    return NextResponse.json({ message: "Failed to load dashboard data" }, { status: 500 })
  }
}
