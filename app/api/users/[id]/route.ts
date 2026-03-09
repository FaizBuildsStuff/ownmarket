import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Define the context where params is a Promise
type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    // Await the params to get the actual ID
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        products: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[user.GET]", error);
    return NextResponse.json({ message: "Failed to load user" }, { status: 500 });
  }
}