'use client'

import { useState, useTransition } from 'react'
import { recordPayment } from '@/actions/financials'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

export function PaymentForm({ invoiceId, remaining }: { invoiceId: string, remaining: number }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const handlePayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    const formData = new FormData(e.currentTarget)
    const amount = parseFloat(formData.get('amount') as string)
    const method = formData.get('method') as any

    if (!amount || amount <= 0) {
      setError('المبلغ غير صحيح')
      return
    }

    if (amount > remaining) {
      setError('المبلغ المدفوع أكبر من المتبقي')
      return
    }

    startTransition(async () => {
      const res = await recordPayment(invoiceId, amount, method)
      if (res?.error) {
        setError(res.error)
      } else {
        e.currentTarget.reset()
      }
    })
  }

  return (
    <form onSubmit={handlePayment} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">المبلغ المدفوع</label>
        <div className="relative">
          <input 
            name="amount" 
            type="number" 
            min="1" 
            max={remaining}
            step="0.01"
            defaultValue={remaining}
            required 
            dir="ltr"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-left pr-12" 
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">EGP</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">طريقة الدفع</label>
        <Select name="method" required defaultValue="CASH">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CASH">كاش (نقداً)</SelectItem>
            <SelectItem value="CARD">فيزا / ماستركارد</SelectItem>
            <SelectItem value="TRANSFER">تحويل بنكي / محافظ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'جاري التسجيل...' : 'تأكيد الدفع'}
      </Button>
    </form>
  )
}
