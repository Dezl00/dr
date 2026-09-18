'use client'

import { useActionState } from 'react'
import { createPatientAction } from '@/actions/patients'
import Link from 'next/link'

export function PatientForm() {
  const [state, formAction, isPending] = useActionState(createPatientAction, null)

  return (
    <form action={formAction} className="max-w-2xl">
      {state?.error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="fullName" className="block text-sm font-medium">الاسم الكامل</label>
            <input
              id="fullName" name="fullName" type="text" required
              className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-medium">رقم الهاتف</label>
            <input
              id="phone" name="phone" type="tel" dir="ltr"
              className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">البريد الإلكتروني</label>
            <input
              id="email" name="email" type="email" dir="ltr"
              className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="dateOfBirth" className="block text-sm font-medium">تاريخ الميلاد</label>
            <input
              id="dateOfBirth" name="dateOfBirth" type="date" dir="ltr"
              className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="gender" className="block text-sm font-medium">النوع</label>
            <select
              id="gender" name="gender"
              className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">اختيار</option>
              <option value="MALE">ذكر</option>
              <option value="FEMALE">أنثى</option>
            </select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium">العنوان</label>
            <input
              id="address" name="address" type="text"
              className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium">ملاحظات</label>
            <textarea
              id="notes" name="notes" rows={3}
              className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          type="submit" disabled={isPending}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? 'جارٍ الحفظ...' : 'حفظ'}
        </button>
        <Link
          href="/dashboard/patients"
          className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
        >
          إلغاء
        </Link>
      </div>
    </form>
  )
}
