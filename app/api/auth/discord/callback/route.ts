import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { randomUUID } from "crypto"
import { cookies } from "next/headers"
import { getCurrentUser } from "@/lib/auth"

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/discord/callback`
const SESSION_COOKIE_NAME = "om_session"
const SESSION_MAX_AGE_DAYS = 7

async function createSession(userId: string) {
  const token = randomUUID()
  const expires = new Date(Date.now() + SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000)

  await prisma.session.create({
    data: {
      sessionToken: token,
      userId,
      expires,
    },
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/signup?error=no_code`)
  }

  try {
    // 1. Exchange code for token
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID!,
        client_secret: DISCORD_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })

    const tokenData = await tokenResponse.json()
    if (!tokenData.access_token) {
      console.error("Discord Token Error:", tokenData)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/signup?error=token_failed`)
    }

    // 2. Fetch user data
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const discordUser = await userResponse.json()

    // NEW: Check if user is already logged in (to LINK account)
    const currentUser = await getCurrentUser()
    
    let user;
    if (currentUser) {
      // Link Discord to the logged-in user
      user = await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          discordId: discordUser.id,
          discordUsername: `${discordUser.username}${discordUser.discriminator !== '0' ? '#' + discordUser.discriminator : ''}`,
          discordAvatar: discordUser.avatar 
            ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
            : null,
        },
      })
    } else {
      // 3. Find or create user (for login/signup)
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { discordId: discordUser.id },
            { email: discordUser.email },
          ],
        },
      })

      if (user) {
        // Update existing user with Discord details
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            discordId: discordUser.id,
            discordUsername: `${discordUser.username}${discordUser.discriminator !== '0' ? '#' + discordUser.discriminator : ''}`,
            discordAvatar: discordUser.avatar 
              ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
              : null,
            // If user didn't have an email, use Discord's
            email: user.email || discordUser.email,
            name: user.name || discordUser.global_name || discordUser.username,
          },
        })
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            email: discordUser.email,
            name: discordUser.global_name || discordUser.username,
            discordId: discordUser.id,
            discordUsername: discordUser.username,
            discordAvatar: discordUser.avatar 
              ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
              : null,
            role: "BUYER",
          },
        })
      }
    }

    // 4. Create session
    if (!currentUser) {
      await createSession(user.id)
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`)
  } catch (error) {
    console.error("Discord Auth Callback Error:", error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/signup?error=auth_error`)
  }
}
