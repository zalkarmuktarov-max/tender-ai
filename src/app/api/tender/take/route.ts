import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function parseFirstUrl(documentsUrl: string): string | null {
  const trimmed = documentsUrl.trim()
  if (!trimmed) return null

  // Try JSON array: ["url1", "url2"]
  if (trimmed.startsWith('[')) {
    try {
      const arr = JSON.parse(trimmed)
      if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'string') {
        return arr[0].trim() || null
      }
    } catch {}
  }

  // Try comma-separated
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

  // 1. Parse first URL
  const fileUrl = documents_url ? parseFirstUrl(documents_url) : null
  let filePath: string | null = null

  if (fileUrl) {
    try {
      // 2. Download the file server-side (avoids CORS)
      const response = await fetch(fileUrl, { redirect: 'follow' })
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`)
      }

      const buffer = await response.arrayBuffer()
      const contentType = response.headers.get('content-type') ?? 'application/octet-stream'

      // Derive a filename from the URL
      let fileName = 'document.pdf'
      try {
        const urlPath = new URL(fileUrl).pathname
        const part = urlPath.split('/').pop()
        if (part) fileName = decodeURIComponent(part)
      } catch {}

      filePath = `${user_id}/${Date.now()}-${fileName}`

      // 3. Upload to Supabase Storage (service role bypasses RLS)
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, buffer, { contentType, upsert: false })

      if (uploadError) {
        console.error('[take] Storage upload error:', uploadError.message)
        filePath = null
      }
    } catch (e) {
      console.error('[take] File fetch/upload error:', e)
      filePath = null
    }
  }

  // 4. Create tender record
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

  return NextResponse.json({ tender_id: tender.id, file_path: filePath })
}
