'use client'

import { useActionState } from 'react'
import { addInventoryItem } from '@/actions/inventory'
import Link from 'next/link'

export default function NewInventoryItemPage() {
  const [state, formAction, isPending] = useActionState(addInventoryItem, null)

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-6">إضافة صنف للمخزن</h1>
      
      <form action={formAction} className="space-y-6 bg-card border border-border p-6 rounded-xl">
        {state?.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {state.error}
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">اسم الصنف</label>
            <input name="name" type="text" required className="w-full rounded-lg border bg-background px-3 py-2" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">كود الصنف (SKU)</label>
            <input name="sku" type="text" dir="ltr" className="w-full text-left rounded-lg border bg-background px-3 py-2" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">التصنيف</label>
            <input name="category" type="text" className="w-full rounded-lg border bg-background px-3 py-2" placeholder="أدوات، مستهلكات، أدوية..." />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">الوحدة</label>
            <input name="unit" type="text" required className="w-full rounded-lg border bg-background px-3 py-2" placeholder="علبة، قطعة، مل..." />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">الكمية الافتتاحية</label>
            <input name="quantity" type="number" required defaultValue="0" min="0" className="w-full rounded-lg border bg-background px-3 py-2" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">الحد الأدنى للتنبيه</label>
            <input name="minQuantity" type="number" required defaultValue="5" min="0" className="w-full rounded-lg border bg-background px-3 py-2" />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={isPending} className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white transition hover:bg-primary/90">
            {isPending ? 'جاري الحفظ...' : 'حفظ الصنف'}
          </button>
          <Link href="/dashboard/inventory" className="rounded-lg border px-6 py-2 text-sm font-medium transition hover:bg-accent">
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  )
}
