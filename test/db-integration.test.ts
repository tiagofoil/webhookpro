import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import type { AddressInfo } from 'node:net'

/**
 * Minimal stand-in for the Upstash REST API, so we can prove the storage layer
 * works end to end using the exact env var names the deployment provides.
 */
const store = new Map<string, string>()
let authHeaderSeen = ''

function runCommand(cmd: unknown[]): { result: unknown } | { error: string } {
  const [name, ...args] = cmd.map((c) => String(c))
  switch (name.toUpperCase()) {
    case 'SET':
      store.set(args[0], args[1])
      return { result: 'OK' }
    case 'GET':
      return { result: store.has(args[0]) ? store.get(args[0]) : null }
    case 'PING':
      return { result: 'PONG' }
    default:
      return { error: `unknown command ${name}` }
  }
}

const server = http.createServer((req, res) => {
  let raw = ''
  req.on('data', (c) => (raw += c))
  req.on('end', () => {
    authHeaderSeen = req.headers.authorization ?? ''
    const body = JSON.parse(raw || '[]')
    const isPipeline = (req.url ?? '').includes('pipeline') || Array.isArray(body[0])
    const out = isPipeline
      ? (body as unknown[][]).map(runCommand)
      : runCommand(body as unknown[])
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify(out))
  })
})

let db: typeof import('../src/lib/db.ts')

describe('storage layer against the Vercel Marketplace env vars', () => {
  before(async () => {
    await new Promise<void>((r) => server.listen(0, '127.0.0.1', r))
    const { port } = server.address() as AddressInfo

    // The exact scenario that broke production: only KV_REST_API_* are present.
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
    process.env.KV_REST_API_URL = `http://127.0.0.1:${port}`
    process.env.KV_REST_API_TOKEN = 'test-token'

    db = await import('../src/lib/db.ts')
  })

  after(() => server.close())

  test('health check reports the credential source it used', async () => {
    const health = await db.checkRedis()
    assert.equal(health.ok, true)
    assert.equal(health.source, 'KV_REST_API_URL')
    assert.match(authHeaderSeen, /^Bearer test-token$/)
  })

  test('createEndpoint returns an id and persists it', async () => {
    const id = await db.createEndpoint()
    assert.ok(id.length > 0, 'expected a non-empty endpoint id')
    assert.ok(store.has(`endpoint:${id}`), 'endpoint should be persisted')
    assert.deepEqual(JSON.parse(store.get(`webhooks:${id}`)!), [])
  })

  test('a captured webhook round-trips through storage', async () => {
    const id = await db.createEndpoint()
    await db.saveWebhook(
      id,
      'POST',
      { 'content-type': 'application/json' },
      '{"hello":"world"}',
      { debug: '1' },
      '203.0.113.9',
      'curl/8.0'
    )

    const webhooks = await db.getWebhooks(id)
    assert.equal(webhooks.length, 1)
    assert.equal(webhooks[0].method, 'POST')
    assert.equal(webhooks[0].body, '{"hello":"world"}')
    assert.equal(webhooks[0].ip_address, '203.0.113.9')
    assert.deepEqual(webhooks[0].query_params, { debug: '1' })
  })

  test('newest webhook comes first and history is capped at 100', async () => {
    const id = await db.createEndpoint()
    for (let i = 0; i < 105; i++) {
      await db.saveWebhook(id, 'POST', {}, `body-${i}`, {}, '1.1.1.1', 'test')
    }
    const webhooks = await db.getWebhooks(id, 200)
    assert.equal(webhooks.length, 100)
    assert.equal(webhooks[0].body, 'body-104')
  })
})
