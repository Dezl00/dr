'use client'

import { useActionState, useRef, useState } from 'react'
import { resetPasswordAction } from '@/actions/auth'

export function ResetPasswordForm({ phone }: { phone: string }) {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, null)

  // OTP state
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    if (value.length > 1) {
      const pasted = value.slice(0, 6).split('')
      const newCode = [...code]
      pasted.forEach((char, i) => {
        if (i < 6) newCode[i] = char
      })
      setCode(newCode)
      const nextIndex = Math.min(pasted.length, 5)
      inputRefs.current[nextIndex]?.focus()
      return
    }

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && code[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </div>
      )}

      <input type="hidden" name="phone" value={phone} />

      <div className="space-y-4">
        <label className="block text-sm font-medium text-center">
          رمز التحقق
        </label>
        <div className="flex justify-center gap-2 sm:gap-3" dir="ltr">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold bg-background border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all"
            />
          ))}
        </div>
        <input type="hidden" name="code" value={code.join('')} />
      </div>

      <div className="space-y-4 pt-4 border-t border-border">
        <div className="space-y-2">
          <label className="block text-sm font-medium">كلمة المرور الجديدة</label>
          <input
            name="newPassword"
            type="password"
            required
            dir="ltr"
            className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">تأكيد كلمة المرور</label>
          <input
            name="confirmPassword"
            type="password"
            required
            dir="ltr"
            className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || code.join('').length < 6}
        className="w-full rounded-xl bg-primary px-4 py-3.5 text-base font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? 'جاري الحفظ...' : 'إعادة تعيين'}
      </button>
    </form>
  )
}
