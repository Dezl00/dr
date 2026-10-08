'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

export default function NewExpensePage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      try {
        // We will call the actual server action here. Let's assume it exists in financials.ts
        const { recordExpense } = await import('@/actions/financials')
        const result = await recordExpense(formData)
        
        if (result?.error) {
          setError(result.error)
        } else {
          router.push('/dashboard/financials')
        }
      } catch (err) {
        setError('حدث خطأ غير متوقع')
      }
    })
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-6">تسجيل مصروف جديد</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border p-6 rounded-xl">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">تصنيف المصروف</label>
            <Select name="category" required>
              <SelectTrigger>
                <SelectValue placeholder="اختر التصنيف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SALARIES">رواتب وأجور</SelectItem>
                <SelectItem value="RENT">إيجار</SelectItem>
                <SelectItem value="SUPPLIES">مستلزمات طبية/أدوية</SelectItem>
                <SelectItem value="UTILITIES">مرافق (كهرباء، مياه، إنترنت)</SelectItem>
                <SelectItem value="MARKETING">تسويق وإعلانات</SelectItem>
                <SelectItem value="MAINTENANCE">صيانة</SelectItem>
                <SelectItem value="OTHER">أخرى</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">المبلغ</label>
            <input name="amount" type="number" step="0.01" min="0" required className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium">البيان (الوصف)</label>
            <input name="description" type="text" required className="w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder="مثال: شراء أدوات حشو، راتب شهر مارس..." />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">تاريخ المصروف</label>
            <input name="expenseDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'جاري الحفظ...' : 'حفظ المصروف'}
          </Button>
          <Link href="/dashboard/financials" className="inline-flex items-center justify-center rounded-lg border px-6 py-2 text-sm font-medium transition hover:bg-accent">
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  )
}
