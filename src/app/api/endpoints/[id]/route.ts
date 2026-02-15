import { NextRequest, NextResponse } from 'next/server'
import { getWebhooks } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const webhooks = getWebhooks(params.id, 100)
    return NextResponse.json({ webhooks })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch webhooks' }, { status: 500 })
  }
}