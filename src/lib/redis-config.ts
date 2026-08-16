/**
 * Resolves the Upstash Redis REST credentials from the environment.
 *
 * Different providers inject these under different names:
 *  - `UPSTASH_REDIS_REST_URL` / `_TOKEN`  -> Upstash native / `Redis.fromEnv()`
 *  - `KV_REST_API_URL` / `_TOKEN`         -> Vercel Marketplace (Upstash + Vercel KV)
 *  - `UPSTASH_REDIS_REST_KV_REST_API_*`   -> Vercel integration configured with a prefix
 *
 * Missing credentials used to fall back to empty strings, which turned a config
 * problem into an opaque 500 after ~4.3s of retry backoff. We now fail loudly.
 */

export type RedisConfig = {
  url: string
  token: string
  /** Which env var pair supplied the credentials. Useful for diagnostics. */
  source: string
}

type Env = Record<string, string | undefined>

/** Candidate env var pairs, most specific first. */
export const CREDENTIAL_CANDIDATES: ReadonlyArray<readonly [string, string]> = [
  ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
  ['KV_REST_API_URL', 'KV_REST_API_TOKEN'],
  ['UPSTASH_REDIS_REST_KV_REST_API_URL', 'UPSTASH_REDIS_REST_KV_REST_API_TOKEN'],
  ['REDIS_REST_URL', 'REDIS_REST_TOKEN'],
]

export class RedisConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RedisConfigError'
  }
}

function clean(value: string | undefined): string {
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Reports which candidate env vars are present, without ever exposing values.
 * Safe to surface in a diagnostics endpoint.
 */
export function describeRedisEnv(env: Env = process.env): Array<{
  url: string
  token: string
  urlSet: boolean
  tokenSet: boolean
}> {
  return CREDENTIAL_CANDIDATES.map(([urlKey, tokenKey]) => ({
    url: urlKey,
    token: tokenKey,
    urlSet: clean(env[urlKey]) !== '',
    tokenSet: clean(env[tokenKey]) !== '',
  }))
}

export function resolveRedisConfig(env: Env = process.env): RedisConfig {
  for (const [urlKey, tokenKey] of CREDENTIAL_CANDIDATES) {
    const url = clean(env[urlKey])
    const token = clean(env[tokenKey])

    if (url && token) {
      if (!/^https?:\/\//i.test(url)) {
        throw new RedisConfigError(
          `Redis URL from ${urlKey} must start with http:// or https:// (got "${url.slice(0, 12)}..."). ` +
            `Use the Upstash REST URL, not the redis:// connection string.`
        )
      }
      return { url, token, source: urlKey }
    }

    // A half-configured pair is almost always the real mistake: surface it
    // instead of silently falling through to the next candidate.
    if (url && !token) {
      throw new RedisConfigError(`${urlKey} is set but ${tokenKey} is missing.`)
    }
    if (!url && token) {
      throw new RedisConfigError(`${tokenKey} is set but ${urlKey} is missing.`)
    }
  }

  const checked = CREDENTIAL_CANDIDATES.map(([u, t]) => `${u}/${t}`).join(', ')
  throw new RedisConfigError(
    `No Upstash Redis credentials found in the environment. Checked: ${checked}. ` +
      `Set them in your Vercel project (Settings -> Environment Variables) and redeploy.`
  )
}
