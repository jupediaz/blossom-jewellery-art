'use client'

import { useState, useEffect, useCallback } from 'react'
import { Mail, Download, Search, Users, UserCheck, UserX, RefreshCw, Send, ChevronDown, ChevronUp, Loader2, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'

type Subscriber = {
  id: string
  email: string
  locale: string
  isActive: boolean
  createdAt: string
}

type BroadcastState = 'idle' | 'checking' | 'ready' | 'sending' | 'done'

type BroadcastLog = {
  id: string
  subject: string
  previewText: string | null
  locale: string | null
  sentTo: number
  failed: number
  sentAt: string
  sentBy: string | null
}

const PAGE_SIZE = 50
const LOCALES = ['', 'en', 'es', 'uk']

function BroadcastHistory() {
  const [logs, setLogs] = useState<BroadcastLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/newsletter/broadcasts')
      .then((r) => r.ok ? r.json() : [])
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null
  if (logs.length === 0) return (
    <div className="rounded-xl border border-gray-200 bg-white px-6 py-8 text-center text-sm text-gray-400">
      No broadcasts sent yet
    </div>
  )

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-700">Broadcast History</h3>
      </div>
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Subject</th>
            <th className="px-6 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Audience</th>
            <th className="px-6 py-2 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Sent</th>
            <th className="px-6 py-2 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Failed</th>
            <th className="px-6 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-gray-50">
              <td className="px-6 py-3 text-sm text-gray-900 max-w-xs truncate">{log.subject}</td>
              <td className="px-6 py-3">
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  {log.locale ? log.locale.toUpperCase() : 'ALL'}
                </span>
              </td>
              <td className="px-6 py-3 text-center text-sm font-medium text-emerald-700">{log.sentTo.toLocaleString()}</td>
              <td className="px-6 py-3 text-center text-sm text-gray-500">
                {log.failed > 0 ? <span className="text-red-600">{log.failed}</span> : '—'}
              </td>
              <td className="px-6 py-3 text-right text-xs text-gray-500">
                {format(new Date(log.sentAt), 'dd MMM yyyy HH:mm')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function BroadcastComposer() {
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [previewText, setPreviewText] = useState('')
  const [body, setBody] = useState('')
  const [audienceLocale, setAudienceLocale] = useState('')
  const [state, setState] = useState<BroadcastState>('idle')
  const [recipientCount, setRecipientCount] = useState<number | null>(null)
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null)
  const [error, setError] = useState('')

  async function checkRecipients() {
    setState('checking')
    setError('')
    try {
      const res = await fetch('/api/admin/newsletter/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, previewText, body, locale: audienceLocale || undefined, preview: true }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error'); setState('idle'); return }
      setRecipientCount(data.count)
      setState('ready')
    } catch {
      setError('Network error'); setState('idle')
    }
  }

  async function sendBroadcast() {
    if (!confirm(`Send to ${recipientCount} subscribers? This cannot be undone.`)) return
    setState('sending')
    setError('')
    try {
      const res = await fetch('/api/admin/newsletter/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, previewText, body, locale: audienceLocale || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error'); setState('ready'); return }
      setResult({ sent: data.sent, failed: data.failed })
      setState('done')
    } catch {
      setError('Network error'); setState('ready')
    }
  }

  function reset() {
    setSubject(''); setPreviewText(''); setBody(''); setAudienceLocale('')
    setState('idle'); setRecipientCount(null); setResult(null); setError('')
  }

  const canCheck = subject.trim().length > 0 && body.trim().length > 0
  const isBusy = state === 'checking' || state === 'sending'

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <div className="flex items-center gap-2">
          <Send className="h-5 w-5 text-gray-400" />
          <span className="font-medium text-gray-900">Send Broadcast</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>

      {open && (
        <div className="border-t border-gray-200 px-6 py-5 space-y-4">
          {state === 'done' && result ? (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-center space-y-2">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
              <p className="font-medium text-emerald-800">Broadcast sent!</p>
              <p className="text-sm text-emerald-700">{result.sent} sent · {result.failed} failed</p>
              <button onClick={reset} className="mt-2 text-sm text-emerald-700 underline">Compose another</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Subject *</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => { setSubject(e.target.value); setState('idle') }}
                    placeholder="New arrivals at Blossom by Olha"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Preview text</label>
                  <input
                    type="text"
                    value={previewText}
                    onChange={(e) => { setPreviewText(e.target.value); setState('idle') }}
                    placeholder="Short summary shown in inbox preview..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Audience</label>
                  <select
                    value={audienceLocale}
                    onChange={(e) => { setAudienceLocale(e.target.value); setState('idle') }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="">All subscribers</option>
                    <option value="en">EN only</option>
                    <option value="es">ES only</option>
                    <option value="uk">UK only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Message body *</label>
                <textarea
                  value={body}
                  onChange={(e) => { setBody(e.target.value); setState('idle') }}
                  rows={8}
                  placeholder={"Write your message here...\n\nUse blank lines to separate paragraphs."}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 font-mono"
                />
                <p className="mt-1 text-xs text-gray-400">Plain text. Blank lines become paragraphs in the email.</p>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex items-center justify-between pt-2">
                {state === 'ready' && recipientCount !== null ? (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{recipientCount}</span> active subscriber{recipientCount !== 1 ? 's' : ''} will receive this
                  </p>
                ) : <span />}

                <div className="flex gap-2">
                  {state !== 'ready' ? (
                    <button
                      onClick={checkRecipients}
                      disabled={!canCheck || isBusy}
                      className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-40"
                    >
                      {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Check recipients
                    </button>
                  ) : (
                    <button
                      onClick={sendBroadcast}
                      disabled={isBusy}
                      className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-40"
                    >
                      {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      {isBusy ? 'Sending...' : 'Send broadcast'}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [locale, setLocale] = useState('')
  const [active, setActive] = useState('')
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (search) params.set('search', search)
      if (locale) params.set('locale', locale)
      if (active !== '') params.set('active', active)
      const res = await fetch(`/api/admin/newsletter?${params}`)
      const data = await res.json()
      setSubscribers(data.subscribers)
      setTotal(data.total)
    } finally {
      setLoading(false)
    }
  }, [page, search, locale, active])

  useEffect(() => {
    load()
  }, [load])

  async function toggleActive(sub: Subscriber) {
    setToggling(sub.id)
    try {
      await fetch(`/api/admin/newsletter/${sub.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !sub.isActive }),
      })
      setSubscribers((prev) =>
        prev.map((s) => (s.id === sub.id ? { ...s, isActive: !s.isActive } : s))
      )
      setTotal((t) => t) // preserve total count
    } finally {
      setToggling(null)
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const activeCount = subscribers.filter((s) => s.isActive).length

  function handleExport() {
    const params = new URLSearchParams()
    if (active !== '') params.set('active', active)
    window.location.href = `/api/admin/newsletter/export?${params}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Mail className="h-6 w-6 text-gray-400" />
            Newsletter Subscribers
          </h2>
          <p className="text-sm text-gray-500 mt-1">{total.toLocaleString()} total subscribers</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50 disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <Users className="mx-auto mb-1 h-5 w-5 text-gray-400" />
          <p className="text-2xl font-semibold text-gray-900">{total.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-center">
          <UserCheck className="mx-auto mb-1 h-5 w-5 text-emerald-600" />
          <p className="text-2xl font-semibold text-emerald-700">{activeCount}</p>
          <p className="text-xs text-emerald-600">Active (this page)</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
          <UserX className="mx-auto mb-1 h-5 w-5 text-gray-400" />
          <p className="text-2xl font-semibold text-gray-600">{subscribers.length - activeCount}</p>
          <p className="text-xs text-gray-500">Unsubscribed (this page)</p>
        </div>
      </div>

      {/* Broadcast Composer */}
      <BroadcastComposer />

      {/* Broadcast History */}
      <BroadcastHistory />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
        </div>
        <select
          value={locale}
          onChange={(e) => { setLocale(e.target.value); setPage(1) }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none"
        >
          <option value="">All locales</option>
          {LOCALES.filter(Boolean).map((l) => (
            <option key={l} value={l}>{l.toUpperCase()}</option>
          ))}
        </select>
        <select
          value={active}
          onChange={(e) => { setActive(e.target.value); setPage(1) }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Unsubscribed</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">
            Loading...
          </div>
        ) : subscribers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-sm text-gray-400">
            <Mail className="mb-2 h-8 w-8 text-gray-300" />
            No subscribers found
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Locale</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Subscribed</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-900">{sub.email}</td>
                  <td className="whitespace-nowrap px-6 py-3">
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      {sub.locale.toUpperCase()}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      sub.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {sub.isActive ? 'Active' : 'Unsubscribed'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-500">
                    {format(new Date(sub.createdAt), 'dd MMM yyyy')}
                  </td>
                  <td className="whitespace-nowrap px-6 py-3 text-right">
                    <button
                      onClick={() => toggleActive(sub)}
                      disabled={toggling === sub.id}
                      className={`text-xs font-medium ${
                        sub.isActive
                          ? 'text-red-600 hover:text-red-800'
                          : 'text-emerald-600 hover:text-emerald-800'
                      } disabled:opacity-50`}
                    >
                      {toggling === sub.id ? '...' : sub.isActive ? 'Unsubscribe' : 'Resubscribe'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
