'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

export function BackButton({ label = 'رجوع' }: { label?: string }) {
  const router = useRouter()
  return (
    <button 
      onClick={() => router.back()} 
      className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
    >
      <ArrowRight className="h-4 w-4" />
      {label}
    </button>
  )
}
