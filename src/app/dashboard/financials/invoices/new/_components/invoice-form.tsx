'use client'

import { useActionState, useState } from 'react'
import { createInvoice } from '@/actions/financials'
import Link from 'next/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

export function InvoiceForm({ patients }: { patients: {id: string, fullName: string}[] }) {
  const [state, formAction, isPending] = useActionState(createInvoice, null)
  const [items, setItems] = useState([{ desc: '', qty: 1, price: 0 }])

  const total = items.reduce((acc, curr) => acc + (curr.qty * curr.price), 0)

  return (
    <form action={formAction} className="space-y-6 bg-card border border-border p-6 rounded-xl">
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}
      
      <div className="space-y-2 max-w-sm">
        <label className="text-sm font-medium">المريض</label>
        <Select name="patientId" required>
          <SelectTrigger>
            <SelectValue placeholder="اختر المريض" />
          </SelectTrigger>
          <SelectContent>
            {patients.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.fullName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="font-semibold text-sm">البنود والخدمات</h3>
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-4 items-center">
            <div className="flex-1">
              <input type="text" placeholder="الوصف (مثال: حشو عصب)" className="w-full rounded-lg border px-3 py-2 text-sm" 
                value={item.desc} onChange={(e) => {
                  const newItems = [...items]
                  newItems[idx].desc = e.target.value
                  setItems(newItems)
                }}
              />
            </div>
            <div className="w-24">
              <input type="number" min="1" placeholder="الكمية" className="w-full rounded-lg border px-3 py-2 text-sm" 
                value={item.qty} onChange={(e) => {
                  const newItems = [...items]
                  newItems[idx].qty = parseInt(e.target.value) || 0
                  setItems(newItems)
                }}
              />
            </div>
            <div className="w-32">
              <input type="number" min="0" placeholder="السعر" className="w-full rounded-lg border px-3 py-2 text-sm" 
                value={item.price} onChange={(e) => {
                  const newItems = [...items]
                  newItems[idx].price = parseFloat(e.target.value) || 0
                  setItems(newItems)
                }}
              />
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => setItems([...items, { desc: '', qty: 1, price: 0 }])}>
          + إضافة بند
        </Button>
      </div>

      <div className="pt-4 border-t border-border flex justify-between items-center">
        <div className="space-y-2 w-1/2">
          <label className="text-sm font-medium">ملاحظات (اختياري)</label>
          <textarea name="notes" className="w-full rounded-lg border px-3 py-2 text-sm" rows={2}></textarea>
        </div>
        <div className="text-left bg-muted/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">الإجمالي</p>
          <p className="text-2xl font-bold" dir="ltr">{total.toLocaleString()} EGP</p>
          <input type="hidden" name="total" value={total} />
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-border">
        <Button type="submit" disabled={isPending || total === 0}>
          {isPending ? 'جاري الإنشاء...' : 'حفظ وإنشاء الفاتورة'}
        </Button>
        <Link href="/dashboard/financials" className="inline-flex items-center justify-center rounded-lg border px-6 py-2 text-sm font-medium transition hover:bg-accent">
          إلغاء
        </Link>
      </div>
    </form>
  )
}
