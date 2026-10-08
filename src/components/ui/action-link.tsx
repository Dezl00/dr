'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface ActionLinkProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href: string
  children: React.ReactNode
  icon?: React.ElementType
}

export function ActionLink({ href, children, className, icon: Icon, onMouseEnter, ...props }: ActionLinkProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => router.push(href))}
      onMouseEnter={(e) => {
        router.prefetch(href)
        if (onMouseEnter) onMouseEnter(e)
      }}
      disabled={isPending || props.disabled}
      className={className}
      {...props}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
      ) : Icon ? (
        <Icon className="h-4 w-4" strokeWidth={1.5} />
      ) : null}
      {children}
    </button>
  )
}
