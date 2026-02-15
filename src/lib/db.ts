// Simple in-memory storage for MVP
type Webhook = {
  id: string
  endpointId: string
  method: string
  headers: Record<string, string>
  body: string | null
  queryParams: Record<string, string>
  ipAddress: string
  userAgent: string
  createdAt: string
}

type Endpoint = {
  id: string
  createdAt: string
}

const endpoints: Map<string, Endpoint> = new Map()
const webhooks: Map<string, Webhook[]> = new Map()

export function createEndpoint(): string {
  const id = Math.random().toString(36).substring(2, 18)
  endpoints.set(id, { id, createdAt: new Date().toISOString() })
  webhooks.set(id, [])
  return id
}

export function saveWebhook(
  endpointId: string,
  method: string,
  headers: Record<string, string>,
  body: string | null,
  queryParams: Record<string, string>,
  ipAddress: string,
  userAgent: string
): string {
  const id = Math.random().toString(36).substring(2, 18)
  const webhook: Webhook = {
    id,
    endpointId,
    method,
    headers,
    body,
    queryParams,
    ipAddress,
    userAgent,
    createdAt: new Date().toISOString()
  }
  
  const existing = webhooks.get(endpointId) || []
  existing.unshift(webhook)
  webhooks.set(endpointId, existing.slice(0, 100)) // Keep last 100
  
  return id
}

export function getWebhooks(endpointId: string, limit = 50): Webhook[] {
  return (webhooks.get(endpointId) || []).slice(0, limit)
}