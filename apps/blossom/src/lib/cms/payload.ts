import configPromise from '@payload-config'
import { getPayload, type Payload } from 'payload'

// Canonical Payload 3 local-API access for Next. getPayload memoizes the
// instance internally by config, so this shares the same Payload instance the
// @payloadcms/next route handlers use (no second init, no connection storm).
export function getPayloadClient(): Promise<Payload> {
  return getPayload({ config: configPromise })
}
