"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const t = useTranslations("Account");
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cancelled, setCancelled] = useState(false);

  async function handleCancel() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/account/orders/${orderId}/cancel`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel");
      setCancelled(true);
      setTimeout(() => router.refresh(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  if (cancelled) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700">
        <CheckCircle2 size={15} />
        {t("cancelledSuccess")}
      </div>
    );
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-800 transition-colors"
      >
        <X size={14} />
        {t("cancelOrder")}
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-red-100 bg-red-50 p-4 space-y-3">
      <p className="text-sm text-red-800">{t("cancelOrderConfirm")}</p>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleCancel}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {loading && <Loader2 size={12} className="animate-spin" />}
          {t("confirmCancel")}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="rounded-lg border border-red-200 px-4 py-1.5 text-xs text-red-700 hover:bg-red-100 disabled:opacity-50"
        >
          {t("keepOrder")}
        </button>
      </div>
    </div>
  );
}
