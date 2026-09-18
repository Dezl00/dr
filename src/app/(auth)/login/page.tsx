import { LoginForm } from '@/components/auth/login-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'تسجيل الدخول | DRS',
  description: 'تسجيل الدخول إلى منصة إدارة العيادات',
}

export default function LoginPage() {
  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-page-title mb-2">تسجيل الدخول</h1>
        <p className="text-body text-muted-foreground">
          أدخل بيانات حسابك للمتابعة
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
