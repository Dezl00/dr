import { SignupForm } from '@/components/auth/signup-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'إنشاء حساب | DRS',
  description: 'إنشاء حساب جديد على منصة إدارة العيادات',
}

export default function SignupPage() {
  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-page-title mb-2">إنشاء حساب جديد</h1>
        <p className="text-body text-muted-foreground">
          ابدأ بإنشاء حسابك وعيادتك الآن
        </p>
      </div>
      <SignupForm />
    </div>
  )
}
