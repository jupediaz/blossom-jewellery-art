import type { Metadata } from "next";
import Image from "next/image";
import { Link } from '@/i18n/navigation';
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("About");
  return {
    title: t("title"),
    description: t("metaDescription"),
  };
}

export default async function AboutPage() {
  const t = await getTranslations("About");

  const values = [
    { title: t("value1Title"), text: t("value1Text") },
    { title: t("value2Title"), text: t("value2Text") },
    { title: t("value3Title"), text: t("value3Text") },
  ];

  const steps = [
    { step: "01", title: t("step1Title"), text: t("step1Text") },
    { step: "02", title: t("step2Title"), text: t("step2Text") },
    { step: "03", title: t("step3Title"), text: t("step3Text") },
    { step: "04", title: t("step4Title"), text: t("step4Text") },
  ];

  return (
    <div>
      {/* Hero — Meet the Artist */}
      <section className="bg-cream-dark/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-12">
            <p className="text-sage text-sm font-medium tracking-widest uppercase mb-3">
              {t("artistTitle")}
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl font-light mb-2">
              {t("artistName")}
            </h1>
            <p className="text-sage-dark text-sm italic">
              {t("artistRole")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14 items-start">
            <div className="lg:col-span-2 flex justify-center">
              <div className="relative w-72 sm:w-80 lg:w-full">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src="/images/about/olha-artist-portrait.jpg"
                    alt={t("artistName")}
                    fill
                    sizes="(max-width: 1024px) 320px, 40vw"
                    className="object-cover object-center"
                    priority
                  />
                </div>
                <div className="absolute -bottom-3 -right-3 bg-white rounded-xl px-4 py-2 shadow-lg">
                  <p className="text-xs text-warm-gray uppercase tracking-wider">{t("handmadeIn")}</p>
                  <p className="font-heading text-base text-charcoal">{t("europe")}</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-4 text-warm-gray leading-relaxed">
              <p>{t("bio1")}</p>
              <p>{t("bio2")}</p>
              <p>{t("bio3")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Craft */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <p className="text-sage text-sm font-medium tracking-widest uppercase mb-3">
                {t("craftTitle")}
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl font-light mb-6">
                {t("craftSubtitle")}
              </h2>
              <div className="space-y-4 text-warm-gray leading-relaxed">
                <p>{t("craft1")}</p>
                <p>{t("craft2")}</p>
                <p>{t("craft3")}</p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/images/about/crafting-process.jpg"
                  alt={t("craftTitle")}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-cream-dark/20 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-light text-center mb-12">
            {t("specialTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <h3 className="font-heading text-xl mb-3">{value.title}</h3>
                <p className="text-sm text-warm-gray leading-relaxed">
                  {value.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workshop */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/images/about/workshop-atelier.jpg"
                  alt={t("workshopTitle")}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
            <div>
              <p className="text-sage text-sm font-medium tracking-widest uppercase mb-3">
                {t("workshopTitle")}
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl font-light mb-6">
                {t("workshopSubtitle")}
              </h2>
              <div className="space-y-4 text-warm-gray leading-relaxed">
                <p>{t("workshop1")}</p>
                <p>{t("workshop2")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creative Process */}
      <section className="bg-cream-dark/20 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-light text-center mb-12">
            {t("creativeProcess")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item) => (
              <div key={item.step}>
                <span className="text-3xl font-heading text-sage/40">
                  {item.step}
                </span>
                <h3 className="font-heading text-lg mt-2 mb-2">{item.title}</h3>
                <p className="text-sm text-warm-gray">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-sage/10 py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="font-heading text-3xl font-light mb-4">
            {t("ctaTitle")}
          </h2>
          <p className="text-warm-gray mb-8">
            {t("ctaText")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 bg-charcoal text-cream px-8 py-3 rounded text-sm tracking-wide hover:bg-charcoal/90 transition-colors"
            >
              {t("shopAll")}
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/collections"
              className="inline-flex items-center justify-center gap-2 border border-charcoal text-charcoal px-8 py-3 rounded text-sm tracking-wide hover:bg-charcoal hover:text-cream transition-colors"
            >
              {t("browseCollections")}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
