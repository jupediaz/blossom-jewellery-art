"use client";

import { useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface NewsletterFormProps {
  variant?: "light" | "dark";
}

export function NewsletterForm({ variant = "light" }: NewsletterFormProps) {
  const t = useTranslations("Home");
  const locale = useLocale();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });

      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center justify-center gap-2 py-2">
        <CheckCircle size={18} className="text-emerald-500" />
        <p className={`text-sm ${variant === "dark" ? "text-cream" : "text-charcoal"}`}>
          {t("subscribed")}
        </p>
      </div>
    );
  }

  const isDark = variant === "dark";

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        name="email"
        placeholder={t("emailPlaceholder")}
        required
        className={
          isDark
            ? "flex-1 bg-transparent border border-cream-dark/30 rounded px-3 py-2 text-sm text-cream placeholder:text-cream-dark/50 focus:outline-none focus:border-gold"
            : "flex-1 border border-sage rounded px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-dusty-rose"
        }
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-dusty-rose text-white px-6 py-2.5 rounded text-sm hover:bg-dusty-rose-dark transition-colors disabled:opacity-60 flex items-center gap-1.5"
      >
        {status === "loading" && <Loader2 size={14} className="animate-spin" />}
        {t("subscribe")}
      </button>
      {status === "error" && (
        <p className={`text-xs mt-1 ${isDark ? "text-dusty-rose" : "text-dusty-rose-dark"}`}>
          {t("subscribeError")}
        </p>
      )}
    </form>
  );
}
