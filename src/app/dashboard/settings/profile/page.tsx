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
      <form action={updateProfile} className="space-y-6">
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

      {/* Danger Zone */}
      <div className="mt-12 pt-8 border-t">
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-6">
          <h3 className="text-base font-bold text-red-900 mb-2">منطقة الخطر - حذف الحساب والبيانات</h3>
          <p className="text-sm text-red-700 leading-relaxed mb-4">
            عند طلب حذف الحساب، سيتم إيقاف حسابك وجدولة الحذف النهائي لكافة بياناتك وعيادتك وموقعك الإلكتروني خلال 15 يوماً. يمكنك إلغاء الطلب بتسجيل الدخول مجدداً قبل انقضاء المدة.
          </p>
          <a
            href="/delete-account"
            className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-700 transition-colors"
          >
            الانتقال لصفحة طلب حذف الحساب
          </a>
        </div>
      </div>
    </div>
  )
}
