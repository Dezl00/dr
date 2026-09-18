import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'نسيت كلمة المرور | DRS',
}

export default function ForgotPasswordPage() {
  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-page-title mb-2">نسيت كلمة المرور</h1>
        <p className="text-body text-muted-foreground">
          أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور
        </p>
      </div>

      <form className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            البريد الإلكتروني
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            dir="ltr"
            className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          إرسال رابط الاستعادة
        </button>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            العودة لتسجيل الدخول
          </Link>
        </p>
      </form>
    </div>
  )
}
