import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { hashPassword, createSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { email, password, username } = await req.json();

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if user exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 },
      );
    }

    const hashedPassword = await hashPassword(password);

    // Insert user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        hashedPassword,
        username,
      })
      .returning();

    // Create session
    const sessionPayload = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
    };

    await createSession(sessionPayload);

    return NextResponse.json({ user: sessionPayload }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal error" },
      { status: 500 },
    );
  }
}
