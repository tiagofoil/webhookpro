import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import { sanitizeCapturedHeaders, SENSITIVE_HEADERS } from '../src/lib/capture-headers.ts'

/**
 * Captured requests are shown to anyone who opens /e/<id>. Vercel's proxy adds
 * headers to the inbound request that are credentials for *this project*, not
 * anything the webhook sender wrote. Storing them published a live OIDC token
 * for the deployment to every visitor of the inspector page.
 */
describe('sanitizeCapturedHeaders', () => {
  test('drops the Vercel OIDC token', () => {
    const clean = sanitizeCapturedHeaders({
      'content-type': 'application/json',
      'x-vercel-oidc-token': 'eyJhbGciOiJSUzI1NiIsImtpZCI6Im1yay00MzAyZWMxYjY3MGY0OGE5',
    })
    assert.deepEqual(clean, { 'content-type': 'application/json' })
  })

  test('drops the proxy signature and its timestamp', () => {
    const clean = sanitizeCapturedHeaders({
      'x-vercel-proxy-signature': 'Bearer afafc3400dee8a4a2826',
      'x-vercel-proxy-signature-ts': '1786854251',
      accept: '*/*',
    })
    assert.deepEqual(clean, { accept: '*/*' })
  })

  test('drops x-vercel-sc-headers, which embeds an Authorization bearer', () => {
    const clean = sanitizeCapturedHeaders({
      'x-vercel-sc-headers': '{"Authorization":"Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9"}',
      'x-vercel-sc-host': 'iad1.suspense-cache.vercel-infra.com',
      'x-vercel-sc-basepath': '',
    })
    assert.deepEqual(clean, {})
  })

  test('drops the Forwarded header, which carries the same signature in sig=', () => {
    const clean = sanitizeCapturedHeaders({
      forwarded: 'for=187.126.60.105;host=example.com;proto=https;sig=0QmVhcmVyIGFmYWZ',
      'x-forwarded-for': '187.126.60.105',
    })
    assert.deepEqual(clean, { 'x-forwarded-for': '187.126.60.105' })
  })

  test('is case insensitive, since header names are not case sensitive', () => {
    const clean = sanitizeCapturedHeaders({ 'X-Vercel-OIDC-Token': 'eyJ', Accept: 'text/plain' })
    assert.deepEqual(clean, { Accept: 'text/plain' })
  })

  /**
   * The point of the product is showing what the sender sent. An Authorization
   * header from the *caller* is exactly the thing people debug, so it stays.
   */
  test("keeps the caller's own Authorization and signature headers", () => {
    const sent = {
      authorization: 'Bearer caller-token',
      'x-hub-signature-256': 'sha256=abc',
      'stripe-signature': 't=1,v1=deadbeef',
      'user-agent': 'GitHub-Hookshot/abc',
    }
    assert.deepEqual(sanitizeCapturedHeaders(sent), sent)
  })

  test('keeps Vercel geo headers, which are useful and not secret', () => {
    const sent = { 'x-vercel-ip-country': 'BR', 'x-vercel-id': 'gru1::qh8wh' }
    assert.deepEqual(sanitizeCapturedHeaders(sent), sent)
  })

  test('never mutates the input', () => {
    const original = { 'x-vercel-oidc-token': 'eyJ', accept: '*/*' }
    sanitizeCapturedHeaders(original)
    assert.equal(original['x-vercel-oidc-token'], 'eyJ')
  })

  test('every entry in the blocklist is lowercase, or matching silently fails', () => {
    for (const name of SENSITIVE_HEADERS) {
      assert.equal(name, name.toLowerCase(), `${name} must be lowercase`)
    }
  })
})
