import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactRequests } from "@/lib/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (
      !email ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 },
      );
    }
    if (
      !subject ||
      typeof subject !== "string" ||
      subject.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 },
      );
    }
    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    try {
      await db.insert(contactRequests).values({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });
    } catch (dbError: any) {
      return NextResponse.json(
        { error: dbError.message || "Failed to submit" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
