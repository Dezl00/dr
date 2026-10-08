'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateMedicalHistory } from '@/actions/emr'
import { useActionState } from 'react'

export function PatientMedicalHistory({ patientId, history }: { patientId: string, history: any }) {
  const updateAction = updateMedicalHistory.bind(null, patientId)
  const [state, formAction, isPending] = useActionState(updateAction, null)

  return (
    <div className="max-w-2xl bg-card border border-border p-6 rounded-xl">
      <h2 className="text-xl font-semibold mb-6">التاريخ الطبي للمريض</h2>
      
      <form action={formAction} className="space-y-6">
        {state?.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {state.error}
          </div>
        )}
        {state?.success && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            تم حفظ السجل الطبي بنجاح.
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="bloodType">فصيلة الدم</Label>
          <Select defaultValue={history?.bloodType || ''} name="bloodType">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="اختر فصيلة الدم" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A+">A+</SelectItem>
              <SelectItem value="A-">A-</SelectItem>
              <SelectItem value="B+">B+</SelectItem>
              <SelectItem value="B-">B-</SelectItem>
              <SelectItem value="AB+">AB+</SelectItem>
              <SelectItem value="AB-">AB-</SelectItem>
              <SelectItem value="O+">O+</SelectItem>
              <SelectItem value="O-">O-</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="allergies">الحساسية والأمراض المزمنة (إن وجدت)</Label>
          <Textarea 
            id="allergies" 
            name="allergies" 
            rows={3}
            defaultValue={history?.allergies || ''} 
            placeholder="مثال: حساسية من البنسلين، مرض السكري..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="medications">الأدوية الحالية</Label>
          <Textarea 
            id="medications" 
            name="medications" 
            rows={3}
            defaultValue={history?.medications || ''} 
            placeholder="أدخل الأدوية التي يتناولها المريض بانتظام"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">ملاحظات إضافية</Label>
          <Textarea 
            id="notes" 
            name="notes" 
            rows={2}
            defaultValue={history?.notes || ''} 
          />
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? 'جاري الحفظ...' : 'حفظ السجل الطبي'}
        </Button>
      </form>
    </div>
  )
}
