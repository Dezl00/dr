import { requireAuth } from '@/lib/auth/dal'
import { changePassword } from '@/actions/dashboard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function SecuritySettingsPage() {
  await requireAuth()

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">إعدادات الأمان</h1>
      
      <form action={changePassword} className="space-y-6 bg-card border border-border p-6 rounded-xl">
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
