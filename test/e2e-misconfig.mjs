/**
 * Verifies the failure path: with no Redis credentials at all, the app must say
 * so quickly and clearly instead of hanging through retry backoff and returning
 * an opaque 500 (the behaviour that made the production outage undiagnosable).
 */
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { getFreePort, assertPortFree, killTree } from './proc.mjs'

const appPort = await getFreePort()
await assertPortFree(appPort)
const APP = `http://127.0.0.1:${appPort}`
const blanked = {
  KV_REST_API_URL: '',
  KV_REST_API_TOKEN: '',
  UPSTASH_REDIS_REST_URL: '',
  UPSTASH_REDIS_REST_TOKEN: '',
  UPSTASH_REDIS_REST_KV_REST_API_URL: '',
  UPSTASH_REDIS_REST_KV_REST_API_TOKEN: '',
  REDIS_REST_URL: '',
  REDIS_REST_TOKEN: '',
}

const server = spawn('npx', ['next', 'start', '-p', String(appPort)], {
  cwd: process.cwd(),
  shell: true,
  env: { ...process.env, NODE_ENV: 'production', ...blanked },
})

let failures = 0
const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` -> ${detail}` : ''}`)
  if (!ok) failures++
}

try {
  let ready = false
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(APP, { signal: AbortSignal.timeout(2000) })
      if (r.status < 500) { ready = true; break }
    } catch {}
    await sleep(1000)
  }
  if (!ready) throw new Error('server never became ready')

  const t0 = Date.now()
  const create = await fetch(`${APP}/api/endpoints`, { method: 'POST' })
  const ms = Date.now() - t0
  const body = await create.json()

  check('misconfig returns 503, not a generic 500', create.status === 503, `status=${create.status}`)
  check('fails fast instead of 4.3s retry backoff', ms < 1500, `${ms}ms`)
  check('names the missing env vars', /KV_REST_API_URL/.test(body.detail ?? ''), body.detail)
  check('points at the health endpoint', /\/api\/health/.test(body.error ?? ''), body.error)

  const health = await fetch(`${APP}/api/health`)
  const healthBody = await health.json()
  check('health returns 503 when degraded', health.status === 503, `status=${health.status}`)
  check('health lists every candidate var as unset',
    healthBody.env?.every((e) => !e.urlSet && !e.tokenSet),
    JSON.stringify(healthBody.env?.map((e) => e.url)))
} catch (err) {
  console.error('E2E ERROR:', err)
  failures++
} finally {
  killTree(server.pid)
}

console.log(failures === 0 ? '\nALL MISCONFIG CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`)
process.exit(failures === 0 ? 0 : 1)
