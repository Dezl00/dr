import { createContext, useContext } from 'react'

export interface ClinicContext {
  clinicId: string
  clinicName: string
  clinicSlug: string
  timezone: string
  permissions: string[]
  isAdminAccess: boolean
}

export const ClinicCtx = createContext<ClinicContext | null>(null)

export function useClinic(): ClinicContext {
  const context = useContext(ClinicCtx)
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider')
  }
  return context
}
