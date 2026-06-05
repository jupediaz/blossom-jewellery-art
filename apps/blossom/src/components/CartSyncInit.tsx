'use client'

import { useEffect } from 'react'
import { initCartSync } from '@/lib/store/cart-sync'

let initialized = false

export function CartSyncInit() {
  useEffect(() => {
    if (!initialized) {
      initCartSync()
      initialized = true
    }
  }, [])

  return null
}
