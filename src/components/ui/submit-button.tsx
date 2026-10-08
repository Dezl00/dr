'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
  loadingLabel?: string
}

export function SubmitButton({ 
  label = 'حفظ', 
  loadingLabel = 'جاري الحفظ...', 
  className,
  ...props 
}: SubmitButtonProps) {
  const { pending } = useFormStatus()
  
  return (
    <Button 
      type="submit" 
      disabled={pending || props.disabled} 
      className={className}
      {...props}
    >
      {pending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
      {pending ? loadingLabel : label}
    </Button>
  )
}
