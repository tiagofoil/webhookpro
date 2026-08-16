/**
 * Shared process helpers for the e2e harnesses.
 *
 * Two hazards these exist to remove:
 *  1. A hardcoded port silently makes the test talk to a *stale* server left over
 *     from an earlier run. The checks then fail (or worse, pass) for reasons that
 *     have nothing to do with the code under test.
 *  2. `spawn('taskkill', ...)` immediately followed by `process.exit()` never
 *     actually runs: the parent dies before the child is launched, leaking a
 *     `next start` that squats the port forever. Cleanup must be synchronous.
 */
import net from 'node:net'
import { spawnSync } from 'node:child_process'

/** Reserve an ephemeral port from the OS and release it for the child to bind. */
export async function getFreePort() {
  const srv = net.createServer()
  await new Promise((resolve, reject) => {
    srv.once('error', reject)
    srv.listen(0, '127.0.0.1', resolve)
  })
  const { port } = srv.address()
  await new Promise((resolve) => srv.close(resolve))
  return port
}

/** Fail loudly rather than testing against somebody else's server. */
export async function assertPortFree(port) {
  const inUse = await new Promise((resolve) => {
    const sock = net
      .connect({ port, host: '127.0.0.1' })
      .on('connect', () => { sock.destroy(); resolve(true) })
      .on('error', () => resolve(false))
    setTimeout(() => { sock.destroy(); resolve(false) }, 500)
  })
  if (inUse) {
    throw new Error(
      `port ${port} is already in use, refusing to run: the test would silently ` +
        `exercise a stale server instead of the one it just built`,
    )
  }
}

/** Synchronous, so it still runs when called from a `finally` before process.exit. */
export function killTree(pid) {
  if (!pid) return
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' })
  } else {
    try { process.kill(-pid, 'SIGKILL') } catch { /* already gone */ }
  }
}
