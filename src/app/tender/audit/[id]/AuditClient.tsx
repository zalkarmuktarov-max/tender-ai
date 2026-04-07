'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';

interface AuditData {
  critical_risks: string[];
  warnings: string[];
  recommendation: string;
  match_percent: number;
}

interface TenderInfo {
  id: string;
  number: string;
  name: string;
  customer: string;
  budget: string | null;
  status: string;
}

interface Props {
  tender: TenderInfo;
  audit: AuditData;
}

export function AuditClient({ tender, audit }: Props) {
  const router = useRouter();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0B0F1A' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 210 }}>
        <main style={{ padding: '24px 28px', maxWidth: 780 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
            <h1 style={{ fontSize: 22, fontWeight: 500, color: '#F1F5F9', margin: 0, lineHeight: 1.3 }}>
              AI-аудит: {tender.name}
            </h1>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '3px 12px', borderRadius: 20,
              fontSize: 12, fontWeight: 500,
              background: 'rgba(16,185,129,0.15)', color: '#34D399',
              flexShrink: 0, marginLeft: 16, marginTop: 4,
            }}>
              Завершён
            </span>
          </div>
          <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 28px' }}>
            {tender.customer}{tender.budget ? ` · ${tender.budget}` : ''} · {tender.number}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Critical risks */}
            {audit.critical_risks.length > 0 && (
              <div style={{ background: '#0F1629', border: '1px solid #1E293B', borderLeft: '3px solid #EF4444', borderRadius: 10, padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <AlertTriangle size={16} color="#F87171" strokeWidth={1.5} />
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#F87171' }}>Критические риски</span>
                </div>
                <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {audit.critical_risks.map((r, i) => (
                    <li key={i} style={{ fontSize: 13, color: '#CBD5E1', lineHeight: 1.5 }}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {audit.warnings.length > 0 && (
              <div style={{ background: '#0F1629', border: '1px solid #1E293B', borderLeft: '3px solid #F59E0B', borderRadius: 10, padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <AlertTriangle size={16} color="#FBBF24" strokeWidth={1.5} />
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#FBBF24' }}>Обратить внимание</span>
                </div>
                <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {audit.warnings.map((w, i) => (
                    <li key={i} style={{ fontSize: 13, color: '#CBD5E1', lineHeight: 1.5 }}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* No risks */}
            {audit.critical_risks.length === 0 && audit.warnings.length === 0 && (
              <div style={{ background: '#0F1629', border: '1px solid #1E293B', borderLeft: '3px solid #34D399', borderRadius: 10, padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle size={16} color="#34D399" strokeWidth={1.5} />
                  <span style={{ fontSize: 13, color: '#CBD5E1' }}>Критических рисков не обнаружено</span>
                </div>
              </div>
            )}

            {/* AI recommendation */}
            <div style={{ background: '#0F1629', border: '1px solid #1E293B', borderLeft: '3px solid #10B981', borderRadius: 10, padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <CheckCircle size={16} color="#34D399" strokeWidth={1.5} />
                <span style={{ fontSize: 14, fontWeight: 500, color: '#34D399' }}>Рекомендация ИИ</span>
              </div>
              <p style={{ fontSize: 13, color: '#CBD5E1', lineHeight: 1.6, margin: '0 0 16px' }}>
                {audit.recommendation}
              </p>
              {audit.match_percent > 0 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '6px 16px', borderRadius: 8,
                  fontSize: 14, fontWeight: 600,
                  background: 'rgba(16,185,129,0.15)', color: '#34D399',
                }}>
                  {audit.match_percent}% совпадение
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
            <button
              onClick={() => router.push(`/tender/${tender.id}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '11px 24px',
                background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
                color: '#ffffff', fontSize: 14, fontWeight: 500,
                border: 'none', borderRadius: 8, cursor: 'pointer',
                boxShadow: '0 0 20px rgba(99,102,241,0.25)',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.9')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
            >
              Перейти к Форме 2 →
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                padding: '11px 24px', background: 'transparent',
                color: '#64748B', fontSize: 14, fontWeight: 500,
                border: '1px solid #1E293B', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#EF4444';
                (e.currentTarget as HTMLElement).style.color = '#F87171';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#1E293B';
                (e.currentTarget as HTMLElement).style.color = '#64748B';
              }}
            >
              Вернуться на дашборд
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
