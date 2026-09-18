import { requireSuperAdmin } from "@/lib/auth/dal";
import PlanForm from "@/components/admin/PlanForm";

export const metadata = { title: "إضافة باقة - مدير النظام" };

export default async function NewPlanPage() {
  await requireSuperAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">إضافة باقة جديدة</h1>
        <p className="text-sm text-gray-500 mt-1">إنشاء باقة اشتراك جديدة للمنصة</p>
      </div>
      
      <div className="p-6 bg-white border border-gray-200 rounded-lg">
        <PlanForm />
      </div>
    </div>
  );
}
