import crypto from 'crypto'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db/prisma'

const SESSION_COOKIE_NAME = process.env.NODE_ENV === 'production'
  ? '__Host-session'
  : 'session'

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30 // 30 days
const RENEW_THRESHOLD_MS = 1000 * 60 * 60 * 24 * 15  // 15 days

export interface SessionUser {
  id: string
  email: string
  fullName: string
  isAdmin: boolean
  isSuperAdmin: boolean
  status: string
  avatarUrl: string | null
}

export interface SessionValidationResult {
  session: {
    id: string
    userId: string
    expiresAt: Date
    adminAccessClinicId: string | null
    adminAccessExpiresAt: Date | null
  } | null
  user: SessionUser | null
}

/**
 * Generate a cryptographically secure session token.
 * 32 random bytes = 64 hex characters = 256 bits of entropy.
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Hash a session token with SHA-256.
 * Only the hash is stored in the database.
 */
export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * Create a new session in the database and return it.
 */
export async function createSession(
  token: string,
  userId: string,
  ipAddress?: string,
  userAgent?: string
) {
  const sessionId = hashSessionToken(token)
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)

  const session = await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt,
      ipAddress: ipAddress || null,
      userAgent: userAgent ? userAgent.substring(0, 500) : null,
    },
  })

  return session
}

/**
 * Validate a session token. Returns user data if valid.
 * Implements sliding session renewal.
 */
export async function validateSessionToken(
  token: string
): Promise<SessionValidationResult> {
  const sessionId = hashSessionToken(token)

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          isAdmin: true,
          isSuperAdmin: true,
          status: true,
          avatarUrl: true,
        },
      },
    },
  })

  if (!session) {
    return { session: null, user: null }
  }

  // Check if session is expired
  if (Date.now() >= session.expiresAt.getTime()) {
    await prisma.session.delete({ where: { id: sessionId } })
    return { session: null, user: null }
  }

  // Check if user is active
  if (session.user.status !== 'ACTIVE') {
    await prisma.session.delete({ where: { id: sessionId } })
    return { session: null, user: null }
  }

  // Sliding renewal: extend if less than 15 days remaining
  const newExpiresAt = new Date(Date.now() + SESSION_DURATION_MS)
  if (Date.now() >= session.expiresAt.getTime() - RENEW_THRESHOLD_MS) {
    await prisma.session.update({
      where: { id: sessionId },
      data: { expiresAt: newExpiresAt },
    })
  }

  return {
    session: {
      id: session.id,
      userId: session.userId,
      expiresAt: session.expiresAt,
      adminAccessClinicId: session.adminAccessClinicId,
      adminAccessExpiresAt: session.adminAccessExpiresAt,
    },
    user: session.user as SessionUser,
  }
}

/**
 * Invalidate a single session.
 */
export async function invalidateSession(token: string): Promise<void> {
  const sessionId = hashSessionToken(token)
  await prisma.session.delete({ where: { id: sessionId } }).catch(() => {})
}

/**
 * Invalidate all sessions for a user.
 */
export async function invalidateAllUserSessions(
  userId: string
): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } })
}

/**
 * Set the session cookie on the response.
 */
export async function setSessionCookie(
  token: string,
  expiresAt: Date
): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  })
}

/**
 * Delete the session cookie.
 */
export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

/**
 * Get the session cookie name (for middleware use).
 */
export function getSessionCookieName(): string {
  return SESSION_COOKIE_NAME
}
