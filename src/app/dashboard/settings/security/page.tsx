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
