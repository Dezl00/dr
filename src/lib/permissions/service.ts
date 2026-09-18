import 'server-only'

import { prisma } from '@/lib/db/prisma'
import { getCurrentSession } from '@/lib/auth/dal'
import type { PermissionKey } from './constants'

/**
 * Check if a user has a specific permission for a clinic.
 * Returns true if the user has the permission, false otherwise.
 */
export async function can(
  userId: string,
  permission: PermissionKey,
  clinicId: string
): Promise<boolean> {
  // Check for admin tenant access
  const { session, user } = await getCurrentSession()
  if (
    user?.isAdmin &&
    session?.adminAccessClinicId === clinicId &&
    session?.adminAccessExpiresAt &&
    new Date() < session.adminAccessExpiresAt
  ) {
    return true // Admin with active tenant access has all permissions
  }

  const membership = await prisma.clinicMembership.findUnique({
    where: {
      userId_clinicId: {
        userId,
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
    },
  })

  if (!membership || membership.status !== 'ACTIVE') {
    return false
  }

  return membership.role.permissions.some(
    (rp) => rp.permission.key === permission
  )
}

/**
 * Require a specific permission. Throws an error if denied.
 */
export async function requirePermission(
  userId: string,
  permission: PermissionKey,
  clinicId: string
): Promise<void> {
  const hasPermission = await can(userId, permission, clinicId)
  if (!hasPermission) {
    throw new Error('ليس لديك صلاحية لتنفيذ هذا الإجراء.')
  }
}

/**
 * Get all permission keys for a user in a clinic.
 */
export async function getUserPermissions(
  userId: string,
  clinicId: string
): Promise<string[]> {
  // Check for admin tenant access
  const { session, user } = await getCurrentSession()
  if (
    user?.isAdmin &&
    session?.adminAccessClinicId === clinicId &&
    session?.adminAccessExpiresAt &&
    new Date() < session.adminAccessExpiresAt
  ) {
    // Return all permissions for admin
    const allPermissions = await prisma.permission.findMany()
    return allPermissions.map((p) => p.key)
  }

  const membership = await prisma.clinicMembership.findUnique({
    where: {
      userId_clinicId: {
        userId,
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
    },
  })

  if (!membership || membership.status !== 'ACTIVE') {
    return []
  }

  return membership.role.permissions.map((rp) => rp.permission.key)
}
