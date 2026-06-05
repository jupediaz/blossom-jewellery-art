'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'

export function CouponActions({ couponId }: { couponId: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this coupon? This cannot be undone.')) return
    setDeleting(true)
    await fetch(`/api/admin/coupons/${couponId}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/admin/coupons/${couponId}/edit`}
        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-charcoal transition-colors"
        title="Edit"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
        title="Delete"
      >
        {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}
