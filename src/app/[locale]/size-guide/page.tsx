import type { Metadata } from "next";
import { Link } from '@/i18n/navigation';
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("SizeGuide");
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function SizeGuidePage() {
  const t = await getTranslations("SizeGuide");

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-4xl font-light mb-8">{t("title")}</h1>

      <div className="space-y-10 text-sm text-warm-gray leading-relaxed">
        <section>
          <h2 className="font-heading text-xl text-charcoal mb-4">{t("ringSizes")}</h2>
          <p className="mb-4">{t("ringInstructions")}</p>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-cream-dark">
                <th className="py-2 font-medium text-charcoal">{t("euSize")}</th>
                <th className="py-2 font-medium text-charcoal">{t("usSize")}</th>
                <th className="py-2 font-medium text-charcoal">{t("circumference")}</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["48", "4.5", "48.0"],
                ["50", "5.5", "50.0"],
                ["52", "6", "52.0"],
                ["54", "7", "54.0"],
                ["56", "7.5", "56.0"],
                ["58", "8.5", "58.0"],
              ].map(([eu, us, mm]) => (
                <tr key={eu} className="border-b border-cream-dark/50">
                  <td className="py-2">{eu}</td>
                  <td className="py-2">{us}</td>
                  <td className="py-2">{mm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-4">{t("braceletSizes")}</h2>
          <p className="mb-4">{t("braceletInstructions")}</p>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-cream-dark">
                <th className="py-2 font-medium text-charcoal">{t("size")}</th>
                <th className="py-2 font-medium text-charcoal">{t("wrist")}</th>
                <th className="py-2 font-medium text-charcoal">{t("braceletLength")}</th>
              </tr>
            </thead>
            <tbody>
              {[
                [t("small"), "14-15", "16-17"],
                [t("medium"), "15-16.5", "17-18.5"],
                [t("large"), "16.5-18", "18.5-20"],
              ].map(([size, wrist, length]) => (
                <tr key={size} className="border-b border-cream-dark/50">
                  <td className="py-2">{size}</td>
                  <td className="py-2">{wrist}</td>
                  <td className="py-2">{length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-4">{t("necklaceLengths")}</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-cream-dark">
                <th className="py-2 font-medium text-charcoal">{t("style")}</th>
                <th className="py-2 font-medium text-charcoal">{t("length")}</th>
                <th className="py-2 font-medium text-charcoal">{t("sitsAt")}</th>
              </tr>
            </thead>
            <tbody>
              {[
                [t("choker"), "35-40", t("baseOfNeck")],
                [t("princess"), "42-48", t("collarbone")],
                [t("matinee"), "50-60", t("aboveBust")],
                [t("opera"), "70-85", t("belowBust")],
              ].map(([style, length, sits]) => (
                <tr key={style} className="border-b border-cream-dark/50">
                  <td className="py-2">{style}</td>
                  <td className="py-2">{length}</td>
                  <td className="py-2">{sits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-4">{t("needHelp")}</h2>
          <p>
            {t("needHelpText")}{" "}
            <Link href="/contact" className="text-sage hover:text-sage-dark underline">
              {t("contactUs")}
            </Link>{" "}
            {t("helpFit")}
          </p>
        </section>
      </div>
    </div>
  );
}
