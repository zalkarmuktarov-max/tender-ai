import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AuditClient } from './AuditClient';

interface AuditData {
  critical_risks: string[];
  warnings: string[];
  recommendation: string;
  match_percent: number;
}

export interface Requirement {
  id: string;
  text: string;
  position: number;
}

export default async function AuditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: tender }, { data: requirements }] = await Promise.all([
    supabase
      .from('tenders')
      .select('id, number, name, customer, budget, deadline, status, audit_data')
      .eq('id', id)
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('tender_requirements')
      .select('id, text, position')
      .eq('tender_id', id)
      .order('position'),
  ]);

  if (!tender) redirect('/dashboard');

  console.log('[audit] tender.audit_data type:', typeof tender.audit_data);
  console.log('[audit] tender.audit_data raw:', JSON.stringify(tender.audit_data));

  let parsed: Partial<AuditData> | null = null;
  if (typeof tender.audit_data === 'string') {
    try {
      parsed = JSON.parse(tender.audit_data);
    } catch (e) {
      console.error('[audit] Failed to parse audit_data string:', e);
    }
  } else {
    parsed = tender.audit_data as Partial<AuditData> | null;
  }

  console.log('[audit] parsed:', JSON.stringify(parsed));

  const audit: AuditData = {
    critical_risks: Array.isArray(parsed?.critical_risks) ? parsed.critical_risks : [],
    warnings: Array.isArray(parsed?.warnings) ? parsed.warnings : [],
    recommendation: parsed?.recommendation ?? 'Анализ не выполнен.',
    match_percent: parsed?.match_percent ?? 0,
  };

  return (
    <AuditClient
      tender={{
        id: tender.id,
        number: tender.number,
        name: tender.name,
        customer: tender.customer,
        budget: tender.budget,
        status: tender.status,
      }}
      audit={audit}
      requirements={(requirements ?? []) as Requirement[]}
    />
  );
}
