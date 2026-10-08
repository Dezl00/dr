import { requireAuth } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { updateClinicSettings } from '@/actions/dashboard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SubmitButton } from '@/components/ui/submit-button'

export default async function ClinicSettingsPage() {
  const user = await requireAuth()
  
  const membership = await prisma.clinicMembership.findFirst({
    where: { userId: user.id, status: 'ACTIVE' },
    include: {
      clinic: {
        include: {
          settings: true
        }
      }
    }
  })
  
  if (!membership) return <div>لا يوجد عيادة نشطة</div>
  
  const clinic = membership.clinic
  const settings = clinic.settings

  return (
    <div className="max-w-2xl">
      <form action={updateClinicSettings} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">اسم العيادة</Label>
          <Input 
            id="name" 
            name="name" 
            defaultValue={clinic.name} 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">رقم هاتف العيادة</Label>
          <Input 
            id="phone" 
            name="phone" 
            defaultValue={settings?.phone || ''} 
            dir="ltr"
            className="text-left"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">البريد الإلكتروني للعيادة</Label>
          <Input 
            id="email" 
            name="email"
            type="email" 
            defaultValue={settings?.email || ''} 
            dir="ltr"
            className="text-left"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">العنوان</Label>
          <Textarea 
            id="address" 
            name="address" 
            defaultValue={settings?.address || ''} 
            rows={3}
          />
        </div>
        
        <SubmitButton 
          label="حفظ الإعدادات"
          loadingLabel="جاري الحفظ..."
        />
      </form>
    </div>
  )
}
