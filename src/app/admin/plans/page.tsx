import { requireSuperAdmin } from "@/lib/auth/dal";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";

export const metadata = { title: "الباقات - مدير النظام" };

export default async function AdminPlansPage() {
  await requireSuperAdmin();
  const plans = await prisma.plan.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { subscriptions: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">باقات الاشتراك</h1>
          <p className="text-sm text-gray-500 mt-1">إدارة خطط الأسعار والاشتراكات</p>
        </div>
        <Link
          href="/admin/plans/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
        >
          <PlusCircle className="w-4 h-4" />
          إضافة باقة
        </Link>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
            <tr>
              <th className="px-6 py-3">اسم الباقة (عربي)</th>
              <th className="px-6 py-3">الاسم (إنجليزي)</th>
              <th className="px-6 py-3">السعر الشهري</th>
              <th className="px-6 py-3">السعر السنوي</th>
              <th className="px-6 py-3">المشتركين</th>
              <th className="px-6 py-3">الحالة</th>
              <th className="px-6 py-3">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {plans.map((plan) => (
              <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium">{plan.nameAr}</td>
                <td className="px-6 py-4">{plan.name}</td>
                <td className="px-6 py-4">{plan.priceMonthly ? `$${plan.priceMonthly.toString()}` : "مجاني"}</td>
                <td className="px-6 py-4">{plan.priceYearly ? `$${plan.priceYearly.toString()}` : "مجاني"}</td>
                <td className="px-6 py-4">{plan._count.subscriptions}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      plan.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {plan.isActive ? "نشط" : "غير نشط"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/plans/${plan.id}`}
                      className="text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {plans.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  لا توجد باقات حالياً.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
