'use client'

import { useRouter } from '@/i18n/navigation'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

export function WishlistRemoveButton({ wishlistId }: { wishlistId: string }) {
  const router = useRouter()
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState('')

  async function handleRemove() {
    setRemoving(true)
    setError('')
    try {
      const res = await fetch(`/api/account/wishlist?id=${wishlistId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to remove')
      router.refresh()
    } catch {
      setError('Could not remove item')
      setRemoving(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleRemove}
        disabled={removing}
        className="mt-2 flex items-center gap-1 text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
      >
        <Trash2 className="h-3 w-3" />
        {removing ? 'Removing...' : 'Remove'}
      </button>
      {error && <p className="mt-0.5 text-[10px] text-red-500">{error}</p>}
    </div>
  )
}
