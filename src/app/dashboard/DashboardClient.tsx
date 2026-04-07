'use client';

import { useRouter } from 'next/navigation';
import { Plus, FileCheck, Zap, Clock, Trophy } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { MetricCard } from '@/components/MetricCard';
import { TenderStatusBadge } from '@/components/StatusBadge';
import type { Tender } from '@/types/database';

const STATUS_LABELS: Record<Tender['status'], string> = {
  processing: 'Обработка',
  review: 'На проверке',
  completed: 'Завершён',
  rejected: 'Отклонён',
};

interface Props {
  tenders: Tender[];
  userEmail: string;
  userName: string;
}

export function DashboardClient({ tenders, userEmail, userName }: Props) {
  const router = useRouter();

  const completed = tenders.filter((t) => t.status === 'completed').length;
  const initials = userName
    ? userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : userEmail.slice(0, 2).toUpperCase();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0B0F1A' }}>
      <Sidebar userEmail={userEmail} userName={userName} initials={initials} />
      <div style={{ flex: 1, marginLeft: 210, display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1, padding: '24px 28px' }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 500, color: '#F1F5F9', margin: 0, lineHeight: 1.2 }}>Дашборд</h1>
              <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 0' }}>Обзор активности</p>
            </div>
            <button
              onClick={() => router.push('/tender/new')}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 18px',
                background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
                color: '#ffffff', fontSize: 13, fontWeight: 500,
                border: 'none', borderRadius: 8, cursor: 'pointer',
                boxShadow: '0 0 16px rgba(99,102,241,0.2)', transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.9')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
            >
              <Plus size={15} strokeWidth={2} />
              Новый тендер
            </button>
          </div>

          {/* Metric cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
            <MetricCard label="Всего тендеров" value={String(tenders.length)} icon={FileCheck} iconBg="rgba(16,185,129,0.12)" iconColor="#34D399" glowColor="rgba(16,185,129,0.3)" />
            <MetricCard label="Завершено" value={String(completed)} icon={Zap} iconBg="rgba(245,158,11,0.12)" iconColor="#FBBF24" glowColor="rgba(245,158,11,0.3)" />
            <MetricCard label="В обработке" value={String(tenders.filter((t) => t.status === 'processing').length)} icon={Clock} iconBg="rgba(59,130,246,0.12)" iconColor="#60A5FA" glowColor="rgba(59,130,246,0.3)" />
            <MetricCard label="На проверке" value={String(tenders.filter((t) => t.status === 'review').length)} icon={Trophy} iconBg="rgba(139,92,246,0.12)" iconColor="#A78BFA" glowColor="rgba(139,92,246,0.3)" />
          </div>

          {/* Table */}
          <div style={{ background: '#0F1629', border: '1px solid #1E293B', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #1E293B' }}>
              <h2 style={{ fontSize: 14, fontWeight: 500, color: '#F1F5F9', margin: 0 }}>Последние тендеры</h2>
            </div>

            {tenders.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#64748B', marginBottom: 12 }}>Нет тендеров. Создайте первый →</div>
                <button
                  onClick={() => router.push('/tender/new')}
                  style={{
                    padding: '9px 18px',
                    background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
                    color: '#fff', fontSize: 13, fontWeight: 500,
                    border: 'none', borderRadius: 8, cursor: 'pointer',
                  }}
                >
                  Новый тендер
                </button>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Номер', 'Наименование', 'Заказчик', 'Бюджет', 'Дата', 'Статус'].map((h) => (
                      <th key={h} style={{
                        textAlign: 'left', fontSize: 10, fontWeight: 500,
                        color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px',
                        padding: '10px 18px', borderBottom: '1px solid #1E293B',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tenders.map((tender) => (
                    <tr
                      key={tender.id}
                      onClick={() => router.push(`/tender/${tender.id}`)}
                      style={{ cursor: 'pointer', transition: 'background 0.15s', borderBottom: '1px solid rgba(30,41,59,0.6)' }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.04)')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                    >
                      <td style={{ padding: '11px 18px', fontSize: 12, fontWeight: 500, color: '#A5B4FC' }}>{tender.number}</td>
                      <td style={{ padding: '11px 18px', fontSize: 12, color: '#CBD5E1' }}>{tender.name}</td>
                      <td style={{ padding: '11px 18px', fontSize: 12, color: '#CBD5E1' }}>{tender.customer}</td>
                      <td style={{ padding: '11px 18px', fontSize: 12, color: '#A5B4FC', fontWeight: 500 }}>{tender.budget ?? '—'}</td>
                      <td style={{ padding: '11px 18px', fontSize: 12, color: '#64748B' }}>
                        {tender.created_at ? new Date(tender.created_at).toLocaleDateString('ru-RU') : '—'}
                      </td>
                      <td style={{ padding: '11px 18px' }}>
                        <TenderStatusBadge status={tender.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
