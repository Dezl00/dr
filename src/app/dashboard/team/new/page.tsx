import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { inviteTeamMember } from '@/actions/dashboard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

async function getClinicId() {
  const user = await requireAuth()
  const { session } = await getCurrentSession()
  if (user.isAdmin && session?.adminAccessClinicId) return session.adminAccessClinicId
  const membership = await prisma.clinicMembership.findFirst({
    where: { userId: user.id, status: 'ACTIVE' },
    select: { clinicId: true },
  })
  return membership?.clinicId || ''
}

export default async function NewTeamMemberPage() {
  const clinicId = await getClinicId()
  
  const roles = await prisma.role.findMany({
    where: {
      OR: [
        { clinicId },
        { clinicId: null } // System default roles
      ]
    }
  })

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">إضافة عضو جديد</h1>
      
      <form action={inviteTeamMember} className="space-y-6 bg-card border border-border p-6 rounded-xl">
        <div className="space-y-2">
          <Label htmlFor="fullName">الاسم بالكامل</Label>
          <Input 
            id="fullName" 
            name="fullName" 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            required 
            dir="ltr"
            className="text-left"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">كلمة المرور المؤقتة</Label>
          <Input 
            id="password" 
            name="password" 
            type="password" 
            required 
            dir="ltr"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="roleId">الدور (الصلاحيات)</Label>
          <select 
            id="roleId" 
            name="roleId" 
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">اختر دوراً...</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.nameAr}</option>
            ))}
          </select>
        </div>
        
        <Button type="submit">إضافة</Button>
      </form>
    </div>
  )
}
