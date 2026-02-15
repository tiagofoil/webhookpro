import { NextRequest, NextResponse } from 'next/server'
import { createEndpoint } from '@/lib/db'

export async function POST() {
  try {
    const endpointId = createEndpoint()
    return NextResponse.json({ 
      endpointId,
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://webhookpro.io'}/hook/${endpointId}`
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create endpoint' }, { status: 500 })
  }
}