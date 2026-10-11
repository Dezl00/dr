import { NextResponse } from 'next/server'

import { prisma } from '@/lib/db/prisma'
import { issueOtpForUser } from '@/lib/otp'
import { phoneLookupVariants } from '@/lib/whysms'

export async function POST(req: Request) {
  try {
    const { phone } = await req.json()
    if (typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json({ success: false, error: 'الرجاء إدخال رقم الهاتف' }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: { phone: { in: phoneLookupVariants(phone) } },
      select: { id: true, phone: true },
    })
    if (!user?.phone) {
      return NextResponse.json({ success: false, error: 'رقم الهاتف غير مسجل لدينا' }, { status: 404 })
    }

    const result = await issueOtpForUser(user.id, user.phone)
    if (!result.success) {
      const status = result.retryAfterSeconds ? 429 : 503
      return NextResponse.json({ success: false, error: result.error, retryAfterSeconds: result.retryAfterSeconds }, { status })
    }

    return NextResponse.json({ success: true, message: 'تم إرسال رمز التحقق' })
  } catch (error) {
    console.error('Forgot-password OTP error:', error)
    return NextResponse.json({ success: false, error: 'تعذر إرسال رمز التحقق' }, { status: 500 })
  }
}
