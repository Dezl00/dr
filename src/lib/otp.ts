import { randomInt } from 'crypto'

import { prisma } from '@/lib/db/prisma'
import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { sendOtpSms } from '@/lib/whysms'

const otpLifetimeMs = 10 * 60 * 1000
const resendCooldownMs = 60 * 1000

export type OtpIssueResult =
  | { success: true; expiresAt: Date }
  | { success: false; error: string; retryAfterSeconds?: number }

/**
 * Invalidates a user's previous code, stores only a password hash, then sends
 * the new code. A delivery failure removes the stored code before returning.
 */
export async function issueOtpForUser(userId: string, phone: string): Promise<OtpIssueResult> {
  const now = new Date()
  const latest = await prisma.phoneOtp.findFirst({
    where: { userId, usedAt: null, expiresAt: { gt: now } },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  })

  if (latest) {
    const elapsed = now.getTime() - latest.createdAt.getTime()
    if (elapsed < resendCooldownMs) {
      return {
        success: false,
        error: 'Please wait before requesting another code',
        retryAfterSeconds: Math.ceil((resendCooldownMs - elapsed) / 1000),
      }
    }
  }

  const code = randomInt(100000, 1000000).toString()
  const expiresAt = new Date(now.getTime() + otpLifetimeMs)
  const codeHash = await hashPassword(code)

  const record = await prisma.$transaction(async (tx) => {
    await tx.phoneOtp.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: now },
    })
    return tx.phoneOtp.create({ data: { userId, phone, code: codeHash, expiresAt } })
  })

  const delivery = await sendOtpSms(phone, code)
  if (!delivery.success) {
    await prisma.phoneOtp.delete({ where: { id: record.id } }).catch(() => undefined)
    return { success: false, error: 'Unable to send verification code' }
  }

  return { success: true, expiresAt }
}

/** Verify and atomically consume the newest valid OTP for a user. */
export async function consumeOtpForUser(userId: string, code: string): Promise<boolean> {
  if (!/^\d{6}$/.test(code)) return false

  const candidates = await prisma.phoneOtp.findMany({
    where: { userId, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: { id: true, code: true },
  })

  for (const candidate of candidates) {
    const matches = await verifyPassword(candidate.code, code).catch(() => false)
    if (!matches) continue
    const consumed = await prisma.phoneOtp.updateMany({
      where: { id: candidate.id, usedAt: null, expiresAt: { gt: new Date() } },
      data: { usedAt: new Date() },
    })
    return consumed.count === 1
  }

  return false
}
