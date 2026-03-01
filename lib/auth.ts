import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

const secretKey = process.env.JWT_SECRET || "super-secret-key-for-development";
const key = new TextEncoder().encode(secretKey);

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}

export async function createSession(payload: any) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires,
    sameSite: "lax",
    path: "/",
  });
}

export async function verifySession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;

  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getSession() {
  const sessionPayload = await verifySession();
  if (!sessionPayload || !sessionPayload.id) return null;

  try {
    const [user] = await db
      .select({
        id: users.id,
        role: users.role,
        email: users.email,
        username: users.username,
      })
      .from(users)
      .where(eq(users.id, sessionPayload.id as string));

    if (user) {
      return { ...sessionPayload, ...user };
    }
  } catch (error) {
    console.error("Failed to fetch fresh session from DB:", error);
  }

  return sessionPayload;
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
