import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { KnowledgeClient } from './KnowledgeClient';
import type { KnowledgeDocument } from '@/types/database';

export default async function KnowledgePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: documents } = await supabase
    .from('knowledge_documents')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <KnowledgeClient
      documents={(documents as KnowledgeDocument[]) ?? []}
      userId={user.id}
    />
  );
}
