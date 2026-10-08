import { requireAuth } from '@/lib/auth/dal'
import { changePassword } from '@/actions/dashboard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function SecuritySettingsPage() {
  await requireAuth()

  return (
    <div className="max-w-2xl">
      <form action={changePassword} className="space-y-6">
        <div>
          <h2 className="text-lg font-medium mb-4">تغيير كلمة المرور</h2>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
          <Input 
            id="currentPassword" 
            name="currentPassword" 
            type="password" 
            required 
            dir="ltr"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
          <Input 
            id="newPassword" 
            name="newPassword" 
            type="password" 
            required 
            dir="ltr"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
          <Input 
            id="confirmPassword" 
            name="confirmPassword" 
            type="password" 
            required 
            dir="ltr"
          />
        </div>
        
        <Button type="submit">تحديث كلمة المرور</Button>
      </form>
    </div>
  )
}
