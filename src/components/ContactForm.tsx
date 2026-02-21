"use client";

import { useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export function ContactForm() {
  const t = useTranslations("Contact");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      subject: (form.elements.namedItem("subject") as HTMLSelectElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle size={48} className="text-emerald-500 mb-4" />
        <h3 className="font-heading text-xl mb-2">{t("successTitle")}</h3>
        <p className="text-warm-gray text-sm">{t("successText")}</p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm text-sage hover:text-sage-dark underline"
        >
          {t("sendAnother")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          {t("nameLabel")}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="w-full border border-cream-dark rounded px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-sage"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          {t("emailLabel")}
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full border border-cream-dark rounded px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-sage"
        />
      </div>
      <div>
        <label htmlFor="subject" className="block text-sm font-medium mb-1">
          {t("subject")}
        </label>
        <select
          id="subject"
          name="subject"
          className="w-full border border-cream-dark rounded px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-sage"
        >
          <option value="general">{t("subjectGeneral")}</option>
          <option value="custom">{t("subjectCustom")}</option>
          <option value="wholesale">{t("subjectWholesale")}</option>
          <option value="collaboration">{t("subjectCollab")}</option>
          <option value="other">{t("subjectOther")}</option>
        </select>
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1">
          {t("messageLabel")}
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          minLength={10}
          placeholder={t("messagePlaceholder")}
          className="w-full border border-cream-dark rounded px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-sage resize-none"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-dusty-rose-dark">{t("errorText")}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-charcoal text-cream py-3 rounded text-sm tracking-wide hover:bg-charcoal/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {status === "loading" && <Loader2 size={16} className="animate-spin" />}
        {t("sendMessage")}
      </button>
    </form>
  );
}
