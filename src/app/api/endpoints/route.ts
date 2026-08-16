import { NextResponse } from 'next/server'
import { createEndpoint } from '@/lib/db'
import { RedisConfigError } from '@/lib/redis-config'

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
    const isConfigError = error instanceof RedisConfigError
    return NextResponse.json(
      {
        error: isConfigError
          ? 'Storage is not configured. See /api/health.'
          : 'Failed to create endpoint',
        ...(isConfigError ? { detail: error.message } : {}),
      },
      { status: isConfigError ? 503 : 500 }
    )
  }
}