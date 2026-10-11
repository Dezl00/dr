import { NextResponse } from 'next/server'

import { prisma } from '@/lib/db/prisma'
import { hashPassword } from '@/lib/auth/password'
import { consumeOtpForUser } from '@/lib/otp'
import { phoneLookupVariants } from '@/lib/whysms'

export async function POST(req: Request) {
  try {
    const { phone, code, newPassword } = await req.json()
    if (typeof phone !== 'string' || typeof code !== 'string' || typeof newPassword !== 'string') {
      return NextResponse.json({ success: false, error: 'البيانات غير مكتملة' }, { status: 400 })
    }
    if (newPassword.length < 8 || newPassword.length > 128) {
      return NextResponse.json({ success: false, error: 'كلمة المرور يجب أن تتكون من 8 أحرف على الأقل' }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: { phone: { in: phoneLookupVariants(phone) } },
      select: { id: true },
    })
    if (!user) return NextResponse.json({ success: false, error: 'المستخدم غير موجود' }, { status: 404 })

    const verified = await consumeOtpForUser(user.id, code)
    if (!verified) return NextResponse.json({ success: false, error: 'رمز التحقق غير صحيح أو منتهي الصلاحية' }, { status: 400 })

    const passwordHash = await hashPassword(newPassword)
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } })
    return NextResponse.json({ success: true, message: 'تمت إعادة تعيين كلمة المرور بنجاح' })
  } catch (error) {
    console.error('Reset-password error:', error)
    return NextResponse.json({ success: false, error: 'تعذر إعادة تعيين كلمة المرور' }, { status: 500 })
  }
}
