import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession, hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, password, username } = await request.json();

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: "Email, password, and username are required." },
        { status: 400 },
      );
    }

    // Check if email is already taken by another user
    const existingEmailUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (
      existingEmailUser.length > 0 &&
      existingEmailUser[0].id !== session.id
    ) {
      return NextResponse.json(
        { error: "This email is already registered." },
        { status: 400 },
      );
    }

    const hashedPassword = await hashPassword(password);

    await db
      .update(users)
      .set({
        email,
        hashedPassword,
        username,
        role: "seller",
      })
      .where(eq(users.id, session.id as string));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Complete profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
