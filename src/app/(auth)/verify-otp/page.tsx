import { getCurrentUser } from '@/lib/auth/dal'
import { redirect } from 'next/navigation'
import { VerifyOtpForm } from '@/components/auth/verify-otp-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'تأكيد رقم الهاتف | DRS',
  description: 'قم بتأكيد رقم هاتفك للاستمرار',
}

export default async function VerifyOtpPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.phoneVerified) {
    redirect('/dashboard')
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-page-title mb-2">تأكيد رقم الهاتف</h1>
        <p className="text-body text-muted-foreground">
          أدخل الرمز المكون من 6 أرقام المرسل إلى {user.phone}
        </p>
      </div>
      <VerifyOtpForm />
      
      <div className="mt-6 text-center">
        <form action={async () => {
          'use server'
          const { logoutAction } = await import('@/actions/auth')
          await logoutAction()
        }}>
          <button type="submit" className="text-sm text-muted-foreground hover:text-foreground underline">
            تسجيل الخروج أو استخدام حساب مختلف
          </button>
        </form>
      </div>
    </div>
  )
}
