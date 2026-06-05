import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { CheckCircle } from "lucide-react";

export default async function UnsubscribedPage() {
  const tc = await getTranslations("Common");

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <CheckCircle size={48} className="mx-auto text-sage-dark mb-6" />
      <h1 className="font-heading text-3xl font-light mb-4">{tc("unsubscribedTitle")}</h1>
      <p className="text-warm-gray mb-8">
        {tc("unsubscribedText")}
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-charcoal text-cream px-8 py-3 rounded text-sm tracking-wide hover:bg-charcoal/90 transition-colors"
      >
        {tc("home")}
      </Link>
    </div>
  );
}
