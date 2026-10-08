'use client'

import { useActionState, useState } from 'react'
import { createInvoice } from '@/actions/financials'
import Link from 'next/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { SubmitButton } from '@/components/ui/submit-button'

export function InvoiceForm({ patients }: { patients: {id: string, fullName: string}[] }) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(createInvoice, null)
  const [items, setItems] = useState([{ desc: '', qty: 1, price: 0 }])
  const [initialPayment, setInitialPayment] = useState<number>(0)

  const total = items.reduce((acc, curr) => acc + (curr.qty * curr.price), 0)
  const remaining = total - initialPayment

  if (state?.success) {
    router.push('/dashboard/financials')
  }

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
          <div key={idx} className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
            <div className="flex-1 w-full sm:w-auto">
              <input type="text" name={`items[${idx}][desc]`} required placeholder="الوصف (مثال: حشو عصب)" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" 
                value={item.desc} onChange={(e) => {
                  const newItems = [...items]
                  newItems[idx].desc = e.target.value
                  setItems(newItems)
                }}
              />
            </div>
            <div className="w-full sm:w-24">
              <input type="number" name={`items[${idx}][qty]`} required min="1" placeholder="الكمية" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" 
                value={item.qty} onChange={(e) => {
                  const newItems = [...items]
                  newItems[idx].qty = parseInt(e.target.value) || 0
                  setItems(newItems)
                }}
              />
            </div>
            <div className="w-full sm:w-32">
              <input type="number" name={`items[${idx}][price]`} required min="0" placeholder="السعر" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" 
                value={item.price} onChange={(e) => {
                  const newItems = [...items]
                  newItems[idx].price = parseInt(e.target.value) || 0
                  setItems(newItems)
                }}
              />
            </div>
            <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => {
              if(items.length > 1) setItems(items.filter((_, i) => i !== idx))
            }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setItems([...items, { desc: '', qty: 1, price: 0 }])}>
          <Plus className="h-4 w-4" /> إضافة بند جديد
        </Button>
      </div>

      <input type="hidden" name="total" value={total} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
        {/* Payment Section in the same form */}
        <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border">
          <h3 className="font-semibold text-primary">تسديد دفعة مبدئية (اختياري)</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">المدفوع الآن</label>
            <div className="relative">
              <input 
                name="initialPayment" 
                type="number" 
                min="0" 
                max={total}
                step="0.01"
                value={initialPayment || ''}
                onChange={(e) => setInitialPayment(parseFloat(e.target.value) || 0)}
                dir="ltr"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm pr-12 text-left" 
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">EGP</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">طريقة الدفع</label>
            <Select name="paymentMethod" defaultValue="CASH">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">كاش (نقداً)</SelectItem>
                <SelectItem value="CARD">فيزا / ماستركارد</SelectItem>
                <SelectItem value="BANK_TRANSFER">تحويل بنكي / محافظ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4 p-4 flex flex-col justify-center">
          <div className="flex justify-between items-center text-lg">
            <span className="font-medium">الإجمالي</span>
            <span className="font-bold" dir="ltr">{total.toLocaleString()} EGP</span>
          </div>
          <div className="flex justify-between items-center text-lg text-green-600 border-t border-border pt-2">
            <span className="font-medium">المدفوع</span>
            <span className="font-bold" dir="ltr">- {initialPayment.toLocaleString()} EGP</span>
          </div>
          <div className="flex justify-between items-center text-xl text-red-500 border-t border-border pt-2">
            <span className="font-bold">المتبقي (المديونية)</span>
            <span className="font-bold" dir="ltr">{remaining.toLocaleString()} EGP</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-4">
        <label className="text-sm font-medium">ملاحظات الفاتورة (تظهر في الطباعة)</label>
        <textarea name="notes" rows={2} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
      </div>

      <div className="flex gap-3">
        <SubmitButton 
          label="حفظ وإصدار الفاتورة"
          loadingLabel="جاري الحفظ..."
        />
        <Link href="/dashboard/financials" className="inline-flex items-center justify-center rounded-lg border px-6 py-2 text-sm font-medium transition hover:bg-accent">
          إلغاء
        </Link>
      </div>
    </form>
  )
}
