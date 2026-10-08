'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { Search, Loader2, Users, Stethoscope, ListChecks } from 'lucide-react'
import { searchGlobal } from '@/actions/search'
import Link from 'next/link'

export function GlobalSearch({ clinicId }: { clinicId: string }) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<{
    patients: any[]
    doctors: any[]
    services: any[]
  }>({ patients: [], doctors: [], services: [] })
  
  const [isPending, startTransition] = useTransition()
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.length >= 2) {
      setIsOpen(true)
      startTransition(async () => {
        const data = await searchGlobal(query, clinicId)
        setResults(data)
      })
    } else {
      setIsOpen(false)
    }
  }, [query, clinicId])

  const hasResults = results.patients.length > 0 || results.doctors.length > 0 || results.services.length > 0

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute right-3 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="ابحث عن مريض، طبيب، أو خدمة..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-10 w-full rounded-full border border-border bg-slate-50/50 pr-10 pl-10 text-sm outline-none transition-colors focus:border-blue-500 focus:bg-white"
        />
        {isPending && (
          <Loader2 className="absolute left-3 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-12 left-0 right-0 z-50 max-h-[80vh] overflow-y-auto rounded-xl border border-border bg-white p-2">
          {!isPending && !hasResults ? (
            <div className="p-4 text-center text-sm text-muted-foreground">لا توجد نتائج</div>
          ) : (
            <div className="space-y-4 p-2">
              {results.patients.length > 0 && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" />
                    المرضى
                  </h3>
                  <div className="space-y-1">
                    {results.patients.map(p => (
                      <Link key={p.id} href={`/dashboard/patients/${p.id}`} className="block rounded-lg px-3 py-2 hover:bg-slate-50" onClick={() => setIsOpen(false)}>
                        <div className="text-sm font-medium">{p.fullName}</div>
                        {p.phone && <div className="text-xs text-muted-foreground" dir="ltr">{p.phone}</div>}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {results.doctors.length > 0 && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                    <Stethoscope className="h-3.5 w-3.5" />
                    الأطباء
                  </h3>
                  <div className="space-y-1">
                    {results.doctors.map(d => (
                      <Link key={d.id} href={`/dashboard/doctors/${d.id}`} className="block rounded-lg px-3 py-2 hover:bg-slate-50" onClick={() => setIsOpen(false)}>
                        <div className="text-sm font-medium">{d.fullName}</div>
                        {d.specialty && <div className="text-xs text-muted-foreground">{d.specialty}</div>}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.services.length > 0 && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                    <ListChecks className="h-3.5 w-3.5" />
                    الخدمات
                  </h3>
                  <div className="space-y-1">
                    {results.services.map(s => (
                      <Link key={s.id} href={`/dashboard/services/${s.id}`} className="block rounded-lg px-3 py-2 hover:bg-slate-50" onClick={() => setIsOpen(false)}>
                        <div className="text-sm font-medium">{s.name}</div>
                        {s.price && <div className="text-xs text-muted-foreground">{Number(s.price).toFixed(2)} ج.م</div>}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
