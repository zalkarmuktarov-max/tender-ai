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

  const raw = tender.audit_data as Partial<AuditData> | null;
  const audit: AuditData = {
    critical_risks: Array.isArray(raw?.critical_risks) ? raw.critical_risks : [],
    warnings: Array.isArray(raw?.warnings) ? raw.warnings : [],
    recommendation: raw?.recommendation ?? 'Анализ не выполнен.',
    match_percent: raw?.match_percent ?? 0,
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
