'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useActionState } from 'react'
import { updatePatient } from '@/actions/dashboard'

export function PatientBasicInfo({ patient }: { patient: any }) {
  const updatePatientWithId = updatePatient.bind(null, patient.id)
  const [state, formAction, isPending] = useActionState(updatePatientWithId, null)

  return (
    <div className="max-w-2xl bg-card border border-border p-6 rounded-xl">
      <h2 className="text-xl font-semibold mb-6">تعديل بيانات المريض</h2>
      
      <form action={formAction} className="space-y-6">
        {state?.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {state.error}
          </div>
        )}
        {state?.success && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            تم تحديث البيانات بنجاح.
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="fullName">الاسم بالكامل</Label>
          <Input 
            id="fullName" 
            name="fullName" 
            defaultValue={patient.fullName} 
            required 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input 
              id="phone" 
              name="phone" 
              defaultValue={patient.phone || ''} 
              dir="ltr"
              className="text-left"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input 
              id="email" 
              name="email"
              type="email" 
              defaultValue={patient.email || ''} 
              dir="ltr"
              className="text-left"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address">العنوان</Label>
          <Input 
            id="address" 
            name="address" 
            defaultValue={patient.address || ''} 
          />
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </form>
    </div>
  )
}
