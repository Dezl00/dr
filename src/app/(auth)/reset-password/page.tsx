import type { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata: Metadata = {
  title: 'إعادة تعيين كلمة المرور | DRS',
}

export default async function ResetPasswordPage(props: { searchParams: Promise<{ phone?: string }> }) {
  const searchParams = await props.searchParams;
  const phone = searchParams.phone || '';

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-page-title mb-2">إعادة تعيين كلمة المرور</h1>
        <p className="text-body text-muted-foreground">
          أدخل رمز التحقق المرسل إلى {phone} وكلمة المرور الجديدة
        </p>
      </div>

      <ResetPasswordForm phone={phone} />
    </div>
  )
}
