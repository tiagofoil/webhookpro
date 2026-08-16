import { NextResponse } from 'next/server'
import { checkRedis } from '@/lib/db'
import { describeRedisEnv } from '@/lib/redis-config'

export const dynamic = 'force-dynamic'

/**
 * Diagnostics for the storage layer. Reports which credential env vars are
 * present (names only, never values) and whether Redis actually answers.
 */
export async function GET() {
  const redis = await checkRedis()

  return NextResponse.json(
    {
      status: redis.ok ? 'ok' : 'degraded',
      redis,
      env: describeRedisEnv(),
    },
    { status: redis.ok ? 200 : 503 }
  )
}
