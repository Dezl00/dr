import 'server-only'

import { cache } from 'react'
import { prisma } from '@/lib/db/prisma'

export interface TenantContext {
  clinicId: string
  clinicName: string
  clinicSlug: string
  clinicStatus: string
  clinicTimezone: string
  domainId: string
  domainType: string
}

/**
 * Resolve a tenant from a hostname/domain string.
 * This is called from the tenant website layout (sites/[domain]/layout.tsx).
 *
 * The `domain` parameter comes from the middleware rewrite:
 * - For platform subdomains: the slug (e.g., "alnoor-dental")
 * - For custom domains: the full hostname (e.g., "www.alnoorclinic.com")
 */
export const resolveTenant = cache(async (
  domain: string
): Promise<TenantContext | null> => {
  if (!domain) return null

  const normalizedDomain = domain.toLowerCase().trim()

  // Try as platform subdomain (slug lookup)
  const clinicBySlug = await prisma.clinic.findUnique({
    where: { slug: normalizedDomain },
    include: {
      domains: {
        where: { status: 'ACTIVE' },
      },
    },
  })

  if (clinicBySlug && clinicBySlug.status === 'ACTIVE') {
    const subdomainDomain = clinicBySlug.domains.find(
      (d) => d.type === 'PLATFORM_SUBDOMAIN'
    )
    return {
      clinicId: clinicBySlug.id,
      clinicName: clinicBySlug.name,
      clinicSlug: clinicBySlug.slug,
      clinicStatus: clinicBySlug.status,
      clinicTimezone: clinicBySlug.timezone,
      domainId: subdomainDomain?.id || '',
      domainType: 'PLATFORM_SUBDOMAIN',
    }
  }

  // Try as custom domain (full domain lookup)
  // Strip www. prefix for matching
  const domainWithoutWww = normalizedDomain.replace(/^www\./, '')

  const domainRecord = await prisma.domain.findFirst({
    where: {
      OR: [
        { domain: normalizedDomain },
        { domain: domainWithoutWww },
        { domain: `www.${domainWithoutWww}` },
      ],
      status: 'ACTIVE',
    },
    include: {
      clinic: true,
    },
  })

  if (domainRecord && domainRecord.clinic.status === 'ACTIVE') {
    return {
      clinicId: domainRecord.clinic.id,
      clinicName: domainRecord.clinic.name,
      clinicSlug: domainRecord.clinic.slug,
      clinicStatus: domainRecord.clinic.status,
      clinicTimezone: domainRecord.clinic.timezone,
      domainId: domainRecord.id,
      domainType: domainRecord.type,
    }
  }

  return null
})
