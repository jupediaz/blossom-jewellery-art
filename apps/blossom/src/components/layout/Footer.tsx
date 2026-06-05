"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="bg-cream overflow-hidden">
      {/* Main footer grid */}
      <div className="mx-auto max-w-[1260px] px-6 lg:px-10 pt-16 pb-10">
        {/* Logo — same as Header */}
        <div className="flex flex-col items-center mb-12">
          <Link href="/" className="flex items-center gap-2 leading-none">
            <Image src="/logo_blossom.webp" alt="" width={36} height={36} className="h-9 w-9 flex-shrink-0" />
            <div className="flex flex-col items-center">
              <span className="font-heading text-[1.55rem] tracking-[0.22em] text-navy leading-none">
                BLOSSOM
              </span>
              <span className="text-[14px] font-body font-semibold tracking-[0.3em] uppercase text-terracotta mt-[1px]">
                by Olha
              </span>
            </div>
          </Link>
        </div>

        {/* 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-center mb-12">
          {/* About */}
          <div>
            <h4 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-navy font-body mb-5">
              {t("sectionAbout")}
            </h4>
            <ul className="space-y-3 text-[13px] text-navy font-body">
              <li><Link href="/about" className="opacity-70 hover:opacity-100 transition-opacity">{t("ourStory")}</Link></li>
              <li><Link href="/blog" className="opacity-70 hover:opacity-100 transition-opacity">{t("journal")}</Link></li>
              <li><Link href="/about" className="opacity-70 hover:opacity-100 transition-opacity">{t("ourMaterials")}</Link></li>
              <li><Link href="/contact" className="opacity-70 hover:opacity-100 transition-opacity">{t("contactUs")}</Link></li>
            </ul>
          </div>

          {/* Store */}
          <div>
            <h4 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-navy font-body mb-5">
              {t("sectionStore")}
            </h4>
            <ul className="space-y-3 text-[13px] text-navy font-body">
              <li><Link href="/collections" className="opacity-70 hover:opacity-100 transition-opacity">{t("collections")}</Link></li>
              <li><Link href="/products" className="opacity-70 hover:opacity-100 transition-opacity">{t("allPieces")}</Link></li>
              <li><Link href="/products?sort=new" className="opacity-70 hover:opacity-100 transition-opacity">{t("newArrivals")}</Link></li>
              <li><Link href="/shipping" className="opacity-70 hover:opacity-100 transition-opacity">{t("shippingInfo")}</Link></li>
            </ul>
          </div>

          {/* Care */}
          <div>
            <h4 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-navy font-body mb-5">
              {t("sectionCare")}
            </h4>
            <ul className="space-y-3 text-[13px] text-navy font-body">
              <li><Link href="/shipping" className="opacity-70 hover:opacity-100 transition-opacity">{t("shippingReturns")}</Link></li>
              <li><Link href="/orders/track" className="opacity-70 hover:opacity-100 transition-opacity">{t("trackOrder")}</Link></li>
              <li><Link href="/size-guide" className="opacity-70 hover:opacity-100 transition-opacity">{t("sizeGuide")}</Link></li>
              <li><Link href="/faq" className="opacity-70 hover:opacity-100 transition-opacity">{t("faq")}</Link></li>
              <li><Link href="/privacy" className="opacity-70 hover:opacity-100 transition-opacity">{t("privacyPolicy")}</Link></li>
              <li><Link href="/terms" className="opacity-70 hover:opacity-100 transition-opacity">{t("termsOfService")}</Link></li>
            </ul>
          </div>
        </div>

        {/* Social + copyright */}
        <div className="flex flex-col items-center gap-6 text-center border-t border-cream-dark/60 pt-8">
          <div className="flex items-center gap-6">
            <a
              href="https://instagram.com/blossombyolha"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] font-body font-semibold tracking-[0.1em] uppercase text-navy opacity-70 hover:opacity-100 transition-opacity"
            >
              Instagram
            </a>
            <span className="text-navy opacity-30">·</span>
            <a
              href="mailto:hello@blossombyolha.com"
              className="text-[12px] font-body font-semibold tracking-[0.1em] uppercase text-navy opacity-70 hover:opacity-100 transition-opacity"
            >
              Email
            </a>
          </div>
          <p className="text-[11px] text-navy opacity-50 font-body">
            &copy; {new Date().getFullYear()} Blossom by Olha. {t("rights")}.
          </p>
        </div>
      </div>

      {/* Giant watermark at the very bottom */}
      <div aria-hidden="true" className="overflow-hidden leading-none select-none pointer-events-none">
        <div
          className="font-heading whitespace-nowrap"
          style={{ fontSize: "clamp(60px,11vw,160px)", color: "#EEE8E3", lineHeight: 0.95 }}
        >
          {t("watermarkTagline1")}
        </div>
        <div
          className="font-heading whitespace-nowrap"
          style={{ fontSize: "clamp(60px,11vw,160px)", color: "#EEE8E3", lineHeight: 0.95 }}
        >
          {t("watermarkTagline2")}
        </div>
      </div>
    </footer>
  );
}
