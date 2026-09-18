"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { savePlan } from "@/actions/admin";

export default function PlanForm({ initialData = null }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await savePlan(formData, initialData?.id);
      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/admin/plans");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الاسم بالعربية</label>
          <input
            name="nameAr"
            required
            defaultValue={initialData?.nameAr}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الاسم بالإنجليزية</label>
          <input
            name="name"
            required
            defaultValue={initialData?.name}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">الرابط اللطيف (Slug)</label>
        <input
          name="slug"
          required
          defaultValue={initialData?.slug}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={initialData?.description}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">السعر الشهري ($)</label>
          <input
            name="priceMonthly"
            type="number"
            step="0.01"
            defaultValue={initialData?.priceMonthly}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">السعر السنوي ($)</label>
          <input
            name="priceYearly"
            type="number"
            step="0.01"
            defaultValue={initialData?.priceYearly}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isActive"
          id="isActive"
          defaultChecked={initialData ? initialData.isActive : true}
          className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">باقة نشطة</label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ترتيب العرض</label>
        <input
          name="sortOrder"
          type="number"
          defaultValue={initialData?.sortOrder ?? 0}
          className="w-full md:w-1/4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
        >
          {loading ? "جاري الحفظ..." : "حفظ الباقة"}
        </button>
      </div>
    </form>
  );
}
