import type { Metadata } from "next";
import { Mail, Instagram, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/ContactForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Contact");
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function ContactPage() {
  const t = await getTranslations("Contact");

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-4xl font-light mb-4">{t("title")}</h1>
      <p className="text-warm-gray mb-12">
        {t("subtitle")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <ContactForm />

        <div className="space-y-8">
          <div>
            <h2 className="font-heading text-xl mb-4">{t("title")}</h2>
            <div className="space-y-4">
              <a
                href="mailto:hello@blossomjewellery.art"
                className="flex items-center gap-3 text-sm text-warm-gray hover:text-charcoal transition-colors"
              >
                <Mail size={18} />
                hello@blossomjewellery.art
              </a>
              <a
                href="https://instagram.com/blossomjewelleryart"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-warm-gray hover:text-charcoal transition-colors"
              >
                <Instagram size={18} />
                @blossomjewelleryart
              </a>
              <div className="flex items-center gap-3 text-sm text-warm-gray">
                <MapPin size={18} />
                {t("location")}
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-heading text-xl mb-4">{t("customOrders")}</h2>
            <p className="text-sm text-warm-gray leading-relaxed">
              {t("customOrdersText")}
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl mb-4">{t("responseTime")}</h2>
            <p className="text-sm text-warm-gray leading-relaxed">
              {t("responseTimeText")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
