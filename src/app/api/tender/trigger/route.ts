import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  let body: { tenderId?: string; filePath?: string; userId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { tenderId, filePath, userId } = body
  if (!tenderId || !filePath || !userId) {
    return NextResponse.json({ error: 'Missing tenderId, filePath or userId' }, { status: 400 })
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL
  if (!webhookUrl) {
    console.error('[trigger] N8N_WEBHOOK_URL is not set')
    return NextResponse.json({ error: 'N8N_WEBHOOK_URL not configured' }, { status: 500 })
  }

  // Fire and forget — do not await
  fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenderId, filePath, userId }),
  }).catch((e) => console.error('[trigger] n8n webhook error:', e))

  return NextResponse.json({ ok: true }, { status: 202 })
}
