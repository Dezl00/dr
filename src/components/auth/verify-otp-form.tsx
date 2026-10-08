'use client'

import { useActionState, useTransition, useState, useEffect, useRef } from 'react'
import { verifyOtpAction, resendOtpAction } from '@/actions/auth'

export function VerifyOtpForm() {
  const [state, formAction, isPending] = useActionState(verifyOtpAction, null)
  const [isResending, startResending] = useTransition()
  
  // Countdown state
  const [timeLeft, setTimeLeft] = useState(60)

  // OTP state
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const handleResend = () => {
    if (timeLeft > 0) return

    startResending(async () => {
      const result = await resendOtpAction()
      if (result?.error) {
        alert(result.error)
      } else {
        alert('تم إرسال الرمز بنجاح')
        setTimeLeft(60) // Reset timer
      }
    })
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Only numbers

    // Handle pasting multiple characters
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

    // Single character input
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
              className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold bg-background border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all"
            />
          ))}
        </div>
        {/* Hidden input to pass the code to server action */}
        <input type="hidden" name="code" value={code.join('')} />
      </div>

      <button
        type="submit"
        disabled={isPending || code.join('').length < 6}
        className="w-full rounded-xl bg-primary px-4 py-3.5 text-base font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? 'جاري التحقق...' : 'تأكيد الرمز'}
      </button>
      
      <div className="text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || timeLeft > 0}
          className="text-sm font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline transition-all"
        >
          {isResending ? 'جاري الإرسال...' : timeLeft > 0 ? `يمكنك إعادة الإرسال بعد ${timeLeft} ثانية` : 'إعادة إرسال الرمز'}
        </button>
      </div>
    </form>
  )
}
