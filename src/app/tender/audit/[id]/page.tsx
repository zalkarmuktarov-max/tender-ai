import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AuditClient } from './AuditClient';

interface AuditData {
  critical_risks: string[];
  warnings: string[];
  recommendation: string;
  match_percent: number;
}

export default async function AuditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: tender } = await supabase
    .from('tenders')
    .select('id, number, name, customer, budget, deadline, status, audit_data')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!tender) redirect('/dashboard');

  const audit = (tender.audit_data as AuditData | null) ?? {
    critical_risks: [],
    warnings: [],
    recommendation: 'Анализ не выполнен.',
    match_percent: 0,
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
    />
  );
}
