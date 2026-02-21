import Link from 'next/link'
import { db } from '@/lib/db'
import { EmptyState } from '@/components/admin/EmptyState'
import { Users } from 'lucide-react'
import { format } from 'date-fns'

interface Props {
  searchParams: Promise<{ page?: string }>
}

const ITEMS_PER_PAGE = 20

export default async function CustomersPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page ?? 1))

  const [customers, total] = await Promise.all([
    db.user.findMany({
      where: { role: 'CUSTOMER' },
      orderBy: { createdAt: 'desc' },
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
      include: {
        _count: { select: { orders: true } },
        orders: {
          select: { total: true },
          where: { paymentStatus: 'PAID' },
        },
      },
    }),
    db.user.count({ where: { role: 'CUSTOMER' } }),
  ])

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Customers</h2>
        <p className="text-sm text-gray-500">{total} registered customers</p>
      </div>

      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers yet"
          description="Customers will appear here once they create accounts or make purchases"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Customer
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Orders
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map((customer) => {
                const totalSpent = customer.orders.reduce(
                  (sum, o) => sum + Number(o.total),
                  0
                )

                return (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <Link href={`/admin/customers/${customer.id}`}>
                        <p className="text-sm font-medium text-gray-900 hover:underline">
                          {customer.name || '—'}
                        </p>
                        <p className="text-xs text-gray-500">{customer.email}</p>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                      {customer._count.orders}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat('en-EU', {
                        style: 'currency',
                        currency: 'EUR',
                      }).format(totalSpent)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
                      {format(customer.createdAt, 'dd MMM yyyy')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/admin/customers?page=${page - 1}`}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/admin/customers?page=${page + 1}`}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
