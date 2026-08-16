/**
 * End-to-end smoke test: boots the real production server against a stand-in
 * Upstash REST API, using only the KV_REST_API_* env vars (the exact shape that
 * broke production), and exercises the Create Webhook Endpoint flow.
 */
import http from 'node:http'
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { getFreePort, assertPortFree, killTree } from './proc.mjs'

const store = new Map()

function runCommand(cmd) {
  const [name, ...args] = cmd.map(String)
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

const upstash = http.createServer((req, res) => {
  let raw = ''
  req.on('data', (c) => (raw += c))
  req.on('end', () => {
    const body = JSON.parse(raw || '[]')
    const isPipeline = (req.url ?? '').includes('pipeline') || Array.isArray(body[0])
    const out = isPipeline ? body.map(runCommand) : runCommand(body)
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify(out))
  })
})

await new Promise((r) => upstash.listen(0, '127.0.0.1', r))
const upstashPort = upstash.address().port
const appPort = await getFreePort()
await assertPortFree(appPort)
const APP = `http://127.0.0.1:${appPort}`

const server = spawn('npx', ['next', 'start', '-p', String(appPort)], {
  cwd: process.cwd(),
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'production',
    KV_REST_API_URL: `http://127.0.0.1:${upstashPort}`,
    KV_REST_API_TOKEN: 'e2e-token',
    NEXT_PUBLIC_APP_URL: APP,
    UPSTASH_REDIS_REST_URL: '',
    UPSTASH_REDIS_REST_TOKEN: '',
    UPSTASH_REDIS_REST_KV_REST_API_URL: '',
    UPSTASH_REDIS_REST_KV_REST_API_TOKEN: '',
  },
})
server.stdout.on('data', (d) => process.stdout.write(`  [next] ${d}`))
server.stderr.on('data', (d) => process.stderr.write(`  [next!] ${d}`))

let failures = 0
function check(label, ok, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` -> ${detail}` : ''}`)
  if (!ok) failures++
}

try {
  // Wait for readiness
  let ready = false
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(APP, { signal: AbortSignal.timeout(2000) })
      if (r.status < 500) { ready = true; break }
    } catch {}
    await sleep(1000)
  }
  if (!ready) throw new Error('server never became ready')

  // 1. Health
  const health = await fetch(`${APP}/api/health`)
  const healthBody = await health.json()
  check('GET /api/health is 200', health.status === 200, `status=${health.status}`)
  check('health reports redis ok', healthBody.redis?.ok === true, JSON.stringify(healthBody.redis))
  check('health names the credential source', healthBody.redis?.source === 'KV_REST_API_URL', healthBody.redis?.source)
  check('health leaks no secret', !JSON.stringify(healthBody).includes('e2e-token'))

  // 2. THE BUG: Create Webhook Endpoint
  const t0 = Date.now()
  const create = await fetch(`${APP}/api/endpoints`, { method: 'POST' })
  const ms = Date.now() - t0
  const created = await create.json()
  check('POST /api/endpoints is 200', create.status === 200, `status=${create.status} body=${JSON.stringify(created)}`)
  check('returns an endpointId', typeof created.endpointId === 'string' && created.endpointId.length > 0)
  check('returns webhookUrl + viewUrl', !!created.webhookUrl && !!created.viewUrl, created.webhookUrl)
  check('responds fast (no retry storm)', ms < 2000, `${ms}ms`)

  // 3. Capture a webhook and read it back
  const hook = await fetch(`${APP}/hook/${created.endpointId}?src=e2e`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ hello: 'world' }),
  })
  check('POST /hook/:id is 200', hook.status === 200, `status=${hook.status}`)

  const list = await fetch(`${APP}/api/endpoints/${created.endpointId}`)
  const listBody = await list.json()
  check('GET /api/endpoints/:id is 200', list.status === 200)
  check('captured webhook is returned', listBody.webhooks?.length === 1, JSON.stringify(listBody.webhooks?.[0]?.body))
  check('query params captured', listBody.webhooks?.[0]?.query_params?.src === 'e2e')
} catch (err) {
  console.error('E2E ERROR:', err)
  failures++
} finally {
  killTree(server.pid)
  upstash.close()
}

console.log(failures === 0 ? '\nALL E2E CHECKS PASSED' : `\n${failures} E2E CHECK(S) FAILED`)
process.exit(failures === 0 ? 0 : 1)
