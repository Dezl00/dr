import crypto from 'crypto'
import { prisma } from '@/lib/db/prisma'
import { hashPassword } from './password'
import { invalidateAllUserSessions } from './session'

const VERIFICATION_TOKEN_EXPIRY_MS = 1000 * 60 * 60 * 24 // 24 hours
const PASSWORD_RESET_TOKEN_EXPIRY_MS = 1000 * 60 * 60     // 1 hour

/**
 * Generate a random token and its SHA-256 hash.
 */
function generateToken(): { token: string; hash: string } {
  const token = crypto.randomBytes(32).toString('hex')
  const hash = crypto.createHash('sha256').update(token).digest('hex')
  return { token, hash }
}

/**
 * Create an email verification token.
 * Returns the raw token to send in the email.
 */
export async function createVerificationToken(
  userId: string,
  email: string
): Promise<string> {
  // Invalidate any existing tokens for this user
  await prisma.verificationToken.deleteMany({
    where: { userId },
  })

  const { token, hash } = generateToken()

  await prisma.verificationToken.create({
    data: {
      tokenHash: hash,
      userId,
      email,
      expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MS),
    },
  })

  return token
}

/**
 * Verify an email verification token.
 * Marks the user's email as verified and deletes the token.
 */
export async function verifyEmailToken(token: string): Promise<{
  success: boolean
  error?: string
}> {
  const hash = crypto.createHash('sha256').update(token).digest('hex')

  const storedToken = await prisma.verificationToken.findUnique({
    where: { tokenHash: hash },
  })

  if (!storedToken) {
    return { success: false, error: 'رمز التحقق غير صالح.' }
  }

  if (storedToken.usedAt) {
    return { success: false, error: 'تم استخدام رمز التحقق بالفعل.' }
  }

  if (Date.now() >= storedToken.expiresAt.getTime()) {
    return { success: false, error: 'انتهت صلاحية رمز التحقق.' }
  }

  // Mark token as used and verify email
  await prisma.$transaction([
    prisma.verificationToken.update({
      where: { id: storedToken.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: storedToken.userId },
      data: { emailVerified: true },
    }),
  ])

  return { success: true }
}

/**
 * Create a password reset token.
 * Returns the raw token to send in the email.
 * Does not reveal whether the email exists.
 */
export async function createPasswordResetToken(
  email: string
): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  })

  if (!user) {
    // Don't reveal that the email doesn't exist
    return null
  }

  // Invalidate existing reset tokens
  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id },
  })

  const { token, hash } = generateToken()

  await prisma.passwordResetToken.create({
    data: {
      tokenHash: hash,
      userId: user.id,
      email: user.email,
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRY_MS),
    },
  })

  return token
}

/**
 * Reset password using a reset token.
 * Invalidates all existing sessions after reset.
 */
export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const hash = crypto.createHash('sha256').update(token).digest('hex')

  const storedToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hash },
  })

  if (!storedToken) {
    return { success: false, error: 'رابط إعادة تعيين كلمة المرور غير صالح.' }
  }

  if (storedToken.usedAt) {
    return { success: false, error: 'تم استخدام رابط إعادة التعيين بالفعل.' }
  }

  if (Date.now() >= storedToken.expiresAt.getTime()) {
    return { success: false, error: 'انتهت صلاحية رابط إعادة التعيين.' }
  }

  const passwordHash = await hashPassword(newPassword)

  // Update password, mark token used, invalidate sessions
  await prisma.$transaction([
    prisma.passwordResetToken.update({
      where: { id: storedToken.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: storedToken.userId },
      data: { passwordHash },
    }),
  ])

  // Invalidate all sessions outside the transaction
  await invalidateAllUserSessions(storedToken.userId)

  return { success: true }
}
