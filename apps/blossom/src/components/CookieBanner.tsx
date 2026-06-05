"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

const CONSENT_KEY = "cookie_consent";

export function useCookieConsent() {
  const [consent, setConsent] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    setConsent(stored === "true" ? true : stored === "false" ? false : null);
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "true");
    setConsent(true);
    window.dispatchEvent(new Event("cookie-consent-accepted"));
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, "false");
    setConsent(false);
  };

  return { consent, accept, decline };
}

export function CookieBanner() {
  const t = useTranslations("Footer");
  const { consent, accept, decline } = useCookieConsent();

  // Not yet decided
  if (consent !== null) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-cream-dark bg-white px-4 py-4 shadow-lg sm:px-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-warm-gray leading-relaxed max-w-xl">
          {t("cookieNotice")}{" "}
          <a href="/privacy" className="underline hover:text-charcoal">
            {t("privacyPolicy")}
          </a>
          .
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={decline}
            className="rounded border border-cream-dark px-4 py-1.5 text-xs text-warm-gray hover:border-warm-gray transition-colors"
          >
            {t("cookieDecline")}
          </button>
          <button
            onClick={accept}
            className="rounded bg-charcoal px-4 py-1.5 text-xs text-white hover:bg-charcoal/90 transition-colors"
          >
            {t("cookieAccept")}
          </button>
        </div>
      </div>
    </div>
  );
}
