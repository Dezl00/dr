'use client'

import { useActionState, useTransition } from 'react'
import { verifyOtpAction, resendOtpAction } from '@/actions/auth'

export function VerifyOtpForm() {
  const [state, formAction, isPending] = useActionState(verifyOtpAction, null)
  const [isResending, startResending] = useTransition()

  const handleResend = () => {
    startResending(async () => {
      const result = await resendOtpAction()
      if (result?.error) {
        alert(result.error)
      } else {
        alert('تم إرسال الرمز بنجاح')
      }
    })
  }

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="code" className="block text-sm font-medium">
          رمز التحقق
        </label>
        <input
          id="code"
          name="code"
          type="text"
          required
          dir="ltr"
          maxLength={6}
          pattern="[0-9]{6}"
          className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-center tracking-widest text-lg font-bold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="000000"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? 'جاري التحقق...' : 'تأكيد الرمز'}
      </button>
      
      <div className="text-center mt-4">
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="text-sm text-primary hover:underline disabled:opacity-50"
        >
          {isResending ? 'جاري الإرسال...' : 'إعادة إرسال الرمز'}
        </button>
      </div>
    </form>
  )
}
