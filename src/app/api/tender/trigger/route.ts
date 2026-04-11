import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  let body: {
    // Legacy format (from processing page)
    tenderId?: string
    filePath?: string
    userId?: string
    // New format (from take route)
    tender_id?: string
    user_id?: string
    file_url?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Normalise field names — accept both formats
  const tenderId = body.tenderId ?? body.tender_id
  const userId = body.userId ?? body.user_id
  const fileUrl = body.file_url ?? null
  const filePath = body.filePath ?? null

  if (!tenderId || !userId) {
    return NextResponse.json({ error: 'Missing tenderId/tender_id or userId/user_id' }, { status: 400 })
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL
  if (!webhookUrl) {
    console.error('[trigger] N8N_WEBHOOK_URL is not set')
    return NextResponse.json({ error: 'N8N_WEBHOOK_URL not configured' }, { status: 500 })
  }

  try {
    const payload: Record<string, string> = { tenderId, userId }
    if (fileUrl) payload.fileUrl = fileUrl
    if (filePath) payload.filePath = filePath

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const text = await response.text()
    console.log('[trigger] Webhook response:', response.status, text)
    return NextResponse.json({ ok: true, webhookStatus: response.status, webhookResponse: text })
  } catch (error) {
    console.error('[trigger] Webhook error:', error)
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 })
  }
}
