import { requireSuperAdmin } from "@/lib/auth/dal";
import { prisma } from "@/lib/db/prisma";
import PlanForm from "@/components/admin/PlanForm";
import { notFound } from "next/navigation";

export const metadata = { title: "تعديل الباقة - مدير النظام" };

export default async function EditPlanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireSuperAdmin();
  const { id } = await params;

  const plan = await prisma.plan.findUnique({
    where: { id },
  });

  if (!plan) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">تعديل الباقة</h1>
        <p className="text-sm text-gray-500 mt-1">تحديث بيانات باقة الاشتراك</p>
      </div>
      
      <div className="p-6 bg-white border border-gray-200 rounded-lg">
        <PlanForm initialData={plan} />
      </div>
    </div>
  );
}
