import { requireSuperAdmin } from "@/lib/auth/dal";
import { prisma } from "@/lib/db/prisma";
import DomainVerificationButton from "@/components/admin/DomainVerificationButton";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export const metadata = { title: "النطاقات - مدير النظام" };

export default async function AdminDomainsPage() {
  await requireSuperAdmin();
  const domains = await prisma.domain.findMany({
    orderBy: { createdAt: "desc" },
    include: { clinic: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">النطاقات المخصصة</h1>
        <p className="text-sm text-gray-500 mt-1">إدارة نطاقات العيادات والتحقق من DNS</p>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
            <tr>
              <th className="px-6 py-3">النطاق</th>
              <th className="px-6 py-3">العيادة</th>
              <th className="px-6 py-3">النوع</th>
              <th className="px-6 py-3">تاريخ الإضافة</th>
              <th className="px-6 py-3">الحالة</th>
              <th className="px-6 py-3">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {domains.map((domain) => (
              <tr key={domain.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium" dir="ltr">{domain.domain}</td>
                <td className="px-6 py-4">{domain.clinic.name}</td>
                <td className="px-6 py-4">
                  {domain.type === "CUSTOM_DOMAIN" ? "مخصص" : "نطاق فرعي"}
                </td>
                <td className="px-6 py-4" dir="ltr">{format(domain.createdAt, "PP", { locale: ar })}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      domain.status === "ACTIVE" || domain.status === "VERIFIED"
                        ? "bg-green-100 text-green-800"
                        : domain.status === "PENDING" || domain.status === "VERIFICATION_REQUIRED"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {domain.status === "ACTIVE"
                      ? "نشط"
                      : domain.status === "VERIFIED"
                      ? "تم التحقق"
                      : domain.status === "PENDING"
                      ? "قيد الانتظار"
                      : domain.status === "VERIFICATION_REQUIRED"
                      ? "مطلوب التحقق"
                      : "فشل / معلق"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {(domain.status === "PENDING" || domain.status === "VERIFICATION_REQUIRED") && domain.type === "CUSTOM_DOMAIN" ? (
                    <DomainVerificationButton domainId={domain.id} />
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
            {domains.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  لا توجد نطاقات مخصصة.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
