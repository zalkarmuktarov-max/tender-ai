import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function cleanJson(text: string) {
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
}

export async function POST(request: NextRequest) {
  const { documentId, filePath, userId } = await request.json()

  if (!documentId || !filePath || !userId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    await supabase.from('knowledge_documents').update({ status: 'processing' }).eq('id', documentId)

    const { data: fileData, error: fileError } = await supabase.storage
      .from('documents')
      .download(filePath)

    if (fileError || !fileData) {
      await supabase.from('knowledge_documents').update({ status: 'error' }).eq('id', documentId)
      return NextResponse.json({ error: 'File not found: ' + fileError?.message }, { status: 500 })
    }

    const buffer = await fileData.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const isPDF = filePath.toLowerCase().endsWith('.pdf')

    const content: Anthropic.MessageParam['content'] = isPDF
      ? [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: base64 },
          },
          {
            type: 'text',
            text: `Извлеки ВСЕ технические параметры оборудования/товара из этого документа.

Ответь JSON:
{
  "product_name": "название продукта/оборудования",
  "parameters": [
    {
      "name": "название параметра",
      "value": "точное значение",
      "unit": "единица измерения или null",
      "page": "номер страницы или null"
    }
  ],
  "pages_count": число_или_null,
  "document_type": "manual | price_list | certificate | specification | other"
}

Извлекай всё: размеры, вес, мощность, напряжение, режимы, сертификаты, цены.
Отвечай ТОЛЬКО JSON.`,
          },
        ]
      : [
          {
            type: 'text',
            text: `Файл не является PDF. Извлеки что возможно из имени файла: ${filePath}

Ответь JSON:
{
  "product_name": "Unknown",
  "parameters": [],
  "pages_count": null,
  "document_type": "other"
}`,
          },
        ]

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 4096,
      messages: [{ role: 'user', content }],
    })

    let extracted: {
      product_name: string
      parameters: Array<{ name: string; value: string; unit?: string; page?: string }>
      pages_count: number | null
      document_type: string
    } = { product_name: 'Unknown', parameters: [], pages_count: null, document_type: 'other' }

    try {
      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      extracted = JSON.parse(cleanJson(text))
    } catch { /* keep default */ }

    // Save parameters
    if (extracted.parameters.length > 0) {
      await supabase.from('product_parameters').insert(
        extracted.parameters.map((p) => ({
          user_id: userId,
          document_id: documentId,
          product_name: extracted.product_name || 'Unknown',
          parameter_name: p.name,
          parameter_value: p.value,
          unit: p.unit || null,
          source_page: p.page || null,
        }))
      )
    }

    const categoryMap: Record<string, string> = {
      price_list: 'price_list',
      certificate: 'certificate',
      manual: 'manual',
      specification: 'manual',
      other: 'other',
    }

    await supabase.from('knowledge_documents').update({
      status: 'processed',
      pages_count: extracted.pages_count ?? null,
      items_count: extracted.parameters.length,
      category: categoryMap[extracted.document_type] ?? 'other',
    }).eq('id', documentId)

    return NextResponse.json({
      success: true,
      product_name: extracted.product_name,
      parameters_count: extracted.parameters.length,
    })

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Knowledge process error:', msg)
    await supabase.from('knowledge_documents').update({ status: 'error' }).eq('id', documentId)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
