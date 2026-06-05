import { db } from '@/lib/db'
import { format } from 'date-fns'
import { RotateCcw } from 'lucide-react'
import { EmptyState } from '@/components/admin/EmptyState'
import { ReturnActions } from './ReturnActions'
import { AdminSearchInput } from '@/components/admin/AdminSearchInput'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

interface Props {
  searchParams: Promise<{ status?: string; page?: string; q?: string }>
}

const PAGE_SIZE = 20

const STATUS_STYLES: Record<string, string> = {
  REQUESTED: 'bg-blue-50 text-blue-700',
  UNDER_REVIEW: 'bg-amber-50 text-amber-700',
  APPROVED: 'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-red-50 text-red-700',
  COMPLETED: 'bg-gray-100 text-gray-600',
}

const REASON_LABELS: Record<string, string> = {
  WRONG_ITEM: 'Wrong item',
  DEFECTIVE: 'Defective',
  NOT_AS_DESCRIBED: 'Not as described',
  CHANGED_MIND: 'Changed mind',
  OTHER: 'Other',
}

export default async function AdminReturnsPage({ searchParams }: Props) {
  const params = await searchParams
  const status = params.status ?? 'REQUESTED'
  const page = Math.max(1, Number(params.page ?? 1))
  const q = params.q?.trim() || undefined

  const where = {
    ...(status !== 'all' ? { status: status as never } : {}),
    ...(q ? {
      OR: [
        { order: { orderNumber: { contains: q, mode: 'insensitive' as const } } },
        { order: { customer: { email: { contains: q, mode: 'insensitive' as const } } } },
        { order: { guestEmail: { contains: q, mode: 'insensitive' as const } } },
      ],
    } : {}),
  }

  const [returns, total, counts] = await Promise.all([
    db.return.findMany({
      where,
      include: {
        order: {
          select: {
            orderNumber: true,
            total: true,
            customer: { select: { name: true, email: true } },
            guestEmail: true,
            guestName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    db.return.count({ where }),
    db.return.groupBy({ by: ['status'], _count: true }),
  ])

  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count]))
  const requestedCount = countMap['REQUESTED'] ?? 0

  const tabs = [
    { label: 'Requested', value: 'REQUESTED', count: countMap['REQUESTED'] },
    { label: 'Under Review', value: 'UNDER_REVIEW', count: countMap['UNDER_REVIEW'] },
    { label: 'Approved', value: 'APPROVED', count: countMap['APPROVED'] },
    { label: 'Rejected', value: 'REJECTED', count: countMap['REJECTED'] },
    { label: 'Completed', value: 'COMPLETED', count: countMap['COMPLETED'] },
    { label: 'All', value: 'all', count: undefined },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Returns</h2>
          <p className="text-sm text-gray-500">
            {requestedCount > 0
              ? `${requestedCount} request${requestedCount !== 1 ? 's' : ''} awaiting review`
              : 'Manage customer return requests'}
          </p>
        </div>
        <AdminSearchInput placeholder="Search by order # or email" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/returns?status=${tab.value}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              status === tab.value
                ? 'border-charcoal text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count != null && tab.count > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                tab.value === 'REQUESTED' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            )}
          </Link>
        ))}
      </div>

      {returns.length === 0 ? (
        <EmptyState icon={RotateCcw} title="No return requests" description="Return requests will appear here" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Reason</th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {returns.map((r) => {
                const customerName = r.order.customer?.name || r.order.guestName || '—'
                const customerEmail = r.order.customer?.email || r.order.guestEmail || ''

                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{r.order.orderNumber}</p>
                      <p className="text-xs text-gray-500">{formatPrice(Number(r.order.total))}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{customerName}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[160px]">{customerEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{REASON_LABELS[r.reason] ?? r.reason}</p>
                      {r.details && (
                        <p className="text-xs text-gray-500 truncate max-w-[200px] italic">"{r.details}"</p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[r.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {r.status.replace(/_/g, ' ')}
                      </span>
                      {r.resolution && (
                        <p className="mt-1 text-xs text-emerald-700">{r.resolution.replace(/_/g, ' ')}</p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
                      {format(r.createdAt, 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ReturnActions returnId={r.id} currentStatus={r.status} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Link href={`/admin/returns?status=${status}&page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ''}`} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
              Previous
            </Link>
          )}
          <span className="px-3 py-1.5 text-sm text-gray-500">Page {page} of {Math.ceil(total / PAGE_SIZE)}</span>
          {page < Math.ceil(total / PAGE_SIZE) && (
            <Link href={`/admin/returns?status=${status}&page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ''}`} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
