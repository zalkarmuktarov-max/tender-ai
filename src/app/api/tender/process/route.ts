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

function log(step: string, data?: unknown) {
  console.log(`[process] ${step}`, data !== undefined ? JSON.stringify(data) : '')
}

// GET — диагностика: проверяет env, Supabase, Storage, Anthropic
export async function GET() {
  const checks: Record<string, string> = {}

  checks.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ? `set (${process.env.ANTHROPIC_API_KEY.slice(0, 12)}...)` : 'MISSING'
  checks.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'MISSING'
  checks.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'MISSING'

  // Check tenders table
  try {
    const { error } = await supabase.from('tenders').select('id').limit(1)
    checks.table_tenders = error ? `ERROR: ${error.message}` : 'ok'
  } catch (e) {
    checks.table_tenders = `EXCEPTION: ${e}`
  }

  // Check knowledge_documents table
  try {
    const { error } = await supabase.from('knowledge_documents').select('id').limit(1)
    checks.table_knowledge_documents = error ? `ERROR: ${error.message}` : 'ok'
  } catch (e) {
    checks.table_knowledge_documents = `EXCEPTION: ${e}`
  }

  // Check audit_data column
  try {
    const { error } = await supabase.from('tenders').select('audit_data').limit(1)
    checks.column_audit_data = error ? `ERROR: ${error.message}` : 'ok'
  } catch (e) {
    checks.column_audit_data = `EXCEPTION: ${e}`
  }

  // Check Storage bucket
  try {
    const { data, error } = await supabase.storage.getBucket('documents')
    checks.storage_bucket_documents = error ? `ERROR: ${error.message}` : `ok (public=${data?.public})`
  } catch (e) {
    checks.storage_bucket_documents = `EXCEPTION: ${e}`
  }

  // Check Anthropic API key (just validate format, don't call API)
  checks.anthropic_key_format = process.env.ANTHROPIC_API_KEY?.startsWith('sk-ant-') ? 'valid format' : 'INVALID format'

  return NextResponse.json({ status: 'diagnostic', checks })
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  log('START')

  let body: { tenderId?: string; filePath?: string; userId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { tenderId, filePath, userId } = body
  log('params', { tenderId, filePath: filePath?.slice(0, 40), userId: userId?.slice(0, 8) })

  if (!tenderId || !filePath || !userId) {
    return NextResponse.json({ error: 'Missing: tenderId, filePath or userId' }, { status: 400 })
  }

  try {
    // STEP 1: Download file from Storage
    log('STEP 1: downloading file', filePath)
    const { data: fileData, error: fileError } = await supabase.storage
      .from('documents')
      .download(filePath)

    if (fileError || !fileData) {
      log('STEP 1 FAILED', { error: fileError?.message })
      return NextResponse.json({
        error: `Storage download failed: ${fileError?.message}`,
        hint: 'Check that "documents" bucket exists in Supabase Storage and the file was uploaded.',
        filePath,
      }, { status: 500 })
    }
    log('STEP 1 OK', { size: fileData.size, elapsed: Date.now() - startTime })

    const buffer = await fileData.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')

    // STEP 2: Parse ТЗ
    log('STEP 2: parsing ТЗ with Claude')
    let parsedTZ: { tender_info: Record<string, string>; requirements: Array<Record<string, string | number>> } = { tender_info: {}, requirements: [] }
    try {
      const parseResponse = await anthropic.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: base64 },
            },
            {
              type: 'text',
              text: `Ты — эксперт по тендерной документации. Проанализируй этот документ — техническое задание (ТЗ) на закупку.

Извлеки все технические требования в формате JSON:
{
  "tender_info": {
    "number": "номер закупки или пустая строка",
    "name": "название предмета закупки",
    "customer": "заказчик",
    "budget": "НМЦК или пустая строка",
    "deadline": "срок подачи или пустая строка"
  },
  "requirements": [
    {
      "position": 1,
      "text": "полный текст требования",
      "field_name": "краткое название параметра",
      "constraint_value": "ограничение или значение",
      "unit": "единица или null"
    }
  ]
}

Если документ не является ТЗ — верни пустой requirements.
Отвечай ТОЛЬКО валидным JSON без markdown.`,
            },
          ],
        }],
      })
      const text = parseResponse.content[0].type === 'text' ? parseResponse.content[0].text : ''
      parsedTZ = JSON.parse(cleanJson(text))
      log('STEP 2 OK', { reqs: parsedTZ.requirements?.length, elapsed: Date.now() - startTime })
    } catch (e) {
      log('STEP 2 FAILED (parse error, continuing)', { error: String(e) })
    }

    // STEP 3: Update tender info in DB
    log('STEP 3: updating tender in DB')
    const info = parsedTZ.tender_info ?? {}
    const { error: updateErr } = await supabase.from('tenders').update({
      number: info.number || `ТЗ-${tenderId.slice(0, 6)}`,
      name: info.name || 'Без названия',
      customer: info.customer || 'Не указан',
      budget: info.budget || null,
      status: 'processing',
    }).eq('id', tenderId)

    if (updateErr) log('STEP 3 WARN (update failed)', { error: updateErr.message })
    else log('STEP 3 OK')

    // STEP 4: Save requirements
    const requirements = parsedTZ.requirements ?? []
    if (requirements.length > 0) {
      log('STEP 4: saving requirements', { count: requirements.length })
      const { error: reqErr } = await supabase.from('tender_requirements').insert(
        requirements.map((req) => ({
          tender_id: tenderId,
          position: req.position,
          text: req.text,
          field_name: req.field_name,
          constraint_value: req.constraint_value,
          unit: req.unit || null,
        }))
      )
      if (reqErr) log('STEP 4 WARN', { error: reqErr.message })
      else log('STEP 4 OK')
    }

    // STEP 5: AI audit
    log('STEP 5: AI audit with Claude')
    let auditData: { critical_risks: string[]; warnings: string[]; recommendation: string; match_percent: number } = {
      critical_risks: [],
      warnings: [],
      recommendation: 'Анализ выполнен.',
      match_percent: 0,
    }
    try {
      const auditResponse = await anthropic.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: base64 },
            },
            {
              type: 'text',
              text: `Проанализируй это ТЗ на риски для поставщика. Ответь JSON:
{
  "critical_risks": ["список критических рисков"],
  "warnings": ["список предупреждений"],
  "recommendation": "рекомендация: участвовать или нет и почему",
  "match_percent": 0
}
Отвечай ТОЛЬКО JSON.`,
            },
          ],
        }],
      })
      const text = auditResponse.content[0].type === 'text' ? auditResponse.content[0].text : ''
      auditData = JSON.parse(cleanJson(text))
      log('STEP 5 OK', { risks: auditData.critical_risks?.length, elapsed: Date.now() - startTime })
    } catch (e) {
      log('STEP 5 FAILED (using defaults)', { error: String(e) })
    }

    // STEP 6: Save audit data
    log('STEP 6: saving audit_data')
    const { error: auditErr } = await supabase.from('tenders').update({ audit_data: auditData }).eq('id', tenderId)
    if (auditErr) log('STEP 6 WARN (audit_data column missing? Run: ALTER TABLE tenders ADD COLUMN IF NOT EXISTS audit_data JSONB)', { error: auditErr.message })
    else log('STEP 6 OK')

    // STEP 7: Fetch knowledge base
    log('STEP 7: fetching knowledge base')
    const { data: knowledgeDocs } = await supabase
      .from('product_parameters')
      .select('product_name, parameter_name, parameter_value, unit, source_page')
      .eq('user_id', userId)
      .limit(200)

    const knowledgeContext = knowledgeDocs && knowledgeDocs.length > 0
      ? `База знаний:\n${knowledgeDocs.map((p) => `- ${p.product_name}: ${p.parameter_name} = ${p.parameter_value} ${p.unit ?? ''}`).join('\n')}`
      : 'База знаний пуста. Все строки — not_found.'
    log('STEP 7 OK', { knowledgeItems: knowledgeDocs?.length ?? 0 })

    // STEP 8: Generate Form 2
    log('STEP 8: generating Form 2 with Claude')
    let form2Data: { form2: Array<Record<string, string | number>> } = { form2: [] }
    try {
      const reqList = requirements.length > 0
        ? requirements.map((r) => `${r.position}. ${r.field_name}: ${r.constraint_value}`).join('\n')
        : 'Требования не найдены'

      const form2Response = await anthropic.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: `Заполни Форму 2 для тендера.

Требования:
${reqList}

${knowledgeContext}

Ответь JSON:
{
  "form2": [
    {
      "position": 1,
      "parameter": "название",
      "value": "значение или 'Не найдено'",
      "status": "exact_match | inferred | not_found",
      "constraint": "ограничение из ТЗ",
      "source_text": "цитата или пустая строка",
      "source_file": "файл или пустая строка"
    }
  ]
}
Отвечай ТОЛЬКО JSON.`,
        }],
      })
      const text = form2Response.content[0].type === 'text' ? form2Response.content[0].text : ''
      form2Data = JSON.parse(cleanJson(text))
      log('STEP 8 OK', { form2count: form2Data.form2?.length, elapsed: Date.now() - startTime })
    } catch (e) {
      log('STEP 8 FAILED (using empty)', { error: String(e) })
    }

    // STEP 9: Save Form 2
    if (form2Data.form2 && form2Data.form2.length > 0) {
      log('STEP 9: saving form2_results', { count: form2Data.form2.length })
      const { error: f2Err } = await supabase.from('form2_results').insert(
        form2Data.form2.map((item) => ({
          tender_id: tenderId,
          parameter: item.parameter,
          value: item.value === 'Не найдено' ? null : item.value,
          status: item.status || 'not_found',
          constraint_text: item.constraint || null,
          source_text: item.source_text || null,
          source_file: item.source_file || null,
        }))
      )
      if (f2Err) log('STEP 9 WARN', { error: f2Err.message })
      else log('STEP 9 OK')
    }

    // STEP 10: Set status to 'review'
    log('STEP 10: setting status=review')
    const { error: finalErr } = await supabase.from('tenders').update({
      status: 'review',
      updated_at: new Date().toISOString(),
    }).eq('id', tenderId)
    if (finalErr) log('STEP 10 WARN', { error: finalErr.message })

    const elapsed = Date.now() - startTime
    log('DONE', { elapsed, requirements_count: requirements.length, form2_count: form2Data.form2?.length ?? 0 })

    return NextResponse.json({
      success: true,
      elapsed_ms: elapsed,
      requirements_count: requirements.length,
      form2_count: form2Data.form2?.length ?? 0,
    })

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    const elapsed = Date.now() - startTime
    log('FATAL ERROR', { error: msg, elapsed })
    return NextResponse.json({ error: msg, elapsed_ms: elapsed }, { status: 500 })
  }
}
