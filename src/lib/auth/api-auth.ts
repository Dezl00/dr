import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { prisma } from '@/lib/db/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_in_production_for_drs_app'
const secretKey = new TextEncoder().encode(JWT_SECRET)

export interface MobileJwtPayload extends JWTPayload {
  userId: string
  email: string
  clinicId: string
  roleId: string
}

/**
 * Sign a JWT token for mobile app authentication.
 */
export async function signMobileToken(payload: Omit<MobileJwtPayload, 'iat' | 'exp'>) {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d') // Long-lived token for mobile apps
    .sign(secretKey)
}

export interface RegistrationJwtPayload extends JWTPayload {
  registrationData: any;
  otpHash: string;
}

export async function signRegistrationToken(payload: Omit<RegistrationJwtPayload, 'iat' | 'exp'>) {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secretKey)
}

export async function verifyRegistrationToken(token: string): Promise<RegistrationJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey)
    return payload as RegistrationJwtPayload
  } catch (error) {
    return null
  }
}

/**
 * Verify and decode a mobile JWT token.
 */
export async function verifyMobileToken(token: string): Promise<MobileJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey)
    return payload as MobileJwtPayload
  } catch (error) {
    return null
  }
}

/**
 * Middleware-like function for Next.js API Routes to enforce authentication.
 * Pass the Request object. Returns the user and clinic data if valid.
 */
export async function requireApiAuth(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: Missing or invalid Authorization header')
  }

  const token = authHeader.split(' ')[1]
  const payload = await verifyMobileToken(token)

  if (!payload) {
    throw new Error('Unauthorized: Invalid or expired token')
  }

  // Ensure user exists and is active
  const user = await prisma.user.findUnique({
    where: { id: payload.userId, status: 'ACTIVE' },
    select: { id: true, email: true, fullName: true, status: true, phoneVerified: true }
  })

  if (!user) {
    throw new Error('Unauthorized: User not found or inactive')
  }

  // Ensure membership is still valid
  const membership = await prisma.clinicMembership.findUnique({
    where: {
      userId_clinicId: {
        userId: payload.userId,
        clinicId: payload.clinicId
      }
    },
    include: {
      role: true,
      clinic: {
        select: { id: true, name: true, slug: true, status: true, timezone: true }
      }
    }
  })

  if (!membership || membership.status !== 'ACTIVE' || membership.clinic.status !== 'ACTIVE') {
    throw new Error('Forbidden: Clinic membership is invalid or inactive')
  }

  return { user, clinic: membership.clinic, role: membership.role }
}

/**
 * Enforce Super Admin authentication for platform management APIs.
 */
export async function requireSuperAdminApiAuth(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: Missing or invalid Authorization header')
  }

  const token = authHeader.split(' ')[1]
  const payload = await verifyMobileToken(token)

  if (!payload) {
    throw new Error('Unauthorized: Invalid or expired token')
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId, status: 'ACTIVE' },
  })

  if (!user || !user.isSuperAdmin) {
    throw new Error('Forbidden: Super Admin access required')
  }

  return { user }
}

