'use client'

import { useState } from 'react'
import { ImageUpload } from '@/components/ui/image-upload'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface ServiceFormProps {
  action: (formData: FormData) => void
  defaultValues: {
    name: string
    price: string
    duration: string
    description: string
    content: string
    imageUrl: string
  }
}

export function ServiceForm({ action, defaultValues }: ServiceFormProps) {
  const [imageUrl, setImageUrl] = useState(defaultValues.imageUrl || '')
  const [content, setContent] = useState(defaultValues.content || '')

  return (
    <form action={action} className="space-y-6 bg-card border border-border p-6 rounded-xl">
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <input type="hidden" name="content" value={content} />

      <div className="space-y-2">
        <Label htmlFor="name">اسم الخدمة</Label>
        <Input 
          id="name" 
          name="name" 
          defaultValue={defaultValues.name} 
          required 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">الوصف المختصر</Label>
        <Textarea 
          id="description" 
          name="description" 
          defaultValue={defaultValues.description}
          rows={3}
          placeholder="وصف مختصر يظهر في قائمة الخدمات"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">السعر (اختياري)</Label>
          <Input 
            id="price" 
            name="price"
            type="number" 
            step="0.01"
            defaultValue={defaultValues.price} 
            dir="ltr"
            className="text-left"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="duration">المدة بالدقائق (اختياري)</Label>
          <Input 
            id="duration" 
            name="duration" 
            type="number"
            defaultValue={defaultValues.duration} 
            dir="ltr"
            className="text-left"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>صورة الخدمة</Label>
        <ImageUpload value={imageUrl} onChange={setImageUrl} />
      </div>

      <div className="space-y-2">
        <Label>تفاصيل الخدمة (يظهر في صفحة الخدمة المستقلة)</Label>
        <RichTextEditor value={content} onChange={setContent} />
      </div>

      <Button type="submit">حفظ التغييرات</Button>
    </form>
  )
}
