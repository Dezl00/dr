import { requireSuperAdmin } from "@/lib/auth/dal";
import { prisma } from "@/lib/db/prisma";

export const metadata = { title: "الخطوط - مدير النظام" };

export default async function AdminFontsPage() {
  await requireSuperAdmin();
  const fonts = await prisma.font.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { clinicSettings: true, weights: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">خطوط المنصة</h1>
        <p className="text-sm text-gray-500 mt-1">إدارة الخطوط المتاحة للعيادات في النظام</p>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
            <tr>
              <th className="px-6 py-3">الاسم</th>
              <th className="px-6 py-3">العائلة (font-family)</th>
              <th className="px-6 py-3">عدد الأوزان</th>
              <th className="px-6 py-3">استخدام العيادات</th>
              <th className="px-6 py-3">الحالة</th>
              <th className="px-6 py-3">الافتراضي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {fonts.map((font) => (
              <tr key={font.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium">{font.name}</td>
                <td className="px-6 py-4" dir="ltr">{font.family}</td>
                <td className="px-6 py-4">{font._count.weights}</td>
                <td className="px-6 py-4">{font._count.clinicSettings}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      font.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {font.isActive ? "نشط" : "غير نشط"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {font.isDefault && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">افتراضي</span>
                  )}
                </td>
              </tr>
            ))}
            {fonts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  لا توجد خطوط حالياً.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
