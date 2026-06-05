'use client'

import { Download } from 'lucide-react'

export function ExportButton({ status }: { status?: string }) {
  function handleExport() {
    const url = status
      ? `/api/admin/orders/export?status=${status}`
      : '/api/admin/orders/export'
    window.location.href = url
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
    >
      <Download className="h-4 w-4" />
      Export CSV
    </button>
  )
}
