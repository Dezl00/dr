import { requireSuperAdmin } from "@/lib/auth/dal";
import { prisma } from "@/lib/db/prisma";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export const metadata = { title: "سجل التدقيق - مدير النظام" };

export default async function AdminAuditLogsPage() {
  await requireSuperAdmin();
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100, // Show last 100 logs
    include: {
      actor: { select: { fullName: true, email: true } },
      clinic: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">سجل التدقيق (Audit Logs)</h1>
        <p className="text-sm text-gray-500 mt-1">عرض آخر 100 حركة وتغيير في النظام</p>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
            <tr>
              <th className="px-6 py-3">التاريخ والوقت</th>
              <th className="px-6 py-3">المستخدم</th>
              <th className="px-6 py-3">الإجراء</th>
              <th className="px-6 py-3">العيادة</th>
              <th className="px-6 py-3">الكيان / المورد</th>
              <th className="px-6 py-3">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap" dir="ltr">
                  {format(log.createdAt, "PP pp", { locale: ar })}
                </td>
                <td className="px-6 py-4">
                  {log.actor ? (
                    <div>
                      <div className="font-medium">{log.actor.fullName}</div>
                      <div className="text-xs text-gray-500" dir="ltr">{log.actor.email}</div>
                    </div>
                  ) : (
                    <span className="text-gray-400">نظام</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-mono">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {log.clinic?.name || <span className="text-gray-400">-</span>}
                </td>
                <td className="px-6 py-4">
                  {log.resource ? (
                    <span className="text-xs text-gray-600">
                      {log.resource} ({log.resourceId})
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 font-mono text-xs text-gray-500" dir="ltr">
                  {log.ipAddress || "-"}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  لا توجد سجلات.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
