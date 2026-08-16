import { Redis } from '@upstash/redis'
import { resolveRedisConfig } from './redis-config'

let client: Redis | null = null

/**
 * Built lazily so a missing credential surfaces as a clear RedisConfigError at
 * request time, instead of crashing the build or silently constructing a client
 * with an empty URL (which failed only after ~4.3s of retry backoff).
 */
function getRedis(): Redis {
  if (!client) {
    const { url, token } = resolveRedisConfig()
    client = new Redis({ url, token })
  }
  return client
}

const redis = {
  get: <T>(key: string) => getRedis().get<T>(key),
  set: (key: string, value: string) => getRedis().set(key, value),
  ping: () => getRedis().ping(),
}

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

/**
 * Verifies the Redis connection. Returns a diagnosis instead of throwing so a
 * health endpoint can report *why* storage is down without exposing secrets.
 */
export async function checkRedis(): Promise<{ ok: boolean; source?: string; error?: string }> {
  try {
    const { source } = resolveRedisConfig()
    await getRedis().ping()
    return { ok: true, source }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
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