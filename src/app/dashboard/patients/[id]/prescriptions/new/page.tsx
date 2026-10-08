'use client'

import { useActionState, useState, use } from 'react'
import { createPrescription } from '@/actions/prescriptions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { BackButton } from '@/components/ui/back-button'
import { SubmitButton } from '@/components/ui/submit-button'

export default function NewPrescriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: patientId } = use(params)
  const router = useRouter()
  
  const createAction = createPrescription.bind(null, patientId)
  const [state, formAction, isPending] = useActionState(createAction, null)

  const [meds, setMeds] = useState([{ name: '', dosage: '', frequency: '' }])

  if (state?.success) {
    router.push(`/dashboard/patients/${patientId}`)
  }

  return (
    <div className="max-w-3xl">
      <BackButton label="العودة لملف المريض" />
      <div className="mb-6">
        <h1 className="text-xl font-semibold">كتابة روشتة جديدة</h1>
        <p className="text-sm text-muted-foreground mt-1">إضافة الأدوية والجرعات للمريض</p>
      </div>

      <form action={formAction} className="space-y-6 bg-card border border-border p-6 rounded-xl">
        {state?.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <div className="space-y-4">
          {meds.map((med, idx) => (
            <div key={idx} className="flex flex-wrap sm:flex-nowrap gap-3 items-start bg-muted/30 p-3 rounded-lg border border-border">
              <div className="flex-1 w-full sm:w-auto">
                <label className="text-xs text-muted-foreground mb-1 block">اسم الدواء</label>
                <input 
                  type="text" 
                  name={`medications[${idx}][name]`}
                  required 
                  placeholder="مثال: Augmentin 1gm"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={med.name}
                  onChange={e => {
                    const newMeds = [...meds]; newMeds[idx].name = e.target.value; setMeds(newMeds)
                  }}
                />
              </div>
              <div className="w-full sm:w-32">
                <label className="text-xs text-muted-foreground mb-1 block">الجرعة (التركيز)</label>
                <input 
                  type="text" 
                  name={`medications[${idx}][dosage]`}
                  placeholder="مثال: قرص واحد"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={med.dosage}
                  onChange={e => {
                    const newMeds = [...meds]; newMeds[idx].dosage = e.target.value; setMeds(newMeds)
                  }}
                />
              </div>
              <div className="flex-1 w-full sm:w-auto">
                <label className="text-xs text-muted-foreground mb-1 block">التكرار / المدة</label>
                <input 
                  type="text" 
                  name={`medications[${idx}][frequency]`}
                  placeholder="مثال: كل 12 ساعة لمدة 5 أيام"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={med.frequency}
                  onChange={e => {
                    const newMeds = [...meds]; newMeds[idx].frequency = e.target.value; setMeds(newMeds)
                  }}
                />
              </div>
              <div className="pt-5">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    if(meds.length > 1) {
                      setMeds(meds.filter((_, i) => i !== idx))
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => setMeds([...meds, { name: '', dosage: '', frequency: '' }])}
          >
            <Plus className="h-4 w-4" /> إضافة دواء آخر
          </Button>
        </div>

        <div className="space-y-2 border-t border-border pt-4">
          <label className="text-sm font-medium">تعليمات وملاحظات الطبيب (تُطبع في الروشتة)</label>
          <textarea 
            name="notes" 
            rows={3} 
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            placeholder="الراحة التامة، تجنب الأطعمة الساخنة..."
          />
        </div>

        <div className="flex gap-3 pt-4 border-t border-border">
          <SubmitButton 
            label="حفظ وإصدار الروشتة"
            loadingLabel="جاري الحفظ..."
          />
          <Link href={`/dashboard/patients/${patientId}`} className="inline-flex items-center justify-center rounded-lg border px-6 py-2 text-sm font-medium transition hover:bg-accent">
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  )
}
