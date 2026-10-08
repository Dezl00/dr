'use client'

import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Plus, Printer } from 'lucide-react'

export function PatientPrescriptions({ prescriptions }: { prescriptions: any[] }) {
  if (!prescriptions || prescriptions.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground border rounded-xl bg-card">
        <p className="mb-4">لا توجد روشتات طبية مسجلة لهذا المريض.</p>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          كتابة روشتة جديدة
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">الروشتات الطبية</h3>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          روشتة جديدة
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {prescriptions.map((rx) => (
          <div key={rx.id} className="border border-border rounded-xl bg-card p-5 space-y-4">
            <div className="flex justify-between items-start border-b border-border pb-4">
              <div>
                <p className="font-semibold">{format(new Date(rx.createdAt), 'dd MMMM yyyy', { locale: ar })}</p>
                <p className="text-sm text-muted-foreground mt-1">د. {rx.doctor?.fullName}</p>
              </div>
              <Button variant="outline" size="icon">
                <Printer className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {rx.medications.map((med: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center bg-muted/50 p-2 rounded-lg text-sm">
                  <span className="font-medium text-foreground">{med.name}</span>
                  <span className="text-muted-foreground">{med.dosage} - {med.frequency}</span>
                </div>
              ))}
            </div>
            {rx.notes && (
              <p className="text-sm text-muted-foreground pt-2 border-t border-border">
                {rx.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
