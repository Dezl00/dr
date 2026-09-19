'use client'

import { useState } from 'react'

interface ClinicColorsFormProps {
  clinicId: string
  initialPrimary?: string
  initialSecondary?: string
  initialAccent?: string
  action: (clinicId: string, formData: FormData) => Promise<any>
}

export function ClinicColorsForm({
  clinicId,
  initialPrimary = '#2563EB',
  initialSecondary = '#1E40AF',
  initialAccent = '#3B82F6',
  action
}: ClinicColorsFormProps) {
  const [primary, setPrimary] = useState(initialPrimary)
  const [secondary, setSecondary] = useState(initialSecondary)
  const [accent, setAccent] = useState(initialAccent)

  return (
    <form action={action.bind(null, clinicId)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">اللون الأساسي</label>
          <div className="flex gap-2">
            <input
              type="color"
              name="primaryColor"
              value={primary}
              onChange={(e) => setPrimary(e.target.value)}
              className="h-10 w-10 shrink-0 cursor-pointer rounded-md border border-border p-1"
            />
            <input
              type="text"
              name="primaryColorText"
              value={primary}
              onChange={(e) => setPrimary(e.target.value)}
              className="w-full rounded-md border border-border px-3 py-2 text-sm text-left"
              dir="ltr"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">اللون الثانوي</label>
          <div className="flex gap-2">
            <input
              type="color"
              name="secondaryColor"
              value={secondary}
              onChange={(e) => setSecondary(e.target.value)}
              className="h-10 w-10 shrink-0 cursor-pointer rounded-md border border-border p-1"
            />
            <input
              type="text"
              name="secondaryColorText"
              value={secondary}
              onChange={(e) => setSecondary(e.target.value)}
              className="w-full rounded-md border border-border px-3 py-2 text-sm text-left"
              dir="ltr"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">لون التمييز</label>
          <div className="flex gap-2">
            <input
              type="color"
              name="accentColor"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              className="h-10 w-10 shrink-0 cursor-pointer rounded-md border border-border p-1"
            />
            <input
              type="text"
              name="accentColorText"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              className="w-full rounded-md border border-border px-3 py-2 text-sm text-left"
              dir="ltr"
            />
          </div>
        </div>
      </div>
      
      <button
        type="submit"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        حفظ الألوان
      </button>
    </form>
  )
}
