import type { Metadata } from "next";
import { Link } from '@/i18n/navigation';
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Shipping");
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function ShippingPage() {
  const t = await getTranslations("Shipping");

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-4xl font-light mb-8">
        {t("title")}
      </h1>

      <div className="space-y-10 text-sm text-warm-gray leading-relaxed">
        <section>
          <h2 className="font-heading text-xl text-charcoal mb-4">{t("shippingSection")}</h2>
          <div className="space-y-3">
            <p>{t("shippingIntro")}</p>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-cream-dark">
                  <th className="py-2 font-medium text-charcoal">{t("destination")}</th>
                  <th className="py-2 font-medium text-charcoal">{t("deliveryTime")}</th>
                  <th className="py-2 font-medium text-charcoal">{t("cost")}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-cream-dark/50">
                  <td className="py-2">{t("spain")}</td>
                  <td className="py-2">{t("spainDelivery")}</td>
                  <td className="py-2">{t("spainCost")}</td>
                </tr>
                <tr className="border-b border-cream-dark/50">
                  <td className="py-2">{t("euCountries")}</td>
                  <td className="py-2">{t("euDelivery")}</td>
                  <td className="py-2">{t("euCost")}</td>
                </tr>
                <tr className="border-b border-cream-dark/50">
                  <td className="py-2">{t("uk")}</td>
                  <td className="py-2">{t("ukDelivery")}</td>
                  <td className="py-2">{t("ukCost")}</td>
                </tr>
                <tr>
                  <td className="py-2">{t("restOfWorld")}</td>
                  <td className="py-2">{t("rowDelivery")}</td>
                  <td className="py-2">{t("rowCost")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-4">{t("orderTracking")}</h2>
          <p>{t("orderTrackingText")}</p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-4">{t("returns")}</h2>
          <div className="space-y-3">
            <p>{t("returnsIntro")}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t("returnCondition1")}</li>
              <li>{t("returnCondition2")}</li>
              <li>{t("returnCondition3")}</li>
              <li>{t("returnCondition4")}</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-4">{t("customOrders")}</h2>
          <p>{t("customOrdersText")}</p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-4">{t("questions")}</h2>
          <p>
            {t("questionsText")}{" "}
            <Link href="/contact" className="text-sage hover:text-sage-dark underline">
              {t("contactUs")}
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
