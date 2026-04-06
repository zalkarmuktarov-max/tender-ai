'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';

const steps = [
  { id: 0, label: 'Парсинг ТЗ', sub: 'Извлечено 16 требований', status: 'done' },
  { id: 1, label: 'Поиск по базе знаний', sub: 'Найдено 3 подходящих товара', status: 'done' },
  { id: 2, label: 'Генерация Формы 2', sub: 'Заполняется...', status: 'active' },
  { id: 3, label: 'Валидация', sub: 'Ожидание', status: 'waiting' },
];

function PulseRing() {
  return (
    <div style={{ position: 'relative', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'rgba(59,130,246,0.2)',
        animation: 'pulse 1.5s ease-in-out infinite',
      }} />
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: '#60A5FA',
        position: 'relative', zIndex: 1,
      }} />
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function ProcessingPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/tender/audit');
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0B0F1A' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 210, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 380 }}>
          <div style={{
            background: '#0F1629',
            border: '1px solid #1E293B',
            borderRadius: 12,
            padding: '28px 28px 24px',
          }}>
            <h1 style={{ fontSize: 16, fontWeight: 500, color: '#F1F5F9', margin: '0 0 4px' }}>
              KZ-2026-МЗ-44182
            </h1>
            <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 28px' }}>
              УЗИ-аппарат — обработка документов
            </p>

            <div style={{ position: 'relative' }}>
              {/* Vertical line */}
              <div style={{
                position: 'absolute', left: 9, top: 10, bottom: 10,
                width: 1, background: '#1E293B',
              }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {steps.map((step) => (
                  <div key={step.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 14,
                    paddingBottom: step.id < steps.length - 1 ? 22 : 0,
                    position: 'relative',
                  }}>
                    {/* Step indicator */}
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      zIndex: 1, position: 'relative',
                      background: step.status === 'done'
                        ? 'rgba(16,185,129,0.15)'
                        : step.status === 'active'
                        ? 'rgba(59,130,246,0.12)'
                        : 'transparent',
                      border: step.status === 'waiting' ? '1px solid #1E293B' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {step.status === 'done' && <Check size={11} color="#34D399" strokeWidth={2.5} />}
                      {step.status === 'active' && <PulseRing />}
                      {step.status === 'waiting' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#475569' }} />}
                    </div>
                    <div style={{ paddingTop: 1 }}>
                      <div style={{
                        fontSize: 13,
                        color: step.status === 'waiting' ? '#475569' : '#CBD5E1',
                        fontWeight: step.status === 'active' ? 500 : 400,
                      }}>
                        {step.label}
                      </div>
                      <div style={{
                        fontSize: 11, marginTop: 2,
                        color: step.status === 'done' ? '#34D399'
                          : step.status === 'active' ? '#60A5FA'
                          : '#475569',
                      }}>
                        {step.sub}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#475569', marginTop: 16 }}>
            Автоматический переход через 3 секунды...
          </p>
        </div>
      </div>
    </div>
  );
}
