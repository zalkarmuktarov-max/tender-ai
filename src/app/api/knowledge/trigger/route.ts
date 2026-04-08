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

  console.log('[knowledge/trigger] incoming body:', { document_id, file_url, user_id })

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_id, file_url, user_id }),
    })
    const text = await res.text()
    console.log('[knowledge/trigger] n8n response:', res.status, text)
    return NextResponse.json({ ok: true, n8n_status: res.status, n8n_body: text })
  } catch (e) {
    console.error('[knowledge/trigger] n8n webhook error:', e)
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 })
  }
}
