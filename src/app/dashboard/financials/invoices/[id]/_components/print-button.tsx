'use client'

import { Printer } from 'lucide-react'

export function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-medium hover:bg-accent transition-colors print:hidden"
    >
      <Printer className="h-4 w-4" /> طباعة الفاتورة
    </button>
  )
}
