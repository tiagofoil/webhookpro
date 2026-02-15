import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

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

export async function createEndpoint(): Promise<string> {
  const id = Math.random().toString(36).substring(2, 18)
  const endpoint: Endpoint = { id, createdAt: new Date().toISOString() }
  await redis.set(`endpoint:${id}`, JSON.stringify(endpoint))
  await redis.set(`webhooks:${id}`, JSON.stringify([]))
  return id
}

export async function saveWebhook(
  endpointId: string,
  method: string,
  headers: Record<string, string>,
  body: string | null,
  queryParams: Record<string, string>,
  ipAddress: string,
  userAgent: string
): Promise<string> {
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
  
  const existing = await getWebhooks(endpointId, 100)
  existing.unshift(webhook)
  await redis.set(`webhooks:${endpointId}`, JSON.stringify(existing.slice(0, 100)))
  
  return id
}

export async function getWebhooks(endpointId: string, limit = 50): Promise<Webhook[]> {
  const data = await redis.get<string>(`webhooks:${endpointId}`)
  if (!data) return []
  try {
    const webhooks: Webhook[] = JSON.parse(data)
    return webhooks.slice(0, limit)
  } catch {
    return []
  }
}