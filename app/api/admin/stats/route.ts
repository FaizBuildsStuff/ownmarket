import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"

export async function GET() {
  try {
    await requireAdmin()

    const [userCount, productCount, purchaseCount, totalSales] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.purchase.count(),
      prisma.purchase.aggregate({
        _sum: {
          pricePaid: true,
        },
      }),
    ])

    // Get recent activity
    const recentPurchases = await prisma.purchase.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        product: { select: { title: true } },
      },
    })

    return NextResponse.json({
      stats: {
        userCount,
        productCount,
        purchaseCount,
        totalRevenue: totalSales._sum.pricePaid || 0,
      },
      recentPurchases,
    }, { status: 200 })
  } catch (error: any) {
    console.error("[ADMIN_STATS_GET]", error)
    return NextResponse.json({ message: error.message || "Forbidden" }, { status: error.message === "UNAUTHORIZED" ? 403 : 401 })
  }
}
