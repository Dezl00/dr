'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-64 border border-border rounded-xl bg-muted/30 flex items-center justify-center text-sm text-muted-foreground">جاري تحميل المحرر...</div>
})

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      [{ 'direction': 'rtl' }],
      ['link', 'image'],
      ['blockquote'],
      ['clean'],
    ],
  }), [])

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list',
    'align', 'direction',
    'link', 'image',
    'blockquote',
  ]

  return (
    <div className="rich-text-editor" dir="rtl">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || 'اكتب تفاصيل الخدمة هنا...'}
      />
      <style jsx global>{`
        .rich-text-editor .ql-container {
          min-height: 200px;
          font-size: 14px;
          border-bottom-left-radius: 0.75rem;
          border-bottom-right-radius: 0.75rem;
          border-color: hsl(var(--border));
        }
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
          border-color: hsl(var(--border));
          background: hsl(var(--muted) / 0.3);
        }
        .rich-text-editor .ql-editor {
          min-height: 200px;
          direction: rtl;
          text-align: right;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          right: 15px;
          left: auto;
          font-style: normal;
        }
      `}</style>
    </div>
  )
}
