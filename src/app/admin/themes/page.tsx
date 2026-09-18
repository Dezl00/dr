import { requireSuperAdmin } from "@/lib/auth/dal";
import { prisma } from "@/lib/db/prisma";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export const metadata = { title: "القوالب - مدير النظام" };

export default async function AdminThemesPage() {
  await requireSuperAdmin();
  const themes = await prisma.websiteTheme.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { websites: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">قوالب الموقع</h1>
          <p className="text-sm text-gray-500 mt-1">إدارة قوالب وتصميمات المواقع للعيادات</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <div key={theme.id} className="border border-gray-200 rounded-lg bg-white overflow-hidden flex flex-col">
            <div className="h-40 bg-gray-100 flex items-center justify-center border-b border-gray-200 text-gray-400">
              {/* Placeholder for theme image */}
              <span className="text-sm">صورة القالب</span>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="text-lg font-medium">{theme.nameAr}</h3>
              <p className="text-sm text-gray-500 mb-2">{theme.name}</p>
              <p className="text-xs text-gray-400 mb-4 flex-1 line-clamp-2">
                {theme.description || "لا يوجد وصف"}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {theme._count.websites} مواقع
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    theme.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {theme.isActive ? "نشط" : "غير نشط"}
                </span>
              </div>
            </div>
          </div>
        ))}
        {themes.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white border border-gray-200 rounded-lg">
            لا توجد قوالب حالياً.
          </div>
        )}
      </div>
    </div>
  );
}
