import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

// Cached Payload local-API client. getPayload memoizes internally, but we also
// pin it on globalThis to survive dev HMR.
const globalForPayload = globalThis as unknown as { _payload?: Promise<Payload> }

export function getPayloadClient(): Promise<Payload> {
  if (!globalForPayload._payload) {
    globalForPayload._payload = getPayload({ config })
  }
  return globalForPayload._payload
}
