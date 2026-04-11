import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Detect MIME type and file extension from the first bytes of the file.
 * ProZorro (and similar portals) often return text/plain regardless of the actual format.
 */
function sniffFileType(bytes: Uint8Array): { contentType: string; ext: string } {
  // PDF: %PDF
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return { contentType: 'application/pdf', ext: 'pdf' }
  }
  // ZIP-based (DOCX, XLSX, ODT…): PK\x03\x04
  if (bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
    return { contentType: 'application/zip', ext: 'zip' }
  }
  // Compound Document (DOC, XLS): D0 CF 11 E0
  if (bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0) {
    return { contentType: 'application/msword', ext: 'doc' }
  }
  return { contentType: 'application/octet-stream', ext: 'bin' }
}

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

      // Sniff actual file type from magic bytes — don't trust server headers
      // (ProZorro returns text/plain even for real PDF files)
      const { contentType, ext } = sniffFileType(new Uint8Array(buffer))

      // Derive a base filename from the URL path, strip any wrong extension
      let baseName = 'document'
      try {
        const urlPath = new URL(fileUrl).pathname
        const part = urlPath.split('/').pop()
        if (part) {
          // Strip existing extension so we can append the sniffed one
          baseName = decodeURIComponent(part).replace(/\.[^.]+$/, '') || baseName
        }
      } catch {}

      const fileName = `${baseName}.${ext}`
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
