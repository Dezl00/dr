import { requireAuth } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { updateProfile } from '@/actions/dashboard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function ProfileSettingsPage() {
  const user = await requireAuth()
  
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  })
  
  if (!dbUser) return null

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">الملف الشخصي</h1>
      
      <form action={updateProfile} className="space-y-6 bg-card border border-border p-6 rounded-xl">
        <div className="space-y-2">
          <Label htmlFor="fullName">الاسم بالكامل</Label>
          <Input 
            id="fullName" 
            name="fullName" 
            defaultValue={dbUser.fullName} 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">البريد الإلكتروني (للقراءة فقط)</Label>
          <Input 
            id="email" 
            type="email" 
            defaultValue={dbUser.email} 
            readOnly 
            disabled 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">رقم الهاتف</Label>
          <Input 
            id="phone" 
            name="phone" 
            defaultValue={dbUser.phone || ''} 
            dir="ltr"
            className="text-left"
          />
        </div>
        
        <Button type="submit">حفظ التغييرات</Button>
      </form>
    </div>
  )
}
