import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { comparePassword, createSession, destroySession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const matchedUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    const user = matchedUsers[0];

    if (!user || !user.hashedPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const isValid = await comparePassword(password, user.hashedPassword);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const sessionPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    await createSession(sessionPayload);

    return NextResponse.json({ user: sessionPayload }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal error" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  await destroySession();
  return NextResponse.json({ success: true });
}
