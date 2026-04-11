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
  console.log('Webhook URL:', webhookUrl)
  if (!webhookUrl) {
    console.error('[trigger] N8N_WEBHOOK_URL is not set')
    return NextResponse.json({ error: 'N8N_WEBHOOK_URL not configured' }, { status: 500 })
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenderId, filePath, userId }),
    })
    const text = await response.text()
    console.log('Webhook response:', response.status, text)
    return NextResponse.json({ ok: true, webhookStatus: response.status, webhookResponse: text })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 })
  }
}
