import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardClient } from './DashboardClient';
import type { Tender } from '@/types/database';

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: tenders } = await supabase
    .from('tenders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single();

  return (
    <DashboardClient
      tenders={(tenders as Tender[]) ?? []}
      userEmail={profile?.email ?? user.email ?? ''}
      userName={profile?.full_name ?? ''}
    />
  );
}
