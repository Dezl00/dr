import type { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export const metadata: Metadata = {
  title: 'نسيت كلمة المرور | DRS',
}

export default function ForgotPasswordPage() {
  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-page-title mb-2">نسيت كلمة المرور</h1>
        <p className="text-body text-muted-foreground">
          أدخل رقم هاتفك وسنرسل لك رمز التحقق لإعادة تعيين كلمة المرور
        </p>
      </div>

      <ForgotPasswordForm />
    </div>
  )
}
