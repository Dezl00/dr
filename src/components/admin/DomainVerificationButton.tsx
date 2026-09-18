"use client";

import { useState } from "react";
import { verifyDomain } from "@/actions/admin";
import { CheckCircle2 } from "lucide-react";

export default function DomainVerificationButton({ domainId }: { domainId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    setLoading(true);
    await verifyDomain(domainId);
    setLoading(false);
  }

  return (
    <button
      onClick={handleVerify}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
    >
      <CheckCircle2 className="w-4 h-4" />
      {loading ? "جاري التحقق..." : "تأكيد التحقق"}
    </button>
  );
}
