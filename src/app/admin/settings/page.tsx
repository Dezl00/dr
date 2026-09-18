import { requireSuperAdmin } from "@/lib/auth/dal";
import { prisma } from "@/lib/db/prisma";
import PlatformSettingsForm from "@/components/admin/PlatformSettingsForm";

export const metadata = { title: "إعدادات المنصة - مدير النظام" };

export default async function AdminSettingsPage() {
  await requireSuperAdmin();
  
  let settings = await prisma.platformSettings.findFirst();
  
  // Create default if not exists
  if (!settings) {
    settings = await prisma.platformSettings.create({
      data: { platformName: "DRS" }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">إعدادات المنصة</h1>
        <p className="text-sm text-gray-500 mt-1">التحكم في الإعدادات العامة والتخصيص الأساسي</p>
      </div>

      <div className="p-6 bg-white border border-gray-200 rounded-lg">
        <PlatformSettingsForm initialData={settings} />
      </div>
    </div>
  );
}
