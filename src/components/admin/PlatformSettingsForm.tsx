"use client";

import { useState } from "react";
import { savePlatformSettings } from "@/actions/admin";

export default function PlatformSettingsForm({ initialData }: { initialData: any }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    
    const formData = new FormData(e.currentTarget);
    try {
      const res = await savePlatformSettings(formData) as any;
      if (res?.error) {
        setError(res.error);
      } else {
        setMessage("تم حفظ الإعدادات بنجاح.");
      }
    } catch (err: any) {
      setError("حدث خطأ غير متوقع.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm border border-red-200 rounded-md">
          {error}
        </div>
      )}
      {message && (
        <div className="p-4 bg-green-50 text-green-700 text-sm border border-green-200 rounded-md">
          {message}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنصة</label>
        <input
          name="platformName"
          required
          defaultValue={initialData?.platformName}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">اللون الأساسي</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              name="primaryColor"
              defaultValue={initialData?.primaryColor}
              className="w-10 h-10 p-1 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              name="primaryColorText"
              defaultValue={initialData?.primaryColor}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black font-mono text-sm"
              dir="ltr"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">اللون الثانوي</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              name="accentColor"
              defaultValue={initialData?.accentColor}
              className="w-10 h-10 p-1 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              name="accentColorText"
              defaultValue={initialData?.accentColor}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black font-mono text-sm"
              dir="ltr"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">نصف قطر الحواف (Border Radius)</label>
        <input
          name="defaultRadius"
          defaultValue={initialData?.defaultRadius}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black font-mono text-sm"
          dir="ltr"
          placeholder="e.g. 0.5rem"
        />
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
        >
          {loading ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </button>
      </div>
    </form>
  );
}
