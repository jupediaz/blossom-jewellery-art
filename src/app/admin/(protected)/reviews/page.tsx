import { db } from '@/lib/db'
import { format } from 'date-fns'
import { Star, CheckCircle2 } from 'lucide-react'
import { ReviewActions } from './ReviewActions'

interface Props {
  searchParams: Promise<{ status?: string; page?: string }>
}

const PAGE_SIZE = 20

export default async function ReviewsPage({ searchParams }: Props) {
  const params = await searchParams
  const status = params.status ?? 'pending'
  const page = Math.max(1, Number(params.page ?? 1))

  const where =
    status === 'pending'
      ? { isApproved: false }
      : status === 'approved'
      ? { isApproved: true }
      : {}

  const [reviews, total, pendingCount] = await Promise.all([
    db.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      include: { user: { select: { email: true } } },
    }),
    db.review.count({ where }),
    db.review.count({ where: { isApproved: false } }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Star className="h-6 w-6 text-gray-400" />
            Product Reviews
            {pendingCount > 0 && (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">
                {pendingCount} pending
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{total} {status} reviews</p>
        </div>
        <div className="flex gap-2">
          {['pending', 'approved', 'all'].map((s) => (
            <a
              key={s}
              href={`/admin/reviews?status=${s}`}
              className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize ${
                status === s ? 'bg-charcoal text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s}
            </a>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {reviews.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">No {status} reviews</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Author</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Rating</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Review</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Product ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{review.authorName}</div>
                    {review.user?.email && (
                      <div className="text-xs text-gray-400">{review.user.email}</div>
                    )}
                    {review.isVerified && (
                      <div className="flex items-center gap-1 text-xs text-green-600 mt-0.5">
                        <CheckCircle2 size={11} />
                        Verified
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={13}
                          className={s <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-none text-gray-200'}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-sm">
                    {review.title && (
                      <div className="font-medium text-gray-800 mb-0.5">{review.title}</div>
                    )}
                    <p className="text-gray-600 line-clamp-3">{review.body}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400 max-w-[120px] truncate">
                    {review.sanityProductId}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {format(review.createdAt, 'dd MMM yyyy')}
                  </td>
                  <td className="px-4 py-3">
                    <ReviewActions reviewId={review.id} isApproved={review.isApproved} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          {page > 1 && (
            <a href={`/admin/reviews?status=${status}&page=${page - 1}`} className="px-3 py-1.5 rounded border hover:bg-gray-50">
              Previous
            </a>
          )}
          <span className="text-gray-500">{page} / {totalPages}</span>
          {page < totalPages && (
            <a href={`/admin/reviews?status=${status}&page=${page + 1}`} className="px-3 py-1.5 rounded border hover:bg-gray-50">
              Next
            </a>
          )}
        </div>
      )}
    </div>
  )
}
