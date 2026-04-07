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
  const { tenderId, filePath, userId } = await request.json()

  if (!tenderId || !filePath || !userId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    // 1. Download file from Storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from('documents')
      .download(filePath)

    if (fileError || !fileData) {
      await supabase.from('tenders').update({ status: 'processing' }).eq('id', tenderId)
      return NextResponse.json({ error: 'Failed to download file: ' + fileError?.message }, { status: 500 })
    }

    const buffer = await fileData.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')

    // 2. Step 1: Parse ТЗ — extract requirements
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
            text: `Ты — эксперт по тендерной документации Казахстана и РФ (44-ФЗ, 223-ФЗ, goszakup.gov.kz).

Проанализируй этот документ — техническое задание (ТЗ) заказчика на закупку.

Извлеки ВСЕ технические требования к товару/оборудованию в формате JSON:

{
  "tender_info": {
    "number": "номер закупки если есть",
    "name": "название предмета закупки",
    "customer": "наименование заказчика",
    "budget": "начальная максимальная цена",
    "deadline": "срок подачи заявок"
  },
  "requirements": [
    {
      "position": 1,
      "text": "полный текст требования из ТЗ",
      "field_name": "краткое название параметра (Масса, Диагональ экрана и т.д.)",
      "constraint_value": "ограничение (≤ 8 кг, ≥ 15 дюймов, Наличие и т.д.)",
      "unit": "единица измерения или null"
    }
  ]
}

Важно:
- Извлекай ВСЕ строки таблицы характеристик — каждая строка = отдельное требование
- Если документ не является ТЗ — верни пустой массив requirements
- Отвечай ТОЛЬКО валидным JSON, без markdown`,
          },
        ],
      }],
    })

    let parsedTZ: { tender_info: Record<string, string>; requirements: Array<Record<string, string | number>> } = { tender_info: {}, requirements: [] }
    try {
      const text = parseResponse.content[0].type === 'text' ? parseResponse.content[0].text : ''
      parsedTZ = JSON.parse(cleanJson(text))
    } catch { /* keep empty */ }

    // 3. Update tender info
    const info = parsedTZ.tender_info ?? {}
    await supabase.from('tenders').update({
      number: info.number || `ТЗ-${tenderId.slice(0, 6)}`,
      name: info.name || 'Без названия',
      customer: info.customer || 'Не указан',
      budget: info.budget || null,
      status: 'processing',
    }).eq('id', tenderId)

    // 4. Save requirements
    const requirements = parsedTZ.requirements ?? []
    if (requirements.length > 0) {
      await supabase.from('tender_requirements').insert(
        requirements.map((req) => ({
          tender_id: tenderId,
          position: req.position,
          text: req.text,
          field_name: req.field_name,
          constraint_value: req.constraint_value,
          unit: req.unit || null,
        }))
      )
    }

    // 5. Step 2: AI audit
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
  "critical_risks": ["список критических рисков — то что может привести к отклонению заявки"],
  "warnings": ["список предупреждений — на что обратить внимание"],
  "recommendation": "общая рекомендация: стоит ли участвовать и почему",
  "match_percent": 0
}

Типичные риски:
- Требование опыта исполнения контрактов от определённой суммы
- Ограничения на иностранное оборудование / требование CT-KZ
- Обеспечение заявки и контракта
- Нереалистичные сроки поставки
- Привязка к конкретному бренду

Отвечай ТОЛЬКО JSON.`,
          },
        ],
      }],
    })

    let auditData: { critical_risks: string[]; warnings: string[]; recommendation: string; match_percent: number } = {
      critical_risks: [],
      warnings: [],
      recommendation: 'Не удалось проанализировать',
      match_percent: 0,
    }
    try {
      const text = auditResponse.content[0].type === 'text' ? auditResponse.content[0].text : ''
      auditData = JSON.parse(cleanJson(text))
    } catch { /* keep default */ }

    // 6. Save audit to tenders.audit_data
    await supabase.from('tenders').update({ audit_data: auditData }).eq('id', tenderId)

    // 7. Step 3: Generate Form 2 — match with knowledge base
    const { data: knowledgeDocs } = await supabase
      .from('product_parameters')
      .select('product_name, parameter_name, parameter_value, unit, source_page')
      .eq('user_id', userId)
      .limit(200)

    const knowledgeContext = knowledgeDocs && knowledgeDocs.length > 0
      ? `База знаний (извлечённые параметры):\n${knowledgeDocs.map((p) => `- ${p.product_name}: ${p.parameter_name} = ${p.parameter_value} ${p.unit ?? ''} (стр. ${p.source_page ?? '?'})`).join('\n')}`
      : 'База знаний пуста. Все строки — not_found.'

    const reqList = requirements.length > 0
      ? requirements.map((r) => `${r.position}. ${r.field_name}: ${r.constraint_value} | ${r.text}`).join('\n')
      : 'Требования не найдены'

    const form2Response = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `Ты заполняешь Форму 2 (техническое предложение) для тендера.

Требования заказчика:
${reqList}

${knowledgeContext}

Для каждого требования заполни значение из базы знаний. Ответь JSON:

{
  "form2": [
    {
      "position": 1,
      "parameter": "название параметра",
      "value": "значение из базы знаний или 'Не найдено'",
      "status": "exact_match | inferred | not_found",
      "constraint": "ограничение из ТЗ",
      "source_text": "точная цитата откуда взято значение, или пустая строка",
      "source_file": "файл-источник или пустая строка"
    }
  ]
}

Правила:
- exact_match: значение найдено точно
- inferred: потребовалась интерпретация
- not_found: данных нет
- НИКОГДА не выдумывай значения
- Если база знаний пуста — ВСЕ not_found

Отвечай ТОЛЬКО JSON.`,
      }],
    })

    let form2Data: { form2: Array<Record<string, string | number>> } = { form2: [] }
    try {
      const text = form2Response.content[0].type === 'text' ? form2Response.content[0].text : ''
      form2Data = JSON.parse(cleanJson(text))
    } catch { /* keep empty */ }

    // 8. Save Form 2 results
    if (form2Data.form2 && form2Data.form2.length > 0) {
      await supabase.from('form2_results').insert(
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
    }

    // 9. Mark tender as ready for review
    await supabase.from('tenders').update({
      status: 'review',
      updated_at: new Date().toISOString(),
    }).eq('id', tenderId)

    return NextResponse.json({
      success: true,
      requirements_count: requirements.length,
      form2_count: form2Data.form2?.length ?? 0,
    })

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Process error:', msg)
    // Don't change status to error — leave as processing so user can retry
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
