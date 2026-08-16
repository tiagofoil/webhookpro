import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import { resolveAppOrigin, FALLBACK_ORIGIN } from '../src/lib/app-origin.ts'

const h = (init: Record<string, string>) => new Headers(init)

describe('resolveAppOrigin', () => {
  // The production symptom: a user on the custom domain was handed
  // https://webhookpro.vercel.app/hook/<id> links.
  test('uses the custom domain the request arrived on', () => {
    const origin = resolveAppOrigin(
      h({ host: 'webhookpro.ai-foil.com', 'x-forwarded-proto': 'https' }),
      {}
    )
    assert.equal(origin, 'https://webhookpro.ai-foil.com')
  })

  test('prefers x-forwarded-host over host', () => {
    const origin = resolveAppOrigin(
      h({ host: 'internal.vercel.app', 'x-forwarded-host': 'webhookpro.ai-foil.com' }),
      {}
    )
    assert.equal(origin, 'https://webhookpro.ai-foil.com')
  })

  test('an explicit NEXT_PUBLIC_APP_URL always wins', () => {
    const origin = resolveAppOrigin(h({ host: 'webhookpro.ai-foil.com' }), {
      NEXT_PUBLIC_APP_URL: 'https://forced.example.com/',
    })
    assert.equal(origin, 'https://forced.example.com')
  })

  test('an empty NEXT_PUBLIC_APP_URL does not shadow the real host', () => {
    const origin = resolveAppOrigin(h({ host: 'webhookpro.ai-foil.com' }), {
      NEXT_PUBLIC_APP_URL: '   ',
    })
    assert.equal(origin, 'https://webhookpro.ai-foil.com')
  })

  test('takes the first host when proxies chained the header', () => {
    const origin = resolveAppOrigin(
      h({ 'x-forwarded-host': 'webhookpro.ai-foil.com, inner.vercel.app' }),
      {}
    )
    assert.equal(origin, 'https://webhookpro.ai-foil.com')
  })

  test('local development stays on http', () => {
    assert.equal(resolveAppOrigin(h({ host: 'localhost:3000' }), {}), 'http://localhost:3000')
  })

  test('falls back when there is no host header at all', () => {
    assert.equal(resolveAppOrigin(h({}), {}), FALLBACK_ORIGIN)
  })
})
