import type { OrderStatus } from '@/generated/prisma/client'

/**
 * Canonical order status transition matrix.
 * Shared between API routes and admin UI to prevent drift.
 *
 * Enforced at: src/app/api/admin/orders/[id]/status/route.ts
 * Used in UI:  src/app/admin/(protected)/orders/[id]/OrderActions.tsx
 */
export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING:    ['CONFIRMED', 'CANCELLED'],
  CONFIRMED:  ['PROCESSING', 'SHIPPED', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED:    ['DELIVERED'],
  DELIVERED:  [],
  CANCELLED:  ['REFUNDED'],
  REFUNDED:   [],
}
