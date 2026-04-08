import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  let body: { document_id?: string; file_url?: string; user_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { document_id, file_url, user_id } = body
  if (!document_id || !file_url || !user_id) {
    return NextResponse.json({ error: 'Missing document_id, file_url or user_id' }, { status: 400 })
  }

  const webhookUrl = process.env.N8N_KNOWLEDGE_WEBHOOK_URL
  if (!webhookUrl) {
    console.error('[knowledge/trigger] N8N_KNOWLEDGE_WEBHOOK_URL is not set')
    return NextResponse.json({ error: 'N8N_KNOWLEDGE_WEBHOOK_URL not configured' }, { status: 500 })
  }

  // Fire and forget — do not await
  fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_id, file_url, user_id }),
  }).catch((e) => console.error('[knowledge/trigger] n8n webhook error:', e))

  return NextResponse.json({ ok: true }, { status: 202 })
}
