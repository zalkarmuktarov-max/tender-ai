'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';

const criticalRisks = [
  'Требуется опыт исполнения контрактов от 20% НМЦК (960 000 ₸)',
  'Ограничение на иностранное оборудование — проверить наличие сертификата CT-KZ',
];

const warnings = [
  'Обеспечение заявки: 144 000 ₸ (3%)',
  'Обеспечение контракта: 240 000 ₸ (5%)',
  'Срок поставки: 90 календарных дней — убедитесь в наличии на складе',
  'Гарантия: требуется 24 мес., производитель даёт 12 — нужна расширенная',
];

export default function AuditPage() {
  const router = useRouter();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0B0F1A' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 210 }}>
        <main style={{ padding: '24px 28px', maxWidth: 780 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
            <h1 style={{ fontSize: 22, fontWeight: 500, color: '#F1F5F9', margin: 0, lineHeight: 1.3 }}>
              AI-аудит: Поставка аппарата УЗИ
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
            ГКП «Поликлиника №4» г. Астана · 4 800 000 ₸ · Дедлайн: 18.04.2026
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Card 1: Critical risks */}
            <div style={{
              background: '#0F1629',
              border: '1px solid #1E293B',
              borderLeft: '3px solid #EF4444',
              borderRadius: 10,
              padding: '16px 20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <AlertTriangle size={16} color="#F87171" strokeWidth={1.5} />
                <span style={{ fontSize: 14, fontWeight: 500, color: '#F87171' }}>Критические риски</span>
              </div>
              <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {criticalRisks.map((r, i) => (
                  <li key={i} style={{ fontSize: 13, color: '#CBD5E1', lineHeight: 1.5 }}>{r}</li>
                ))}
              </ul>
            </div>

            {/* Card 2: Warnings */}
            <div style={{
              background: '#0F1629',
              border: '1px solid #1E293B',
              borderLeft: '3px solid #F59E0B',
              borderRadius: 10,
              padding: '16px 20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <AlertTriangle size={16} color="#FBBF24" strokeWidth={1.5} />
                <span style={{ fontSize: 14, fontWeight: 500, color: '#FBBF24' }}>Обратить внимание</span>
              </div>
              <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {warnings.map((w, i) => (
                  <li key={i} style={{ fontSize: 13, color: '#CBD5E1', lineHeight: 1.5 }}>{w}</li>
                ))}
              </ul>
            </div>

            {/* Card 3: AI recommendation */}
            <div style={{
              background: '#0F1629',
              border: '1px solid #1E293B',
              borderLeft: '3px solid #10B981',
              borderRadius: 10,
              padding: '16px 20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <CheckCircle size={16} color="#34D399" strokeWidth={1.5} />
                <span style={{ fontSize: 14, fontWeight: 500, color: '#34D399' }}>Рекомендация ИИ</span>
              </div>
              <p style={{ fontSize: 13, color: '#CBD5E1', lineHeight: 1.6, margin: '0 0 16px' }}>
                Тендер подходит вашему профилю. В базе знаний найден Mindray DC-70, соответствующий 14 из 16 требований (87.5%). Основной риск — требование расширенной гарантии 24 мес. при стандартной 12 мес. от производителя. Рекомендуем уточнить условия у дистрибьютора до подачи заявки.
              </p>
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '6px 16px', borderRadius: 8,
                fontSize: 14, fontWeight: 600,
                background: 'rgba(16,185,129,0.15)', color: '#34D399',
              }}>
                87.5% совпадение
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
            <button
              onClick={() => router.push('/tender/demo')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '11px 24px',
                background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
                color: '#ffffff', fontSize: 14, fontWeight: 500,
                border: 'none', borderRadius: 8,
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(99,102,241,0.25)',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.9')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
            >
              Перейти к Форме 2 →
            </button>
            <button
              style={{
                padding: '11px 24px',
                background: 'transparent',
                color: '#64748B', fontSize: 14, fontWeight: 500,
                border: '1px solid #1E293B', borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.15s',
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
              Отказаться от тендера
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
