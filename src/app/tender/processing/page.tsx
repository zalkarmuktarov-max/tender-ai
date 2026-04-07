'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { createClient } from '@/lib/supabase/client';

const STEPS = [
  { label: 'Загрузка документа', sub: 'Скачивание из Storage...' },
  { label: 'Парсинг ТЗ', sub: 'Извлечение требований...' },
  { label: 'AI-аудит', sub: 'Анализ рисков...' },
  { label: 'Генерация Формы 2', sub: 'Сопоставление с базой знаний...' },
];

function PulseRing() {
  return (
    <div style={{ position: 'relative', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(59,130,246,0.2)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#60A5FA', position: 'relative', zIndex: 1 }} />
      <style>{`@keyframes pulse { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.4);opacity:0} }`}</style>
    </div>
  );
}

function ProcessingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenderId = searchParams.get('id');
  const filePath = searchParams.get('file');
  const userId = searchParams.get('uid');

  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const apiCalled = useRef(false);

  useEffect(() => {
    if (!tenderId || !filePath || !userId) {
      // No params — demo mode, redirect after timeout
      const t = setTimeout(() => router.push('/tender/audit'), 3000);
      return () => clearTimeout(t);
    }

    if (apiCalled.current) return;
    apiCalled.current = true;

    // Start AI processing
    const process = async () => {
      try {
        // Simulate step progress while API runs
        const stepTimer = setInterval(() => {
          setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
        }, 8000);

        const res = await fetch('/api/tender/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenderId, filePath, userId }),
        });

        clearInterval(stepTimer);
        setActiveStep(STEPS.length - 1);

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Ошибка обработки');
          return;
        }

        // Poll DB until status = 'review'
        const poll = async () => {
          const supabase = createClient();
          const { data: tender } = await supabase
            .from('tenders')
            .select('status')
            .eq('id', tenderId)
            .single();

          if (tender?.status === 'review' || tender?.status === 'completed') {
            router.push(`/tender/audit/${tenderId}`);
          } else {
            setTimeout(poll, 2000);
          }
        };
        await poll();

      } catch (e) {
        console.error('Processing error:', e);
        setError('Ошибка соединения. Попробуйте снова.');
      }
    };

    process();
  }, [tenderId, filePath, userId, router]);

  const steps = tenderId
    ? STEPS.map((s, i) => ({
        ...s,
        status: i < activeStep ? 'done' : i === activeStep ? 'active' : 'waiting',
      }))
    : [
        { label: 'Парсинг ТЗ', sub: 'Извлечено 16 требований', status: 'done' },
        { label: 'Поиск по базе знаний', sub: 'Найдено 3 подходящих товара', status: 'done' },
        { label: 'Генерация Формы 2', sub: 'Заполняется...', status: 'active' },
        { label: 'Валидация', sub: 'Ожидание', status: 'waiting' },
      ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0B0F1A' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 210, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 380 }}>
          <div style={{ background: '#0F1629', border: '1px solid #1E293B', borderRadius: 12, padding: '28px 28px 24px' }}>
            <h1 style={{ fontSize: 16, fontWeight: 500, color: '#F1F5F9', margin: '0 0 4px' }}>
              {tenderId ? 'Обработка документа' : 'KZ-2026-МЗ-44182'}
            </h1>
            <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 28px' }}>
              {tenderId ? 'Claude AI анализирует ТЗ...' : 'УЗИ-аппарат — обработка документов'}
            </p>

            {error ? (
              <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 13, color: '#F87171' }}>
                {error}
                <button
                  onClick={() => { apiCalled.current = false; setError(''); setActiveStep(0); }}
                  style={{ display: 'block', marginTop: 8, background: 'none', border: 'none', color: '#A5B4FC', cursor: 'pointer', fontSize: 12, padding: 0 }}
                >
                  Попробовать снова
                </button>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 9, top: 10, bottom: 10, width: 1, background: '#1E293B' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {steps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, paddingBottom: i < steps.length - 1 ? 22 : 0, position: 'relative' }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%', flexShrink: 0, zIndex: 1, position: 'relative',
                        background: step.status === 'done' ? 'rgba(16,185,129,0.15)' : step.status === 'active' ? 'rgba(59,130,246,0.12)' : 'transparent',
                        border: step.status === 'waiting' ? '1px solid #1E293B' : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {step.status === 'done' && <Check size={11} color="#34D399" strokeWidth={2.5} />}
                        {step.status === 'active' && <PulseRing />}
                        {step.status === 'waiting' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#475569' }} />}
                      </div>
                      <div style={{ paddingTop: 1 }}>
                        <div style={{ fontSize: 13, color: step.status === 'waiting' ? '#475569' : '#CBD5E1', fontWeight: step.status === 'active' ? 500 : 400 }}>
                          {step.label}
                        </div>
                        <div style={{ fontSize: 11, marginTop: 2, color: step.status === 'done' ? '#34D399' : step.status === 'active' ? '#60A5FA' : '#475569' }}>
                          {step.sub}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#475569', marginTop: 16 }}>
            {error ? '' : tenderId ? 'Обработка занимает 30–60 секунд...' : 'Автоматический переход через 3 секунды...'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', minHeight: '100vh', background: '#0B0F1A', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#64748B', fontSize: 13 }}>Загрузка...</div>
      </div>
    }>
      <ProcessingContent />
    </Suspense>
  );
}
