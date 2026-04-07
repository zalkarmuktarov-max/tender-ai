import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardClient } from './DashboardClient';
import type { Tender } from '@/types/database';

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: tenders }, { data: profile }] = await Promise.all([
    supabase
      .from('tenders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single(),
  ]);

  const allTenders = (tenders as Tender[]) ?? [];

  // Fetch form2 stats only if there are tenders
  let autoFill = 0;
  const tenderIds = allTenders.map((t) => t.id);
  if (tenderIds.length > 0) {
    const { data: form2Stats } = await supabase
      .from('form2_results')
      .select('status')
      .in('tender_id', tenderIds);

    const rows = form2Stats ?? [];
    const matched = rows.filter((r) => r.status === 'exact_match' || r.status === 'inferred').length;
    autoFill = rows.length > 0 ? Math.round((matched / rows.length) * 100) : 0;
  }

  const processed = allTenders.filter((t) => t.status === 'review' || t.status === 'completed').length;
  const completed = allTenders.filter((t) => t.status === 'completed').length;
  const winRate = allTenders.length > 0 ? Math.round((completed / allTenders.length) * 100) : 0;
  const savedHours = allTenders.length * 5;

  return (
    <DashboardClient
      tenders={allTenders}
      userEmail={profile?.email ?? user.email ?? ''}
      userName={profile?.full_name ?? ''}
      metrics={{ processed, autoFill, savedHours, winRate }}
    />
  );
}
