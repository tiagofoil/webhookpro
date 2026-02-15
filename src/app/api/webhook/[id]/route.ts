import { NextRequest, NextResponse } from 'next/server'
import { saveWebhook } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return handleWebhook(request, id, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return handleWebhook(request, id, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return handleWebhook(request, id, 'PUT')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return handleWebhook(request, id, 'DELETE')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return handleWebhook(request, id, 'PATCH')
}

async function handleWebhook(
  request: NextRequest,
  endpointId: string,
  method: string
) {
  try {
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

    const webhookId = saveWebhook(
      endpointId,
      method,
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