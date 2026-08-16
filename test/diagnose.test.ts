import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import { hostOf, explainFetchFailure } from '../src/lib/redis-config.ts'

describe('hostOf', () => {
  test('returns the hostname, which is not a secret', () => {
    assert.equal(hostOf('https://apn1-foo-bar-12345.upstash.io'), 'apn1-foo-bar-12345.upstash.io')
  })

  test('never leaks credentials embedded in the URL', () => {
    const host = hostOf('https://user:sup3rsecret@apn1-foo.upstash.io/pipeline')
    assert.equal(host, 'apn1-foo.upstash.io')
    assert.ok(!host.includes('sup3rsecret'))
  })

  test('degrades gracefully on an unparseable URL', () => {
    assert.equal(hostOf('not a url'), 'unparseable')
    assert.equal(hostOf(''), 'unparseable')
  })
})

describe('explainFetchFailure', () => {
  // "fetch failed" is useless on its own: Node hides the real reason one or
  // more levels down the `cause` chain.
  test('unwraps the cause chain to reach the real error code', () => {
    const inner = Object.assign(new Error('getaddrinfo ENOTFOUND dead.upstash.io'), {
      code: 'ENOTFOUND',
    })
    const outer = new Error('fetch failed', { cause: inner })
    const explained = explainFetchFailure(outer)
    assert.match(explained, /ENOTFOUND/)
  })

  test('translates a dead host into a plain-English diagnosis', () => {
    const outer = new Error('fetch failed', {
      cause: Object.assign(new Error('boom'), { code: 'ENOTFOUND' }),
    })
    assert.match(explainFetchFailure(outer), /no longer exists|deleted/i)
  })

  test('distinguishes a refused connection from a missing host', () => {
    const refused = new Error('fetch failed', {
      cause: Object.assign(new Error('boom'), { code: 'ECONNREFUSED' }),
    })
    assert.match(explainFetchFailure(refused), /ECONNREFUSED/)
    assert.doesNotMatch(explainFetchFailure(refused), /no longer exists/i)
  })

  test('handles a plain error with no cause', () => {
    assert.match(explainFetchFailure(new Error('WRONGPASS invalid token')), /WRONGPASS/)
  })

  test('handles a non-error value', () => {
    assert.equal(typeof explainFetchFailure('weird'), 'string')
  })

  test('does not loop forever on a self-referential cause', () => {
    const err: Error & { cause?: unknown } = new Error('fetch failed')
    err.cause = err
    assert.equal(typeof explainFetchFailure(err), 'string')
  })
})
