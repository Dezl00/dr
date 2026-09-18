'use client'

import { useActionState, useState, useCallback, useEffect, useTransition } from 'react'
import { signupAction, checkSlugAvailability } from '@/actions/auth'
import Link from 'next/link'

// Simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

// Arabic-to-English slug generation (client-side preview)
const TRANSLATIONS: Record<string, string> = {
  'عيادة': 'clinic', 'عيادات': 'clinics', 'مركز': 'center',
  'لطب': '', 'طب': '', 'الأسنان': 'dental', 'اسنان': 'dental',
  'النور': 'alnoor', 'الابتسامة': 'smile', 'سمايل': 'smile',
  'الحديثة': 'modern', 'الحديث': 'modern',
  'الرحمة': 'alrahma', 'الشفاء': 'alshifa', 'الأمل': 'alamal',
  'دكتور': 'dr', 'دكتورة': 'dr',
}

const TRANSLIT: Record<string, string> = {
  'ا': 'a', 'أ': 'a', 'إ': 'e', 'آ': 'a',
  'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'g', 'ح': 'h', 'خ': 'kh',
  'د': 'd', 'ذ': 'th', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
  'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh',
  'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
  'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a', 'ة': 'a',
  'ء': '', 'ئ': 'e', 'ؤ': 'o',
}

function generateSlug(name: string): string {
  if (!name.trim()) return ''
  let s = name.trim()
  const sorted = Object.entries(TRANSLATIONS).sort(([a], [b]) => b.length - a.length)
  for (const [ar, en] of sorted) {
    s = s.replace(new RegExp(ar, 'g'), en ? ` ${en} ` : ' ')
  }
  s = s.replace(/[\u064B-\u065F\u0670]/g, '').replace(/\u0640/g, '')
  let result = ''
  for (const c of s) {
    result += TRANSLIT[c] !== undefined ? TRANSLIT[c] : c
  }
  return result.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').substring(0, 63)
}

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupAction, null)
  const [step, setStep] = useState(1)
  const [clinicName, setClinicName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [slugError, setSlugError] = useState('')
  const [, startTransition] = useTransition()

  const debouncedSlug = useDebounce(slug, 500)

  // Auto-generate slug when clinic name changes
  useEffect(() => {
    if (!slugEdited && clinicName) {
      setSlug(generateSlug(clinicName))
    }
  }, [clinicName, slugEdited])

  // Check slug availability
  useEffect(() => {
    if (!debouncedSlug || debouncedSlug.length < 3) {
      setSlugStatus('idle')
      return
    }

    setSlugStatus('checking')
    startTransition(async () => {
      const result = await checkSlugAvailability(debouncedSlug)
      if (result.available) {
        setSlugStatus('available')
        setSlugError('')
      } else {
        setSlugStatus('taken')
        setSlugError(result.error || 'غير متاح')
      }
    })
  }, [debouncedSlug])

  const handleSlugChange = useCallback((value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/--+/g, '-')
    setSlug(cleaned)
    setSlugEdited(true)
  }, [])

  const rootDomain = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000').replace(/:\d+$/, '')
    : 'platform.com'

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </div>
      )}

      {/* Step 1: Account Info */}
      <div className={step === 1 ? 'block' : 'hidden'}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="fullName" className="block text-sm font-medium">
              الاسم الكامل
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required={step === 1}
              className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="د. محمد أحمد"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              البريد الإلكتروني
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required={step === 1}
              dir="ltr"
              className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-medium">
              رقم الهاتف
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required={step === 1}
              dir="ltr"
              className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="01xxxxxxxxx"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">
              كلمة المرور
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required={step === 1}
              dir="ltr"
              minLength={8}
              className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium">
              تأكيد كلمة المرور
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required={step === 1}
              dir="ltr"
              minLength={8}
              className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            التالي
          </button>
        </div>
      </div>

      {/* Step 2: Clinic Info + Slug */}
      <div className={step === 2 ? 'block' : 'hidden'}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="clinicName" className="block text-sm font-medium">
              اسم العيادة
            </label>
            <input
              id="clinicName"
              name="clinicName"
              type="text"
              required={step === 2}
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="عيادة النور لطب الأسنان"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="slug" className="block text-sm font-medium">
              عنوان الموقع الفرعي
            </label>
            <div dir="ltr" className="flex items-center rounded-lg border border-border bg-background px-3">
              <input
                id="slug"
                name="slug"
                type="text"
                required={step === 2}
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                dir="ltr"
                className="w-full min-w-0 flex-1 bg-transparent py-2.5 text-sm focus:outline-none text-right"
                placeholder="clinic-name"
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap pl-1" dir="ltr">
                .{rootDomain}
              </span>
            </div>

            {/* Availability indicator */}
            {slug.length >= 3 && (
              <div className="text-sm">
                {slugStatus === 'checking' && (
                  <span className="text-muted-foreground">جاري التحقق...</span>
                )}
                {slugStatus === 'available' && (
                  <span className="text-emerald-600 dark:text-emerald-400">✓ متاح</span>
                )}
                {slugStatus === 'taken' && (
                  <span className="text-red-600 dark:text-red-400">✗ {slugError}</span>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
            >
              السابق
            </button>
            <button
              type="submit"
              disabled={isPending || slugStatus !== 'available'}
              className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? 'جاري الإنشاء...' : 'إنشاء العيادة'}
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        لديك حساب بالفعل؟{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          تسجيل الدخول
        </Link>
      </p>
    </form>
  )
}
