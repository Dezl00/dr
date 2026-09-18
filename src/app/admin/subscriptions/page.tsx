import { requireSuperAdmin } from "@/lib/auth/dal";
import { prisma } from "@/lib/db/prisma";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export const metadata = { title: "الاشتراكات - مدير النظام" };

export default async function AdminSubscriptionsPage() {
  await requireSuperAdmin();
  const subscriptions = await prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: { clinic: { select: { name: true, slug: true } }, plan: { select: { nameAr: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">اشتراكات العيادات</h1>
        <p className="text-sm text-gray-500 mt-1">عرض جميع الاشتراكات النشطة وغيرها</p>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
            <tr>
              <th className="px-6 py-3">العيادة</th>
              <th className="px-6 py-3">الباقة</th>
              <th className="px-6 py-3">تاريخ البداية</th>
              <th className="px-6 py-3">تاريخ النهاية</th>
              <th className="px-6 py-3">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium">{sub.clinic.name}</td>
                <td className="px-6 py-4">{sub.plan.nameAr}</td>
                <td className="px-6 py-4" dir="ltr">{format(sub.startDate, "PP", { locale: ar })}</td>
                <td className="px-6 py-4" dir="ltr">{sub.endDate ? format(sub.endDate, "PP", { locale: ar }) : "مفتوح"}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      sub.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : sub.status === "PAST_DUE"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {sub.status === "ACTIVE"
                      ? "نشط"
                      : sub.status === "PAST_DUE"
                      ? "متأخر"
                      : sub.status === "CANCELLED"
                      ? "ملغي"
                      : "موقوف"}
                  </span>
                </td>
              </tr>
            ))}
            {subscriptions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  لا توجد اشتراكات حالياً.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
