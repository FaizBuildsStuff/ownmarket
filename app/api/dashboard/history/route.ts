import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Force casting to any to bypass temporary Prisma Client sync issues in development
const db = prisma as any;

export async function GET(request: Request) {
  try {
    const user = await requireCurrentUser();
    const isAdmin = user.role === "ADMIN";

    // 1. Sales History
    const sales = await db.purchase.findMany({
      where: isAdmin ? {} : { product: { sellerId: user.id } },
      include: {
        product: true,
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. All Products
    const allProducts = await db.product.findMany({
      where: isAdmin ? {} : { sellerId: user.id },
      include: {
        _count: {
          select: { purchases: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 3. Active Products
    const activeProducts = allProducts.filter((p: any) => p.isVisible);

    // 4. Refunds (Defensive check for model existence)
    const refunds = db.refund
      ? await db.refund.findMany({
          where: isAdmin
            ? {}
            : { purchase: { product: { sellerId: user.id } } },
          include: {
            purchase: {
              include: {
                product: true,
                user: { select: { name: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        })
      : [];

    return NextResponse.json({
      sales,
      allProducts,
      activeProducts,
      refunds: refunds || [],
      stats: {
        totalSales: sales.length,
        totalProducts: allProducts.length,
        activeProducts: activeProducts.length,
        totalRefunds: refunds.length,
      },
    });
  } catch (error) {
    console.error("[dashboard.history.GET]", error);
    return NextResponse.json(
      { message: "Failed to load history data" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireCurrentUser();
    if (user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { refundId, status } = await request.json();
    if (!refundId || !status) {
      return NextResponse.json({ message: "Missing data" }, { status: 400 });
    }

    if (!db.refund) {
      return NextResponse.json(
        { message: "Refund protocol not initialized on server" },
        { status: 500 },
      );
    }

    const refund = await db.refund.update({
      where: { id: refundId },
      data: { status },
      include: { purchase: true },
    });

    // If approved, update purchase status too
    if (status === "APPROVED") {
      await db.purchase.update({
        where: { id: refund.purchaseId },
        data: { status: "REFUNDED" },
      });
    }

    return NextResponse.json({ refund });
  } catch (error) {
    console.error("[dashboard.history.PATCH]", error);
    return NextResponse.json(
      { message: "Failed to update refund status" },
      { status: 500 },
    );
  }
}
