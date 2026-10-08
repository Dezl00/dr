import Link from 'next/link'

interface SiteHeaderProps {
  clinicName: string
  sections?: { id: string; type: string; title: string | null }[]
  primaryColor?: string
}

export function SiteHeader({ clinicName, sections, primaryColor }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-[#FFFFFF]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-xl font-semibold" style={{ color: primaryColor || 'var(--clinic-primary)' }}>
          {clinicName}
        </Link>
        {sections && sections.length > 0 && (
          <nav className="hidden space-x-6 space-x-reverse md:flex">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`/#${section.type.toLowerCase()}`}
                className="text-sm font-medium text-[#050505] hover:opacity-70 transition-opacity"
              >
                {section.title}
              </a>
            ))}
          </nav>
        )}
        <a
          href="/#booking"
          className="rounded-none px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 text-[#FFFFFF]"
          style={{ backgroundColor: primaryColor || 'var(--clinic-primary)' }}
        >
          احجز موعدك
        </a>
      </div>
    </header>
  )
}
