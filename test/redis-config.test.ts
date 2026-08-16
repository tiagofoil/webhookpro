import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import {
  resolveRedisConfig,
  describeRedisEnv,
  RedisConfigError,
} from '../src/lib/redis-config.ts'

describe('resolveRedisConfig', () => {
  test('resolves the Upstash native names', () => {
    const config = resolveRedisConfig({
      UPSTASH_REDIS_REST_URL: 'https://native.upstash.io',
      UPSTASH_REDIS_REST_TOKEN: 'tok-native',
    })
    assert.equal(config.url, 'https://native.upstash.io')
    assert.equal(config.token, 'tok-native')
    assert.equal(config.source, 'UPSTASH_REDIS_REST_URL')
  })

  // This is the production regression: the Vercel Marketplace integration
  // injects KV_REST_API_*, which the old db.ts never read.
  test('resolves the Vercel Marketplace KV_REST_API_* names', () => {
    const config = resolveRedisConfig({
      KV_REST_API_URL: 'https://kv.upstash.io',
      KV_REST_API_TOKEN: 'tok-kv',
    })
    assert.equal(config.url, 'https://kv.upstash.io')
    assert.equal(config.token, 'tok-kv')
    assert.equal(config.source, 'KV_REST_API_URL')
  })

  test('still resolves the legacy prefixed names', () => {
    const config = resolveRedisConfig({
      UPSTASH_REDIS_REST_KV_REST_API_URL: 'https://legacy.upstash.io',
      UPSTASH_REDIS_REST_KV_REST_API_TOKEN: 'tok-legacy',
    })
    assert.equal(config.url, 'https://legacy.upstash.io')
    assert.equal(config.source, 'UPSTASH_REDIS_REST_KV_REST_API_URL')
  })

  test('prefers the native names when several pairs are present', () => {
    const config = resolveRedisConfig({
      UPSTASH_REDIS_REST_URL: 'https://native.upstash.io',
      UPSTASH_REDIS_REST_TOKEN: 'tok-native',
      KV_REST_API_URL: 'https://kv.upstash.io',
      KV_REST_API_TOKEN: 'tok-kv',
    })
    assert.equal(config.source, 'UPSTASH_REDIS_REST_URL')
  })

  test('throws a named, actionable error when nothing is configured', () => {
    assert.throws(
      () => resolveRedisConfig({}),
      (err: unknown) => {
        assert.ok(err instanceof RedisConfigError)
        assert.match(err.message, /No Upstash Redis credentials found/)
        assert.match(err.message, /KV_REST_API_URL/)
        return true
      }
    )
  })

  test('never silently returns empty credentials', () => {
    assert.throws(() => resolveRedisConfig({ UPSTASH_REDIS_REST_URL: '   ' }), RedisConfigError)
  })

  test('flags a half-configured pair instead of skipping it', () => {
    assert.throws(
      () => resolveRedisConfig({ KV_REST_API_URL: 'https://kv.upstash.io' }),
      /KV_REST_API_URL is set but KV_REST_API_TOKEN is missing/
    )
  })

  test('rejects a redis:// connection string passed as the REST URL', () => {
    assert.throws(
      () =>
        resolveRedisConfig({
          UPSTASH_REDIS_REST_URL: 'redis://default:pw@host:6379',
          UPSTASH_REDIS_REST_TOKEN: 'tok',
        }),
      /must start with http/
    )
  })
})

describe('describeRedisEnv', () => {
  test('reports presence without leaking values', () => {
    const report = describeRedisEnv({
      KV_REST_API_URL: 'https://kv.upstash.io',
      KV_REST_API_TOKEN: 'super-secret-token',
    })
    const kv = report.find((r) => r.url === 'KV_REST_API_URL')
    assert.ok(kv)
    assert.equal(kv.urlSet, true)
    assert.equal(kv.tokenSet, true)
    assert.equal(JSON.stringify(report).includes('super-secret-token'), false)

    const native = report.find((r) => r.url === 'UPSTASH_REDIS_REST_URL')
    assert.equal(native?.urlSet, false)
  })
})
