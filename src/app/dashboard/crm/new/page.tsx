'use client'

import { useActionState } from 'react'
import { createLead } from '@/actions/crm'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BackButton } from '@/components/ui/back-button'
import { SubmitButton } from '@/components/ui/submit-button'

export default function NewLeadPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(createLead, null)

  if (state?.success) {
    router.push('/dashboard/crm')
  }

  return (
    <div className="max-w-2xl">
      <BackButton label="العودة لإدارة العلاقات (CRM)" />
      <div className="mb-6">
        <h1 className="text-xl font-semibold">إضافة عميل محتمل (Lead)</h1>
        <p className="text-sm text-muted-foreground mt-1">تسجيل مريض محتمل للتواصل معه لاحقاً</p>
      </div>

      <form action={formAction} className="space-y-6 bg-card border border-border p-6 rounded-xl shadow-sm">
        {state?.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">الاسم بالكامل</label>
            <input 
              type="text" 
              name="fullName"
              required 
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">رقم الهاتف (للتواصل واتساب/SMS)</label>
            <input 
              type="tel" 
              name="phone"
              required 
              dir="ltr"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-left"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">المصدر</label>
            <Select name="source" defaultValue="MANUAL">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MANUAL">إدخال يدوي / مكالمة</SelectItem>
                <SelectItem value="SOCIAL">السوشيال ميديا (فيسبوك/انستجرام)</SelectItem>
                <SelectItem value="WEBSITE">الموقع الإلكتروني</SelectItem>
                <SelectItem value="REFERRAL">توصية من مريض آخر</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">ملاحظات أو استفسار المريض</label>
            <textarea 
              name="notes" 
              rows={3} 
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              placeholder="يسأل عن تكلفة تقويم الأسنان..."
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-border">
          <SubmitButton 
            label="حفظ البيانات"
            loadingLabel="جاري الحفظ..."
          />
          <Link href="/dashboard/crm" className="inline-flex items-center justify-center rounded-lg border px-6 py-2 text-sm font-medium transition hover:bg-accent">
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  )
}
