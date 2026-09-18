import { requireSuperAdmin } from "@/lib/auth/dal";
import { prisma } from "@/lib/db/prisma";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export const metadata = { title: "المستخدمون - مدير النظام" };

export default async function AdminUsersPage() {
  await requireSuperAdmin();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { memberships: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">المستخدمون</h1>
        <p className="text-sm text-gray-500 mt-1">إدارة مستخدمي المنصة (مدراء ومرضى)</p>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
            <tr>
              <th className="px-6 py-3">الاسم</th>
              <th className="px-6 py-3">البريد الإلكتروني</th>
              <th className="px-6 py-3">العيادات المرتبطة</th>
              <th className="px-6 py-3">النوع</th>
              <th className="px-6 py-3">تاريخ التسجيل</th>
              <th className="px-6 py-3">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium">{user.fullName}</td>
                <td className="px-6 py-4" dir="ltr">{user.email}</td>
                <td className="px-6 py-4">{user._count.memberships}</td>
                <td className="px-6 py-4">
                  {user.isSuperAdmin ? (
                    <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-medium">مدير نظام</span>
                  ) : user.isAdmin ? (
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">مدير عيادة</span>
                  ) : (
                    <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium">مستخدم</span>
                  )}
                </td>
                <td className="px-6 py-4" dir="ltr">{format(user.createdAt, "PP", { locale: ar })}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : user.status === "SUSPENDED"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.status === "ACTIVE" ? "نشط" : user.status === "SUSPENDED" ? "موقوف" : "محذوف"}
                  </span>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  لا يوجد مستخدمين.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
