import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { ChevronDown } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("FAQ");
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

const FAQ_KEYS = [
  ["materialsQ", "materialsA"],
  ["careQ", "careA"],
  ["shippingQ", "shippingA"],
  ["customQ", "customA"],
  ["returnsQ", "returnsA"],
  ["wholesaleQ", "wholesaleA"],
  ["allergiesQ", "allergiesA"],
] as const;

export default async function FaqPage() {
  const t = await getTranslations("FAQ");
  const tc = await getTranslations("Common");

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-4xl font-light mb-3">{t("title")}</h1>
      <p className="text-warm-gray mb-10">{t("subtitle")}</p>

      <div className="divide-y divide-cream-dark">
        {FAQ_KEYS.map(([q, a]) => (
          <details key={q} className="group py-5">
            <summary className="flex items-center justify-between cursor-pointer list-none gap-4">
              <span className="font-medium text-charcoal">{t(q)}</span>
              <ChevronDown
                size={18}
                className="flex-shrink-0 text-warm-gray transition-transform duration-200 group-open:rotate-180"
              />
            </summary>
            <p className="mt-3 text-sm text-warm-gray leading-relaxed">{t(a)}</p>
          </details>
        ))}
      </div>

      <div className="mt-12 rounded-lg bg-cream-dark/40 p-6 text-center">
        <p className="font-heading text-lg mb-3">{t("stillHaveQuestions")}</p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 bg-charcoal text-cream px-6 py-2.5 rounded text-sm tracking-wide hover:bg-charcoal/90 transition-colors"
        >
          {t("contactUs")}
        </Link>
      </div>
    </div>
  );
}
