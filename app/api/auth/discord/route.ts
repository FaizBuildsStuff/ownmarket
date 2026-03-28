import { NextRequest, NextResponse } from "next/server"

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/discord/callback`

export async function GET() {
  if (!DISCORD_CLIENT_ID) {
    return NextResponse.json({ error: "Discord configuration missing" }, { status: 500 })
  }

  const url = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code&scope=identify%20email`

  return NextResponse.redirect(url)
}
