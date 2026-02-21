import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

export default function NotFound() {
  const t = useTranslations('Common')

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-heading text-6xl font-light text-sage/30 mb-4">
        404
      </h1>
      <h2 className="font-heading text-2xl font-light mb-4">
        {t('pageNotFound')}
      </h2>
      <p className="text-warm-gray text-sm mb-8">
        {t('pageNotFoundText')}
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-charcoal text-cream px-8 py-3 rounded text-sm tracking-wide hover:bg-charcoal/90 transition-colors"
      >
        {t('backToHome')}
      </Link>
    </div>
  )
}
