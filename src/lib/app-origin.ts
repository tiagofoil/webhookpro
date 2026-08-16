/**
 * The public origin to hand back to the user when an endpoint is created.
 *
 * The URLs were hardcoded to https://webhookpro.vercel.app, so a visitor on the
 * custom domain got back links to a different host. Prefer the host the request
 * actually arrived on, which is correct for every domain aliased to the app.
 */

type Env = Record<string, string | undefined>

export const FALLBACK_ORIGIN = 'https://webhookpro.vercel.app'

function trimSlash(value: string): string {
  return value.replace(/\/+$/, '')
}

export function resolveAppOrigin(headers: Headers, env: Env = process.env): string {
  const configured = env.NEXT_PUBLIC_APP_URL?.trim()
  if (configured) return trimSlash(configured)

  const host = headers.get('x-forwarded-host')?.trim() || headers.get('host')?.trim()
  if (!host) return FALLBACK_ORIGIN

  // A comma-separated list means the request crossed more than one proxy; the
  // first entry is the host the client actually asked for.
  const firstHost = host.split(',')[0].trim()
  if (!firstHost) return FALLBACK_ORIGIN

  const proto = headers.get('x-forwarded-proto')?.split(',')[0].trim()
  const scheme = proto || (firstHost.startsWith('localhost') || firstHost.startsWith('127.0.0.1') ? 'http' : 'https')

  return `${scheme}://${firstHost}`
}
