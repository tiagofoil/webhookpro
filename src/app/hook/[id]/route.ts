import { NextRequest, NextResponse } from 'next/server'
import { saveWebhook } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: endpointId } = await params
    
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
    })

    const url = new URL(request.url)
    const queryParams: Record<string, string> = {}
    url.searchParams.forEach((value, key) => {
      queryParams[key] = value
    })

    let body = null
    try {
      const text = await request.text()
      if (text) body = text
    } catch {
      // No body
    }

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const webhookId = await saveWebhook(
      endpointId,
      'POST',
      headers,
      body,
      queryParams,
      ipAddress,
      userAgent
    )

    return NextResponse.json({ 
      success: true, 
      webhookId,
      message: 'Webhook captured successfully'
    })
  } catch (error) {
    console.error('Webhook capture error:', error)
    return NextResponse.json({ 
      error: 'Failed to capture webhook' 
    }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Redirect to the page.tsx for GET requests
  const { id } = await params
  return NextResponse.redirect(new URL(`/hook/${id}?view=inspector`, request.url))
}