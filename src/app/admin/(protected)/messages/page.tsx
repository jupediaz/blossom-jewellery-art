import { contactMessageDb, type ContactMessage } from '@/lib/db'
import { format } from 'date-fns'
import { MessageSquare } from 'lucide-react'
import { MarkReadButton } from './MarkReadButton'

interface Props {
  searchParams: Promise<{ unread?: string; page?: string }>
}

const PAGE_SIZE = 25

export default async function MessagesPage({ searchParams }: Props) {
  const params = await searchParams
  const unreadOnly = params.unread === 'true'
  const page = Math.max(1, Number(params.page ?? 1))

  const where = unreadOnly ? { isRead: false } : {}

  const [messages, total, unreadCount] = await Promise.all([
    contactMessageDb.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    contactMessageDb.count({ where }),
    contactMessageDb.count({ where: { isRead: false } }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-gray-400" />
            Contact Messages
            {unreadCount > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
                {unreadCount} new
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{total} total messages</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/admin/messages"
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              !unreadOnly ? 'bg-charcoal text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </a>
          <a
            href="/admin/messages?unread=true"
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              unreadOnly ? 'bg-charcoal text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Unread ({unreadCount})
          </a>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 text-sm text-gray-400">
          <MessageSquare className="mb-2 h-8 w-8 text-gray-300" />
          {unreadOnly ? 'No unread messages' : 'No messages yet'}
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg: ContactMessage) => (
            <div
              key={msg.id}
              className={`rounded-xl border bg-white p-5 ${
                msg.isRead ? 'border-gray-200' : 'border-blue-200 bg-blue-50/30'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900">{msg.name}</span>
                    <a
                      href={`mailto:${msg.email}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {msg.email}
                    </a>
                    {!msg.isRead && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                        New
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-medium text-gray-700">{msg.subject}</p>
                  <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{msg.message}</p>
                </div>
                <div className="shrink-0 text-right space-y-2">
                  <p className="text-xs text-gray-400">
                    {format(msg.createdAt, 'dd MMM yyyy, HH:mm')}
                  </p>
                  {!msg.isRead && <MarkReadButton messageId={msg.id} />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/admin/messages?${unreadOnly ? 'unread=true&' : ''}page=${page - 1}`}
                className="rounded-lg border border-gray-300 px-3 py-1.5 hover:bg-gray-50"
              >
                Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/admin/messages?${unreadOnly ? 'unread=true&' : ''}page=${page + 1}`}
                className="rounded-lg border border-gray-300 px-3 py-1.5 hover:bg-gray-50"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
