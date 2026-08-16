import { NextResponse } from 'next/server'
import { createEndpoint } from '@/lib/db'
import { RedisConfigError, isStorageUnavailable } from '@/lib/redis-config'

export async function POST() {
  try {
    const endpointId = await createEndpoint()
    return NextResponse.json({
      endpointId,
      viewUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://webhookpro.vercel.app'}/e/${endpointId}`,
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://webhookpro.vercel.app'}/hook/${endpointId}`
    })
  } catch (error) {
    // Previously swallowed: the generic 500 hid a storage misconfiguration and
    // left nothing in the logs to debug with.
    console.error('Create endpoint error:', error)

    if (error instanceof RedisConfigError) {
      return NextResponse.json(
        { error: 'Storage is not configured. See /api/health.', detail: error.message },
        { status: 503 }
      )
    }

    // Reachability failures are not application bugs. Say so, and keep the
    // hostname-level diagnosis in /api/health rather than in a public response.
    if (isStorageUnavailable(error)) {
      return NextResponse.json(
        { error: 'Storage is unavailable. See /api/health.' },
        { status: 503 }
      )
    }

    return NextResponse.json({ error: 'Failed to create endpoint' }, { status: 500 })
  }
}