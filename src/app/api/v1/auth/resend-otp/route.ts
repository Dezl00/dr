import { randomInt } from 'crypto'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { hashPassword } from '@/lib/auth/password'
import { signRegistrationToken, verifyRegistrationToken } from '@/lib/auth/api-auth'
import { sendOtpSms } from '@/lib/whysms'

const cooldownMs = 60 * 1000
const lifetimeMs = 10 * 60 * 1000

export async function POST(req: Request) {
  try {
    const { token } = await req.json()
    if (typeof token !== 'string') {
      return NextResponse.json({ success: false, error: 'جلسة التسجيل غير صالحة' }, { status: 400 })
    }

    const payload = await verifyRegistrationToken(token)
    if (!payload?.pendingRegistrationId) {
      return NextResponse.json({ success: false, error: 'انتهت جلسة التسجيل، أعد إنشاء الحساب.' }, { status: 400 })
    }

    const pending = await prisma.pendingRegistration.findFirst({
      where: { id: payload.pendingRegistrationId, expiresAt: { gt: new Date() } },
    })
    if (!pending) {
      return NextResponse.json({ success: false, error: 'انتهت صلاحية رمز التحقق، أعد إنشاء الحساب.' }, { status: 400 })
    }

    const remaining = cooldownMs - (Date.now() - pending.createdAt.getTime())
    if (remaining > 0) {
      return NextResponse.json(
        { success: false, error: 'يرجى الانتظار قبل طلب رمز جديد', retryAfterSeconds: Math.ceil(remaining / 1000) },
        { status: 429 },
      )
    }

    const code = randomInt(100000, 1000000).toString()
    const otpHash = await hashPassword(code)
    const delivery = await sendOtpSms(pending.phone, code)
    if (!delivery.success) {
      return NextResponse.json({ success: false, error: 'تعذر إرسال رمز التحقق. حاول لاحقاً.' }, { status: 503 })
    }

    const now = new Date()
    const updated = await prisma.pendingRegistration.update({
      where: { id: pending.id },
      data: { otpCode: otpHash, expiresAt: new Date(now.getTime() + lifetimeMs), createdAt: now },
    })
    const registrationToken = await signRegistrationToken({ pendingRegistrationId: updated.id })
    return NextResponse.json({ success: true, message: 'تم إرسال رمز تحقق جديد', registrationToken })
  } catch (error) {
    console.error('Mobile OTP resend error:', error)
    return NextResponse.json({ success: false, error: 'تعذر إعادة إرسال رمز التحقق' }, { status: 500 })
  }
}
