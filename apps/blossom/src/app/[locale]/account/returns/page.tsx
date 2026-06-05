import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { RotateCcw } from 'lucide-react'
import { format } from 'date-fns'
import { formatPrice } from '@/lib/utils'
import type { Metadata } from 'next'

type ReasonKey = 'WRONG_ITEM' | 'DEFECTIVE' | 'NOT_AS_DESCRIBED' | 'CHANGED_MIND' | 'OTHER'
type StatusKey = 'REQUESTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
type ResolutionKey = 'REFUND' | 'EXCHANGE' | 'STORE_CREDIT'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Account')
  return { title: t('myReturns') }
}

const STATUS_STYLES: Record<string, string> = {
  REQUESTED: 'bg-blue-50 text-blue-700',
  UNDER_REVIEW: 'bg-amber-50 text-amber-700',
  APPROVED: 'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-red-50 text-red-700',
  COMPLETED: 'bg-gray-100 text-gray-600',
}

export default async function AccountReturnsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const t = await getTranslations('Account')

  const returns = await db.return.findMany({
    where: { customerId: session.user.id },
    include: {
      order: { select: { orderNumber: true, total: true, createdAt: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (returns.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-medium text-gray-900">{t('myReturns')}</h2>
        <div className="rounded-xl border border-cream-dark bg-white px-6 py-16 text-center">
          <RotateCcw className="mx-auto mb-4 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-900">{t('returnsEmpty')}</p>
          <p className="mt-1 text-sm text-warm-gray">{t('returnsEmptyDesc')}</p>
          <Link
            href="/account/orders"
            className="mt-4 inline-block rounded-lg bg-charcoal px-5 py-2 text-sm font-medium text-white hover:bg-charcoal/90"
          >
            {t('orders')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium text-gray-900">{t('myReturns')}</h2>
      <div className="space-y-3">
        {returns.map((r) => (
          <div key={r.id} className="rounded-xl border border-cream-dark bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900">{r.order.orderNumber}</p>
                <p className="text-xs text-warm-gray mt-0.5">
                  {t(({ WRONG_ITEM: 'returnReasonWrongItem', DEFECTIVE: 'returnReasonDefective', NOT_AS_DESCRIBED: 'returnReasonNotAsDescribed', CHANGED_MIND: 'returnReasonChangedMind', OTHER: 'returnReasonOther' } as Record<ReasonKey, string>)[r.reason as ReasonKey] ?? r.reason)}
                </p>
                {r.details && (
                  <p className="text-xs text-warm-gray mt-1 italic">"{r.details}"</p>
                )}
                {r.adminNote && (
                  <p className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-700">
                    <span className="font-medium">Note:</span> {r.adminNote}
                  </p>
                )}
              </div>
              <div className="shrink-0 text-right space-y-1.5">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[r.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {t(({ REQUESTED: 'returnStatusRequested', UNDER_REVIEW: 'returnStatusUnderReview', APPROVED: 'returnStatusApproved', REJECTED: 'returnStatusRejected', COMPLETED: 'returnStatusCompleted' } as Record<StatusKey, string>)[r.status as StatusKey] ?? r.status)}
                </span>
                <p className="text-xs text-warm-gray">{format(r.createdAt, 'd MMM yyyy')}</p>
                {r.resolution && (
                  <p className="text-xs font-medium text-emerald-700">
                    {t(({ REFUND: 'returnResolutionRefund', EXCHANGE: 'returnResolutionExchange', STORE_CREDIT: 'returnResolutionStoreCredit' } as Record<ResolutionKey, string>)[r.resolution as ResolutionKey] ?? r.resolution)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
