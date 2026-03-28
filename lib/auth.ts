"use server"

import { cookies } from "next/headers"
import { randomUUID, randomBytes, scryptSync, timingSafeEqual } from "crypto"
import prisma from "./prisma"

const SESSION_COOKIE_NAME = "om_session"
const SESSION_MAX_AGE_DAYS = 7

function hashPasswordInternal(password: string) {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

function verifyPasswordInternal(password: string, stored: string) {
  const [salt, hash] = stored.split(":")
  if (!salt || !hash) return false
  const hashBuffer = Buffer.from(hash, "hex")
  const verifyBuffer = scryptSync(password, salt, 64)
  return timingSafeEqual(hashBuffer, verifyBuffer)
}

export async function hashPassword(password: string) {
  return hashPasswordInternal(password)
}

export async function verifyPassword(password: string, stored: string) {
  return verifyPasswordInternal(password, stored)
}

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

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!token) return null

  const session = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: { user: true },
  })

  if (!session || session.expires < new Date()) {
    cookieStore.delete(SESSION_COOKIE_NAME)
    if (session?.sessionToken) {
      await prisma.session.deleteMany({
        where: { sessionToken: token },
      })
    }
    return null
  }

  const { passwordHash, ...safeUser } = session.user as any
  return safeUser
}

export async function requireCurrentUser() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("UNAUTHENTICATED")
  }
  return user
}

export async function requireAdmin() {
  const user = await requireCurrentUser()
  if (user.role !== "ADMIN") {
    throw new Error("UNAUTHORIZED")
  }
  return user
}

export async function signInWithEmail(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user || !user.passwordHash) {
    throw new Error("Invalid credentials")
  }

  const isValid = await verifyPassword(password, user.passwordHash)
  if (!isValid) {
    throw new Error("Invalid credentials")
  }

  await createSession(user.id)
  const { passwordHash, ...safeUser } = user as any
  return safeUser
}

export async function createUserWithPassword(params: {
  email: string
  password: string
  username?: string
}) {
  const existing = await prisma.user.findUnique({
    where: { email: params.email },
  })

  if (existing) {
    throw new Error("Email already in use")
  }

  const passwordHash = await hashPassword(params.password)

  const user = await prisma.user.create({
    data: {
      email: params.email,
      name: params.username,
      passwordHash,
    },
  })

  await createSession(user.id)
  const { passwordHash: _ph, ...safeUser } = user as any
  return safeUser
}

export async function signOut() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (token) {
    await prisma.session.deleteMany({
      where: { sessionToken: token },
    })
  }

  cookieStore.delete(SESSION_COOKIE_NAME)
}

