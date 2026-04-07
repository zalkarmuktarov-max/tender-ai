import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardClient } from './DashboardClient';
import type { Tender } from '@/types/database';

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: tenders }, { data: profile }, { data: form2Stats }] = await Promise.all([
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
    supabase
      .from('form2_results')
      .select('status, tender_id')
      .in('tender_id',
        // sub-select: only user's tenders
        supabase.from('tenders').select('id').eq('user_id', user.id) as unknown as string[]
      ),
  ]);

  // Compute metrics
  const allTenders = (tenders as Tender[]) ?? [];
  const processed = allTenders.filter((t) => t.status === 'review' || t.status === 'completed').length;
  const completed = allTenders.filter((t) => t.status === 'completed').length;
  const winRate = allTenders.length > 0 ? Math.round((completed / allTenders.length) * 100) : 0;
  const savedHours = allTenders.length * 5;

  const rows = (form2Stats as Array<{ status: string }> | null) ?? [];
  const matched = rows.filter((r) => r.status === 'exact_match' || r.status === 'inferred').length;
  const autoFill = rows.length > 0 ? Math.round((matched / rows.length) * 100) : 0;

  return (
    <DashboardClient
      tenders={allTenders}
      userEmail={profile?.email ?? user.email ?? ''}
      userName={profile?.full_name ?? ''}
      metrics={{ processed, autoFill, savedHours, winRate }}
    />
  );
}
