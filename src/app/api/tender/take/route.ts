import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function parseFirstUrl(documentsUrl: string): string | null {
  const trimmed = documentsUrl.trim()
  if (!trimmed) return null

  // JSON array: ["url1", "url2"]
  if (trimmed.startsWith('[')) {
    try {
      const arr = JSON.parse(trimmed)
      if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'string') {
        return arr[0].trim() || null
      }
    } catch {}
  }

  // Comma-separated
  const first = trimmed.split(',')[0].trim()
  return first || null
}

export async function POST(request: NextRequest) {
  let body: {
    documents_url?: string | null
    title?: string | null
    customer?: string | null
    budget?: number | null
    deadline?: string | null
    user_id?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { documents_url, title, customer, budget, deadline, user_id } = body
  if (!user_id) {
    return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // 1. Create tender record
  const { data: tender, error: insertError } = await supabase
    .from('tenders')
    .insert({
      user_id,
      number: `ТЗ-${Date.now().toString().slice(-6)}`,
      name: title ?? 'Без названия',
      customer: customer ?? 'Не указан',
      budget: budget != null ? String(budget) : null,
      deadline: deadline ?? null,
      status: 'processing',
    })
    .select('id')
    .single()

  if (insertError || !tender) {
    console.error('[take] Insert error:', insertError?.message)
    return NextResponse.json(
      { error: insertError?.message ?? 'Failed to create tender' },
      { status: 500 },
    )
  }

  // 2. Fire n8n webhook directly — n8n handles the file download
  const fileUrl = documents_url ? parseFirstUrl(documents_url) : null
  const webhookUrl = process.env.N8N_WEBHOOK_URL
  if (webhookUrl) {
    try {
      const webhookRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenderId: tender.id,
          userId: user_id,
          fileUrl: fileUrl ?? '',
        }),
      })
      console.log('[take] n8n webhook response:', webhookRes.status)
    } catch (e) {
      // Non-fatal: tender was created, processing page will show the status
      console.error('[take] n8n webhook error:', e)
    }
  } else {
    console.error('[take] N8N_WEBHOOK_URL is not set')
  }

  return NextResponse.json({ tender_id: tender.id })
}
