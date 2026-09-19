"use client"

import { useState } from "react"
import { WebsiteSection } from "@prisma/client"
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core"
import { 
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Edit2, Plus, Trash2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/ui/image-upload"
import { updateSectionOrder, toggleSectionVisibility, updateSectionContent } from "@/actions/dashboard"
import { toast } from "@/hooks/use-toast"

interface WebsiteSectionsManagerProps {
  initialSections: WebsiteSection[]
}

const EDITABLE_SECTIONS = ['HERO', 'ABOUT', 'TESTIMONIALS', 'GALLERY', 'FAQ', 'WHY_CHOOSE_US', 'CONTACT', 'BOOKING', 'SERVICES', 'DOCTORS']

function SortableSectionItem({ 
  section, 
  onEdit, 
  onToggle 
}: { 
  section: WebsiteSection, 
  onEdit: (section: WebsiteSection) => void,
  onToggle: (id: string, isEnabled: boolean) => void 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`flex items-center justify-between p-4 mb-3 bg-card border border-border rounded-xl transition-colors duration-150 ${isDragging ? 'opacity-80' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground touch-none">
          <GripVertical className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium text-sm">{section.title || section.type}</p>
          <p className="text-xs text-muted-foreground">الترتيب: {section.sortOrder}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {EDITABLE_SECTIONS.includes(section.type) && (
          <Button variant="outline" size="sm" onClick={() => onEdit(section)}>
            <Edit2 className="h-3.5 w-3.5 me-2" />
            تعديل
          </Button>
        )}
        
        <Switch 
          checked={section.isEnabled}
          onCheckedChange={(checked) => onToggle(section.id, checked)}
          dir="ltr"
        />
      </div>
    </div>
  )
}

export function WebsiteSectionsManager({ initialSections }: WebsiteSectionsManagerProps) {
  const [sections, setSections] = useState(initialSections)
  const [editingSection, setEditingSection] = useState<WebsiteSection | null>(null)
  
  // Using any since content structure varies widely by section
  const [content, setContent] = useState<any>({})

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        
        const newArray = arrayMove(items, oldIndex, newIndex)
        const updatedOrder = newArray.map((item, index) => ({
          id: item.id,
          sortOrder: index + 1
        }))

        // Call server action in background
        updateSectionOrder(updatedOrder).catch((err) => {
          toast({ title: "خطأ", description: err.message, variant: "destructive" })
        })

        // Update local state sortOrder
        return newArray.map((item, index) => ({ ...item, sortOrder: index + 1 }))
      })
    }
  }

  const handleToggle = async (id: string, isEnabled: boolean) => {
    setSections(items => items.map(item => item.id === id ? { ...item, isEnabled } : item))
    try {
      await toggleSectionVisibility(id, isEnabled)
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" })
      // Revert on error
      setSections(items => items.map(item => item.id === id ? { ...item, isEnabled: !isEnabled } : item))
    }
  }

  const openEdit = (section: WebsiteSection) => {
    setEditingSection(section)
    setContent(section.content || {})
  }

  const saveEdit = async () => {
    if (!editingSection) return
    try {
      await updateSectionContent(editingSection.id, content)
      
      setSections(items => items.map(item => 
        item.id === editingSection.id ? { ...item, content: content } : item
      ))
      setEditingSection(null)
      toast({ title: "نجاح", description: "تم حفظ المحتوى بنجاح" })
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" })
    }
  }

  const renderSectionForm = () => {
    if (!editingSection) return null;

    const { type } = editingSection;

    if (type === 'SERVICES' || type === 'DOCTORS') {
      return (
        <div className="py-8 text-center text-muted-foreground">
          يتم سحب البيانات تلقائياً من قسم {type === 'SERVICES' ? 'الخدمات' : 'الأطباء'}
        </div>
      )
    }

    if (type === 'HERO') {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>العنوان الرئيسي</Label>
            <Input 
              value={content?.title || ''} 
              onChange={(e) => setContent({...content, title: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <Label>العنوان الفرعي</Label>
            <Input 
              value={content?.subtitle || ''} 
              onChange={(e) => setContent({...content, subtitle: e.target.value})} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>نص الزر الأول</Label>
              <Input 
                value={content?.button1Text || ''} 
                onChange={(e) => setContent({...content, button1Text: e.target.value})} 
                placeholder="احجز موعدك الآن"
              />
            </div>
            <div className="space-y-2">
              <Label>رابط الزر الأول</Label>
              <Input 
                value={content?.button1Link || ''} 
                onChange={(e) => setContent({...content, button1Link: e.target.value})} 
                dir="ltr"
                placeholder="#booking"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>نص الزر الثاني</Label>
              <Input 
                value={content?.button2Text || ''} 
                onChange={(e) => setContent({...content, button2Text: e.target.value})} 
                placeholder="خدماتنا"
              />
            </div>
            <div className="space-y-2">
              <Label>رابط الزر الثاني</Label>
              <Input 
                value={content?.button2Link || ''} 
                onChange={(e) => setContent({...content, button2Link: e.target.value})} 
                dir="ltr"
                placeholder="#services"
              />
            </div>
          </div>
        </div>
      )
    }

    if (type === 'ABOUT') {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>العنوان</Label>
            <Input 
              value={content?.title || ''} 
              onChange={(e) => setContent({...content, title: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <Label>الوصف</Label>
            <Textarea 
              rows={4}
              value={content?.description || ''} 
              onChange={(e) => setContent({...content, description: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <Label>صورة القسم</Label>
            <ImageUpload 
              value={content?.imageUrl || ''} 
              onChange={(url) => setContent({...content, imageUrl: url})} 
            />
          </div>
        </div>
      )
    }

    if (type === 'TESTIMONIALS') {
      const testimonials = content?.testimonials || [];
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>العنوان</Label>
            <Input 
              value={content?.title || ''} 
              onChange={(e) => setContent({...content, title: e.target.value})} 
            />
          </div>
          
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">الآراء</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setContent({...content, testimonials: [...testimonials, { name: '', text: '', rating: 5 }]})}
              >
                <Plus className="h-4 w-4 me-2" />
                إضافة رأي
              </Button>
            </div>
            
            {testimonials.map((t: any, idx: number) => (
              <div key={idx} className="p-4 border border-border rounded-xl space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>الاسم</Label>
                        <Input 
                          value={t.name || ''} 
                          onChange={(e) => {
                            const newArr = [...testimonials];
                            newArr[idx].name = e.target.value;
                            setContent({...content, testimonials: newArr})
                          }} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>التقييم (1-5)</Label>
                        <select 
                          className="flex h-10 w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                          value={t.rating || 5}
                          onChange={(e) => {
                            const newArr = [...testimonials];
                            newArr[idx].rating = parseInt(e.target.value);
                            setContent({...content, testimonials: newArr})
                          }}
                        >
                          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>النص</Label>
                      <Textarea 
                        value={t.text || ''} 
                        onChange={(e) => {
                          const newArr = [...testimonials];
                          newArr[idx].text = e.target.value;
                          setContent({...content, testimonials: newArr})
                        }} 
                      />
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      const newArr = [...testimonials];
                      newArr.splice(idx, 1);
                      setContent({...content, testimonials: newArr})
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (type === 'GALLERY') {
      const images = content?.images || [];
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>العنوان</Label>
            <Input 
              value={content?.title || ''} 
              onChange={(e) => setContent({...content, title: e.target.value})} 
            />
          </div>
          
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">الصور</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setContent({...content, images: [...images, '']})}
              >
                <Plus className="h-4 w-4 me-2" />
                إضافة صورة
              </Button>
            </div>
            
            <div className="space-y-4">
              {images.map((img: string, idx: number) => (
                <div key={idx} className="flex items-start gap-4 p-4 border border-border rounded-xl">
                  <div className="flex-1">
                    <ImageUpload 
                      value={img || ''} 
                      onChange={(url) => {
                        const newArr = [...images];
                        newArr[idx] = url;
                        setContent({...content, images: newArr})
                      }} 
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                    onClick={() => {
                      const newArr = [...images];
                      newArr.splice(idx, 1);
                      setContent({...content, images: newArr})
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    if (type === 'FAQ') {
      const faqs = content?.faqs || [];
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>العنوان</Label>
            <Input 
              value={content?.title || ''} 
              onChange={(e) => setContent({...content, title: e.target.value})} 
            />
          </div>
          
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">الأسئلة الشائعة</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setContent({...content, faqs: [...faqs, { question: '', answer: '' }]})}
              >
                <Plus className="h-4 w-4 me-2" />
                إضافة سؤال
              </Button>
            </div>
            
            {faqs.map((faq: any, idx: number) => (
              <div key={idx} className="p-4 border border-border rounded-xl space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Label>السؤال</Label>
                      <Input 
                        value={faq.question || ''} 
                        onChange={(e) => {
                          const newArr = [...faqs];
                          newArr[idx].question = e.target.value;
                          setContent({...content, faqs: newArr})
                        }} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الإجابة</Label>
                      <Textarea 
                        value={faq.answer || ''} 
                        onChange={(e) => {
                          const newArr = [...faqs];
                          newArr[idx].answer = e.target.value;
                          setContent({...content, faqs: newArr})
                        }} 
                      />
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                    onClick={() => {
                      const newArr = [...faqs];
                      newArr.splice(idx, 1);
                      setContent({...content, faqs: newArr})
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (type === 'CONTACT' || type === 'BOOKING') {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>عنوان القسم</Label>
            <Input 
              value={content?.title || ''} 
              onChange={(e) => setContent({...content, title: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <Label>رسالة ترحيب</Label>
            <Textarea 
              rows={4}
              value={content?.message || ''} 
              onChange={(e) => setContent({...content, message: e.target.value})} 
            />
          </div>
        </div>
      )
    }

    // Fallback for unexpected types
    return (
      <div className="py-4">
        <p className="text-sm text-muted-foreground mb-2">محتوى غير مدعوم للواجهة الرسومية بعد</p>
      </div>
    )
  }

  return (
    <div>
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={sections.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {sections.map(section => (
            <SortableSectionItem 
              key={section.id} 
              section={section} 
              onEdit={openEdit}
              onToggle={handleToggle}
            />
          ))}
        </SortableContext>
      </DndContext>

      {sections.length === 0 && (
        <p className="text-muted-foreground text-sm">لا توجد أقسام مضافة بعد.</p>
      )}

      <Dialog open={!!editingSection} onOpenChange={(open) => !open && setEditingSection(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل قسم {editingSection?.title || editingSection?.type}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {renderSectionForm()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSection(null)}>إلغاء</Button>
            {editingSection?.type !== 'SERVICES' && editingSection?.type !== 'DOCTORS' && (
              <Button onClick={saveEdit}>حفظ التغييرات</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
