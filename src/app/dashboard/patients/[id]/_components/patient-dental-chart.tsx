import { useState, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { updateDentalRecord } from '@/actions/emr'

const TEETH = {
  upperRight: [18, 17, 16, 15, 14, 13, 12, 11],
  upperLeft: [21, 22, 23, 24, 25, 26, 27, 28],
  lowerRight: [48, 47, 46, 45, 44, 43, 42, 41],
  lowerLeft: [31, 32, 33, 34, 35, 36, 37, 38],
}

function Tooth({ number, status, onClick, isSelected }: { number: number, status?: string, onClick: () => void, isSelected: boolean }) {
  let bg = 'bg-background'
  if (status === 'DECAYED') bg = 'bg-red-200 border-red-500'
  else if (status === 'FILLED') bg = 'bg-blue-200 border-blue-500'
  else if (status === 'MISSING') bg = 'bg-gray-300 border-gray-500 opacity-50'
  else if (status === 'CROWNED') bg = 'bg-yellow-200 border-yellow-500'

  return (
    <div 
      onClick={onClick}
      className={`w-10 h-12 flex flex-col items-center justify-center border-2 rounded-t-lg cursor-pointer transition-transform hover:scale-110 ${bg} ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
    >
      <span className="text-xs font-bold text-foreground">{number}</span>
    </div>
  )
}

export function PatientDentalChart({ patientId, records }: { patientId: string, records: any[] }) {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()
  
  const getRecord = (num: number) => records?.find(r => r.toothNumber === num)
  const getStatus = (num: number) => getRecord(num)?.condition

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedTooth) return

    const formData = new FormData(e.currentTarget)
    const condition = formData.get('condition') as string
    const notes = formData.get('notes') as string

    startTransition(async () => {
      await updateDentalRecord(patientId, selectedTooth, condition, notes)
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-card border border-border p-6 rounded-xl flex flex-col items-center justify-center space-y-12">
        
        {/* Upper Jaw */}
        <div className="flex flex-col items-center gap-4">
          <div className="text-sm font-semibold text-muted-foreground">الفك العلوي</div>
          <div className="flex gap-1 border-b-2 border-border pb-2 px-4">
            <div className="flex gap-1 border-l-2 border-border pl-2">
              {TEETH.upperRight.map(num => (
                <Tooth key={num} number={num} status={getStatus(num)} onClick={() => setSelectedTooth(num)} isSelected={selectedTooth === num} />
              ))}
            </div>
            <div className="flex gap-1 pr-2">
              {TEETH.upperLeft.map(num => (
                <Tooth key={num} number={num} status={getStatus(num)} onClick={() => setSelectedTooth(num)} isSelected={selectedTooth === num} />
              ))}
            </div>
          </div>
        </div>

        {/* Lower Jaw */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-1 border-t-2 border-border pt-2 px-4">
            <div className="flex gap-1 border-l-2 border-border pl-2">
              {TEETH.lowerRight.map(num => (
                <Tooth key={num} number={num} status={getStatus(num)} onClick={() => setSelectedTooth(num)} isSelected={selectedTooth === num} />
              ))}
            </div>
            <div className="flex gap-1 pr-2">
              {TEETH.lowerLeft.map(num => (
                <Tooth key={num} number={num} status={getStatus(num)} onClick={() => setSelectedTooth(num)} isSelected={selectedTooth === num} />
              ))}
            </div>
          </div>
          <div className="text-sm font-semibold text-muted-foreground">الفك السفلي</div>
        </div>

      </div>

      <div className="bg-card border border-border p-6 rounded-xl min-h-[400px]">
        {selectedTooth ? (
          <div>
            <h3 className="text-lg font-bold mb-4">تفاصيل السن رقم {selectedTooth}</h3>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">حالة السن</label>
                <Select name="condition" defaultValue={getStatus(selectedTooth) || 'SOUND'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOUND">سليم (Sound)</SelectItem>
                    <SelectItem value="DECAYED">تسوس (Decayed)</SelectItem>
                    <SelectItem value="FILLED">محشو (Filled)</SelectItem>
                    <SelectItem value="CROWNED">طربوش (Crowned)</SelectItem>
                    <SelectItem value="MISSING">مفقود/مخلوع (Missing)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">ملاحظات الطبيب</label>
                <Textarea 
                  name="notes" 
                  defaultValue={getRecord(selectedTooth)?.notes || ''}
                  placeholder="ملاحظات حول التشخيص أو خطة العلاج لهذا السن..."
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'جاري الحفظ...' : 'حفظ حالة السن'}
              </Button>
            </form>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm text-center">
            اختر أحد الأسنان من المخطط لعرض التفاصيل وتحديث الحالة
          </div>
        )}
      </div>
    </div>
  )
}
