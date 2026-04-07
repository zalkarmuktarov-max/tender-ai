import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { TenderForm } from './TenderForm';
import { mockFormFields } from '@/data/mockTenderData';
import type { FormField } from '@/types/tender';

export default async function TenderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Demo fallback
  if (id === 'demo' || id === '1') {
    return <TenderForm tenderId={id} fields={mockFormFields} tenderLabel="KZ-2026-МЗ-44182" tenderSub="ГКП «Городская поликлиника №4» г. Астана" />;
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: tender }, { data: form2 }, { data: requirements }] = await Promise.all([
    supabase.from('tenders').select('number, name, customer').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('form2_results').select('*').eq('tender_id', id).order('id'),
    supabase.from('tender_requirements').select('*').eq('tender_id', id).order('position'),
  ]);

  if (!tender) redirect('/dashboard');

  // Map DB rows → FormField shape used by TenderForm
  const reqMap = new Map((requirements ?? []).map((r) => [r.id, r]));

  const fields: FormField[] = (form2 ?? []).map((row, idx) => {
    const req = row.requirement_id ? reqMap.get(row.requirement_id) : null;
    // DB status 'exact_match' → 'exact' for UI
    const uiStatus: FormField['status'] =
      row.status === 'exact_match' ? 'exact' : row.status === 'inferred' ? 'inferred' : 'not_found';

    return {
      id: idx,
      param: row.parameter,
      value: row.final_value ?? row.value ?? 'Не найдено',
      status: uiStatus,
      constraint: row.constraint_text ?? '',
      tz: req?.text ?? row.parameter,
      source: row.source_text ?? '',
      sourceFile: row.source_file ?? '',
    };
  });

  return (
    <TenderForm
      tenderId={id}
      fields={fields}
      tenderLabel={tender.number}
      tenderSub={tender.customer}
    />
  );
}
