'use client'

import { useState, useRef } from 'react'
import { Button } from './button'
import { uploadImageAction } from '@/actions/upload'
import { Loader2, Upload, X } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const url = await uploadImageAction(formData)
      onChange(url)
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء الرفع')
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4 w-full">
      {value ? (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
          <Image src={value} alt="Uploaded" fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-md hover:bg-red-600 transition-colors shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div 
          onClick={() => inputRef.current?.click()}
          className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
        >
          {isUploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          ) : (
            <>
              <Upload className="w-6 h-6 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground font-medium">اضغط لرفع صورة</span>
            </>
          )}
        </div>
      )}
      <input
        type="file"
        ref={inputRef}
        onChange={handleUpload}
        accept="image/*"
        className="hidden"
      />
    </div>
  )
}
