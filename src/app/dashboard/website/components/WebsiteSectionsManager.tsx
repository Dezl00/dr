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
import { GripVertical, Edit2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { updateSectionOrder, toggleSectionVisibility, updateSectionContent } from "@/actions/dashboard"
import { toast } from "@/hooks/use-toast"

interface WebsiteSectionsManagerProps {
  initialSections: WebsiteSection[]
}

const EDITABLE_SECTIONS = ['HERO', 'ABOUT', 'TESTIMONIALS', 'GALLERY', 'FAQ', 'WHY_CHOOSE_US', 'CONTACT']

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
      className={`flex items-center justify-between p-4 mb-3 bg-card border border-border rounded-xl ${isDragging ? 'shadow-md opacity-80' : ''}`}
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
  const [jsonContent, setJsonContent] = useState("")

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
    setJsonContent(section.content ? JSON.stringify(section.content, null, 2) : "{}")
  }

  const saveEdit = async () => {
    if (!editingSection) return
    try {
      const parsedContent = JSON.parse(jsonContent)
      await updateSectionContent(editingSection.id, parsedContent)
      
      setSections(items => items.map(item => 
        item.id === editingSection.id ? { ...item, content: parsedContent } : item
      ))
      setEditingSection(null)
      toast({ title: "نجاح", description: "تم حفظ المحتوى بنجاح" })
    } catch (err: any) {
      toast({ title: "خطأ في JSON", description: err.message, variant: "destructive" })
    }
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>تعديل قسم {editingSection?.title || editingSection?.type}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">قم بتعديل المحتوى الخاص بالقسم (بصيغة JSON)</p>
            <Textarea
              className="font-mono text-sm h-64"
              value={jsonContent}
              onChange={(e) => setJsonContent(e.target.value)}
              dir="ltr"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSection(null)}>إلغاء</Button>
            <Button onClick={saveEdit}>حفظ التغييرات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
