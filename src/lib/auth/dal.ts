import 'server-only'

import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { validateSessionToken, type SessionUser } from './session'
import { prisma } from '@/lib/db/prisma'

const SESSION_COOKIE_NAME = process.env.NODE_ENV === 'production'
  ? '__Host-session'
  : 'session'

/**
 * Get the current authenticated user. Cached per request.
 * Returns null if not authenticated.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!token) return null

  const { user } = await validateSessionToken(token)
  return user
})

/**
 * Get the current session data. Cached per request.
 */
export const getCurrentSession = cache(async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!token) return { session: null, user: null }

  return await validateSessionToken(token)
})

/**
 * Require authentication. Redirects to /login if not authenticated.
 */
export const requireAuth = cache(async (): Promise<SessionUser> => {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  return user
})

/**
 * Require admin access. Redirects to /dashboard if not admin.
 */
export const requireAdmin = cache(async (): Promise<SessionUser> => {
  const user = await requireAuth()
  if (!user.isAdmin) {
    redirect('/dashboard')
  }
  return user
})

/**
 * Require clinic membership. Returns the membership + role.
 * Redirects if user doesn't have access to this clinic.
 */
export async function requireClinicAccess(clinicId: string) {
  const user = await requireAuth()

  // Admins with active tenant access bypass membership check
  const { session } = await getCurrentSession()
  if (
    user.isAdmin &&
    session?.adminAccessClinicId === clinicId &&
    session?.adminAccessExpiresAt &&
    new Date() < session.adminAccessExpiresAt
  ) {
    return {
      user,
      membership: null,
      isAdminAccess: true,
    }
  }

  const membership = await prisma.clinicMembership.findUnique({
    where: {
      userId_clinicId: {
        userId: user.id,
        clinicId,
      },
    },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
      clinic: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          timezone: true,
        },
      },
    },
  })

  if (!membership || membership.status !== 'ACTIVE') {
    redirect('/dashboard')
  }

  if (membership.clinic.status !== 'ACTIVE') {
    redirect('/dashboard')
  }

  return {
    user,
    membership,
    isAdminAccess: false,
  }
}
