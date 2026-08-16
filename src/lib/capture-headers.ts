/**
 * Strips platform credentials out of a captured request before it is stored.
 *
 * Everything captured on /hook/<id> is replayed verbatim on the public
 * inspector page /e/<id>. Vercel's proxy injects headers into the inbound
 * request that authenticate *this deployment*, not the sender:
 * `x-vercel-oidc-token` is a signed JWT scoped to the project, and the proxy
 * signature (also echoed inside `Forwarded` as `sig=`) plus
 * `x-vercel-sc-headers` carry bearer tokens. Storing them handed a live
 * project credential to anyone who opened the endpoint.
 *
 * Only infrastructure-injected secrets are removed. Headers the caller
 * actually sent, including their own `Authorization` and webhook signatures
 * such as `x-hub-signature-256`, are the whole point of the product and stay.
 */

export const SENSITIVE_HEADERS: ReadonlySet<string> = new Set([
  // Signed JWT identifying the deployment to OIDC-federated resources.
  'x-vercel-oidc-token',
  // Bearer token the proxy uses to authenticate itself to the function.
  'x-vercel-proxy-signature',
  'x-vercel-proxy-signature-ts',
  // Same signature, re-encoded in the standard Forwarded header as `sig=`.
  'forwarded',
  // JSON blob containing an `Authorization: Bearer ...` for the cache layer.
  'x-vercel-sc-headers',
  'x-vercel-sc-host',
  'x-vercel-sc-basepath',
])

export function sanitizeCapturedHeaders(
  headers: Record<string, string>
): Record<string, string> {
  const safe: Record<string, string> = {}
  for (const [name, value] of Object.entries(headers)) {
    if (SENSITIVE_HEADERS.has(name.toLowerCase())) continue
    safe[name] = value
  }
  return safe
}
