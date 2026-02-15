import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

type Webhook = {
  id: string
  endpointId: string
  method: string
  headers: Record<string, string>
  body: string | null
  query_params: Record<string, string>
  ip_address: string
  user_agent: string
  created_at: string
}

type Endpoint = {
  id: string
  created_at: string
}

export async function createEndpoint(): Promise<string> {
  const id = Math.random().toString(36).substring(2, 18)
  const endpoint: Endpoint = { id, created_at: new Date().toISOString() }
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
  // Auto-create endpoint if it doesn't exist
  const endpointExists = await redis.get<string>(`endpoint:${endpointId}`)
  if (!endpointExists) {
    const endpoint: Endpoint = { id: endpointId, created_at: new Date().toISOString() }
    await redis.set(`endpoint:${endpointId}`, JSON.stringify(endpoint))
    await redis.set(`webhooks:${endpointId}`, JSON.stringify([]))
  }

  const id = Math.random().toString(36).substring(2, 18)
  const webhook: Webhook = {
    id,
    endpointId,
    method,
    headers,
    body,
    query_params: queryParams,
    ip_address: ipAddress,
    user_agent: userAgent,
    created_at: new Date().toISOString()
  }
  
  const existing = await getWebhooks(endpointId, 100)
  existing.unshift(webhook)
  await redis.set(`webhooks:${endpointId}`, JSON.stringify(existing.slice(0, 100)))
  
  return id
}

export async function getWebhooks(endpointId: string, limit = 50): Promise<Webhook[]> {
  const data = await redis.get(`webhooks:${endpointId}`)
  if (!data) return []
  try {
    const webhooks: Webhook[] = typeof data === 'string' ? JSON.parse(data) : data
    return webhooks.slice(0, limit)
  } catch {
    return []
  }
}