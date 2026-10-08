'use client'

import { useState, useTransition } from 'react'
import { adjustStock } from '@/actions/inventory'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

export function StockAdjustmentForm({ itemId, currentQuantity }: { itemId: string, currentQuantity: number }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const formData = new FormData(e.currentTarget)
    const type = formData.get('type') as string
    const qty = parseInt(formData.get('quantity') as string)
    const notes = formData.get('notes') as string

    if (!qty || qty <= 0) {
      setError('الكمية يجب أن تكون أكبر من صفر')
      return
    }

    if (type === 'OUT' && qty > currentQuantity) {
      setError('الكمية المنصرفة أكبر من الرصيد الحالي')
      return
    }

    const change = type === 'IN' ? qty : -qty

    startTransition(async () => {
      const res = await adjustStock(itemId, change, notes)
      if (res?.error) {
        setError(res.error)
      } else {
        setSuccess('تم تسجيل الحركة بنجاح')
        e.currentTarget.reset()
      }
    })
  }

  return (
    <form onSubmit={handleUpdate} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">نوع الحركة</label>
        <Select name="type" required defaultValue="OUT">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="OUT">صرف (استهلاك / تالف)</SelectItem>
            <SelectItem value="IN">إضافة (شراء / وارد جديد)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">الكمية</label>
        <input 
          name="quantity" 
          type="number" 
          min="1" 
          required 
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm" 
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">البيان / ملاحظات</label>
        <textarea 
          name="notes" 
          rows={3} 
          required 
          placeholder="سبب الصرف أو رقم فاتورة الشراء..."
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm" 
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'جاري الحفظ...' : 'حفظ الحركة'}
      </Button>
    </form>
  )
}
