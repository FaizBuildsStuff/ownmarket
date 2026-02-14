import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function signState(userId: string): string {
  const secret = process.env.DISCORD_CLIENT_SECRET;
  if (!secret) throw new Error("DISCORD_CLIENT_SECRET is not set");
  const payload = Buffer.from(userId, "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId || !DISCORD_CLIENT_ID) {
    return NextResponse.redirect(new URL("/dashboard?error=discord_config", NEXT_PUBLIC_APP_URL));
  }
  try {
    const state = signState(userId);
    const redirectUri = `${NEXT_PUBLIC_APP_URL}/api/auth/discord/callback`;
    const scope = "identify";
    const url = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}`;
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.redirect(new URL("/dashboard?error=discord_failed", NEXT_PUBLIC_APP_URL));
  }
}
