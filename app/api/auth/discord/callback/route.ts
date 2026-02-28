import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
const NEXT_PUBLIC_APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function verifyState(state: string): string | null {
  const secret = process.env.DISCORD_CLIENT_SECRET;
  if (!secret) return null;
  const [payload, sig] = state.split(".");
  if (!payload || !sig) return null;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  if (sig !== expected) return null;
  try {
    return Buffer.from(payload, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL("/dashboard?error=discord_denied", NEXT_PUBLIC_APP_URL),
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/dashboard?error=discord_missing", NEXT_PUBLIC_APP_URL),
    );
  }

  const userId = verifyState(state);
  if (!userId) {
    return NextResponse.redirect(
      new URL("/dashboard?error=discord_invalid_state", NEXT_PUBLIC_APP_URL),
    );
  }

  if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
    return NextResponse.redirect(
      new URL("/dashboard?error=discord_config", NEXT_PUBLIC_APP_URL),
    );
  }

  const redirectUri = `${NEXT_PUBLIC_APP_URL}/api/auth/discord/callback`;
  const body = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    client_secret: DISCORD_CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(
      new URL("/dashboard?error=discord_token", NEXT_PUBLIC_APP_URL),
    );
  }

  const tokenData = (await tokenRes.json()) as { access_token: string };
  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!userRes.ok) {
    return NextResponse.redirect(
      new URL("/dashboard?error=discord_user", NEXT_PUBLIC_APP_URL),
    );
  }

  const discordUser = (await userRes.json()) as {
    id: string;
    username: string;
    avatar: string | null;
  };

  try {
    await db
      .update(users)
      .set({
        discordId: discordUser.id,
        discordUsername: discordUser.username,
        discordAvatar: discordUser.avatar,
      })
      .where(eq(users.id, userId));
  } catch (error) {
    return NextResponse.redirect(
      new URL("/dashboard?error=db_error", NEXT_PUBLIC_APP_URL),
    );
  }

  return NextResponse.redirect(
    new URL("/dashboard?discord=connected", NEXT_PUBLIC_APP_URL),
  );
}
