'use client'

import { useCartStore, type CartItem } from './cart'

let syncTimeout: ReturnType<typeof setTimeout> | null = null
let sessionToken: string | null = null

// Load session token from localStorage
if (typeof window !== 'undefined') {
  sessionToken = localStorage.getItem('blossom-cart-session')
}

function syncCart(items: CartItem[]) {
  if (syncTimeout) clearTimeout(syncTimeout)

  syncTimeout = setTimeout(async () => {
    try {
      const res = await fetch('/api/cart/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, sessionToken }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.sessionToken) {
          sessionToken = data.sessionToken
          localStorage.setItem('blossom-cart-session', data.sessionToken)
        } else {
          sessionToken = null
          localStorage.removeItem('blossom-cart-session')
        }
      }
    } catch {
      // Silent fail — cart sync is best-effort
    }
  }, 2000) // 2 second debounce
}

/** Call this once in a top-level client component to start syncing */
export function initCartSync() {
  useCartStore.subscribe((state) => {
    syncCart(state.items)
  })
}
