import { prisma } from '@/lib/db/prisma'
import type { AuditAction } from '@prisma/client'

interface AuditLogInput {
  actorId?: string
  clinicId?: string
  action: AuditAction
  resource?: string
  resourceId?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

/**
 * Write an audit log entry.
 * Non-blocking — errors are caught and logged, not thrown.
 */
export async function writeAuditLog(input: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId || null,
        clinicId: input.clinicId || null,
        action: input.action,
        resource: input.resource || null,
        resourceId: input.resourceId || null,
        metadata: input.metadata || null,
        ipAddress: input.ipAddress || null,
        userAgent: input.userAgent ? input.userAgent.substring(0, 500) : null,
      },
    })
  } catch (error) {
    console.error('[AUDIT] Failed to write audit log:', error)
  }
}
