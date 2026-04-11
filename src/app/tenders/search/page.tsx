'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, RefreshCw, ExternalLink, Loader2 } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

interface RecommendedTender {
  id: string;
  title: string;
  customer: string;
  budget: number | null;
  currency: string | null;
  deadline: string | null;
  relevance_score: number;
  relevance_reason: string | null;
  source: string | null;
  url: string | null;
  documents_url: string | null;
}

type SortField = 'relevance_score' | 'budget' | 'deadline';

const selectStyle: React.CSSProperties = {
  height: 36,
  padding: '0 12px',
  background: '#0B0F1A',
  border: '1px solid #1E293B',
  borderRadius: 8,
  color: '#CBD5E1',
  fontSize: 13,
  outline: 'none',
  cursor: 'pointer',
};

const inputStyle: React.CSSProperties = {
  height: 36,
  padding: '0 12px',
  background: '#0B0F1A',
  border: '1px solid #1E293B',
  borderRadius: 8,
  color: '#CBD5E1',
  fontSize: 13,
  outline: 'none',
};

function RelevanceBadge({ value }: { value: number }) {
  const color = value > 70 ? '#34D399' : value >= 40 ? '#FBBF24' : '#F87171';
  const bg = value > 70 ? 'rgba(52,211,153,0.1)' : value >= 40 ? 'rgba(251,191,36,0.1)' : 'rgba(248,113,113,0.1)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 64, height: 5, background: '#1E293B', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 3 }} />
      </div>
      <span style={{
        fontSize: 11, fontWeight: 600, color,
        background: bg, padding: '2px 7px', borderRadius: 4, minWidth: 36, textAlign: 'center',
      }}>
        {value}%
      </span>
    </div>
  );
}

function formatBudget(budget: number | null, currency: string | null) {
  if (budget == null) return '—';
  const formatted = budget.toLocaleString('ru-RU');
  const cur = currency ?? '₸';
  return `${formatted} ${cur}`;
}

function formatDeadline(deadline: string | null) {
  if (!deadline) return '—';
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return deadline;
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function TendersSearchPage() {
  const router = useRouter();
  const [tenders, setTenders] = useState<RecommendedTender[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [takingWork, setTakingWork] = useState<Record<string, boolean>>({});

  const [query, setQuery] = useState('');
  const [minScore, setMinScore] = useState('');
  const [sortField, setSortField] = useState<SortField>('relevance_score');
  const [sortAsc, setSortAsc] = useState(false);

  const fetchTenders = useCallback(async () => {
    const { data, error } = await supabase
      .from('recommended_tenders')
      .select('*')
      .order('relevance_score', { ascending: false });

    if (!error && data) {
      setTenders(data as RecommendedTender[]);
      setLastUpdated(new Date());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTenders();
    const interval = setInterval(fetchTenders, 60_000);
    return () => clearInterval(interval);
  }, [fetchTenders]);

  const filtered = useMemo(() => {
    const min = minScore ? parseInt(minScore) : 0;
    let result = tenders.filter((t) => {
      const matchQuery = !query ||
        t.title?.toLowerCase().includes(query.toLowerCase()) ||
        t.customer?.toLowerCase().includes(query.toLowerCase()) ||
        t.source?.toLowerCase().includes(query.toLowerCase());
      const matchScore = t.relevance_score >= min;
      return matchQuery && matchScore;
    });

    result = [...result].sort((a, b) => {
      let aVal: number, bVal: number;
      if (sortField === 'relevance_score') {
        aVal = a.relevance_score ?? 0;
        bVal = b.relevance_score ?? 0;
      } else if (sortField === 'budget') {
        aVal = a.budget ?? 0;
        bVal = b.budget ?? 0;
      } else {
        aVal = a.deadline ? new Date(a.deadline).getTime() : 0;
        bVal = b.deadline ? new Date(b.deadline).getTime() : 0;
      }
      return sortAsc ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [tenders, query, minScore, sortField, sortAsc]);

  const headers: { label: string; field?: SortField }[] = [
    { label: 'Название' },
    { label: 'Заказчик' },
    { label: 'Бюджет', field: 'budget' },
    { label: 'Дедлайн', field: 'deadline' },
    { label: 'Релевантность', field: 'relevance_score' },
    { label: 'Причина' },
    { label: 'Источник' },
    { label: 'Действие' },
  ];

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortAsc((v) => !v);
    else { setSortField(field); setSortAsc(false); }
  };

  const handleTakeWork = useCallback(async (tender: RecommendedTender, e: React.MouseEvent) => {
    e.stopPropagation();

    setTakingWork((prev) => ({ ...prev, [tender.id]: true }));

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) { router.push('/login'); return; }

      const res = await fetch('/api/tender/take', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documents_url: tender.documents_url,
          title: tender.title,
          customer: tender.customer,
          budget: tender.budget,
          deadline: tender.deadline,
          user_id: user.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.tender_id) throw new Error(data.error ?? 'Unknown error');

      const params = new URLSearchParams({ id: data.tender_id, uid: user.id });
      if (data.file_path) params.set('file', data.file_path);
      router.push(`/tender/processing?${params.toString()}`);
    } catch (err) {
      console.error('[takeWork]', err);
      alert('Ошибка при взятии тендера в работу');
      setTakingWork((prev) => ({ ...prev, [tender.id]: false }));
    }
  }, [router]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0B0F1A' }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 210 }}>
        <main style={{ padding: '24px 28px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 500, color: '#F1F5F9', margin: '0 0 4px' }}>Поиск тендеров</h1>
              <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>
                Рекомендованные тендеры, отсортированы по релевантности
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {lastUpdated && (
                <span style={{ fontSize: 11, color: '#475569' }}>
                  Обновлено: {lastUpdated.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              <button
                onClick={fetchTenders}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  height: 32, padding: '0 12px', fontSize: 12,
                  color: '#64748B', background: 'transparent',
                  border: '1px solid #1E293B', borderRadius: 7, cursor: 'pointer',
                }}
              >
                <RefreshCw size={13} />
                Обновить
              </button>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
              <Search size={14} color="#64748B" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Поиск по названию, заказчику, источнику…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ ...inputStyle, width: '100%', paddingLeft: 32, boxSizing: 'border-box' }}
              />
            </div>
            <input
              type="number"
              placeholder="Мин. score"
              value={minScore}
              min={0}
              max={100}
              onChange={(e) => setMinScore(e.target.value)}
              style={{ ...inputStyle, width: 110 }}
            />
            <select
              value={`${sortField}:${sortAsc ? 'asc' : 'desc'}`}
              onChange={(e) => {
                const [f, d] = e.target.value.split(':');
                setSortField(f as SortField);
                setSortAsc(d === 'asc');
              }}
              style={selectStyle}
            >
              <option value="relevance_score:desc">Релевантность ↓</option>
              <option value="relevance_score:asc">Релевантность ↑</option>
              <option value="budget:desc">Бюджет ↓</option>
              <option value="budget:asc">Бюджет ↑</option>
              <option value="deadline:asc">Дедлайн ↑</option>
              <option value="deadline:desc">Дедлайн ↓</option>
            </select>
          </div>

          {/* Table */}
          <div style={{ background: '#0F1629', border: '1px solid #1E293B', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {headers.map(({ label, field }) => (
                    <th
                      key={label}
                      onClick={field ? () => handleSort(field) : undefined}
                      style={{
                        textAlign: 'left', fontSize: 10, fontWeight: 500,
                        color: field && sortField === field ? '#A5B4FC' : '#475569',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                        padding: '10px 14px', borderBottom: '1px solid #1E293B',
                        cursor: field ? 'pointer' : 'default',
                        userSelect: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {label}
                      {field && sortField === field && (
                        <span style={{ marginLeft: 4 }}>{sortAsc ? '↑' : '↓'}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', fontSize: 13, color: '#475569', padding: '48px 0' }}>
                      Загрузка…
                    </td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '56px 24px' }}>
                      {tenders.length === 0 ? (
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 500, color: '#CBD5E1', marginBottom: 8 }}>
                            Тендеры загружаются…
                          </div>
                          <div style={{ fontSize: 13, color: '#475569' }}>
                            Система анализирует новые тендеры каждый час
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: 13, color: '#475569' }}>По вашему запросу тендеры не найдены</span>
                      )}
                    </td>
                  </tr>
                )}
                {!loading && filtered.map((tender) => {
                  const highlight = tender.relevance_score > 70;
                  return (
                    <tr
                      key={tender.id}
                      onClick={() => tender.url && window.open(tender.url, '_blank', 'noopener,noreferrer')}
                      style={{
                        background: highlight ? 'rgba(16,185,129,0.04)' : 'transparent',
                        borderBottom: '1px solid rgba(30,41,59,0.6)',
                        cursor: tender.url ? 'pointer' : 'default',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.06)')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = highlight ? 'rgba(16,185,129,0.04)' : 'transparent')}
                    >
                      {/* Название */}
                      <td style={{ padding: '10px 14px', fontSize: 12, color: '#CBD5E1', maxWidth: 280 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                          <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {tender.title ?? '—'}
                          </span>
                          {tender.url && <ExternalLink size={11} color="#475569" style={{ flexShrink: 0, marginTop: 1 }} />}
                        </div>
                      </td>
                      {/* Заказчик */}
                      <td style={{ padding: '10px 14px', fontSize: 12, color: '#64748B', maxWidth: 180 }}>
                        <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {tender.customer ?? '—'}
                        </span>
                      </td>
                      {/* Бюджет */}
                      <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 500, color: '#A5B4FC', whiteSpace: 'nowrap' }}>
                        {formatBudget(tender.budget, tender.currency)}
                      </td>
                      {/* Дедлайн */}
                      <td style={{ padding: '10px 14px', fontSize: 12, color: '#64748B', whiteSpace: 'nowrap' }}>
                        {formatDeadline(tender.deadline)}
                      </td>
                      {/* Релевантность */}
                      <td style={{ padding: '10px 14px' }}>
                        <RelevanceBadge value={tender.relevance_score} />
                      </td>
                      {/* Причина */}
                      <td style={{ padding: '10px 14px', fontSize: 11, color: '#64748B', maxWidth: 200 }}>
                        <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {tender.relevance_reason ?? '—'}
                        </span>
                      </td>
                      {/* Источник */}
                      <td style={{ padding: '10px 14px', fontSize: 11, color: '#475569', whiteSpace: 'nowrap' }}>
                        {tender.source ?? '—'}
                      </td>
                      {/* Действие */}
                      <td style={{ padding: '8px 14px', whiteSpace: 'nowrap' }}>
                        {(() => {
                          const hasDoc = !!tender.documents_url;
                          const isLoading = !!takingWork[tender.id];
                          return (
                            <button
                              onClick={(e) => hasDoc && !isLoading ? handleTakeWork(tender, e) : e.stopPropagation()}
                              disabled={!hasDoc || isLoading}
                              title={!hasDoc ? 'Нет документов' : undefined}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                height: 28,
                                padding: '0 10px',
                                fontSize: 11,
                                fontWeight: 500,
                                border: 'none',
                                borderRadius: 6,
                                cursor: (!hasDoc || isLoading) ? 'not-allowed' : 'pointer',
                                background: (!hasDoc || isLoading)
                                  ? 'rgba(30,41,59,0.6)'
                                  : 'linear-gradient(135deg, #6366F1, #7C3AED)',
                                color: (!hasDoc || isLoading) ? '#475569' : '#ffffff',
                                transition: 'opacity 0.15s',
                                opacity: isLoading ? 0.7 : 1,
                                flexShrink: 0,
                              }}
                            >
                              {isLoading
                                ? <><Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />Загрузка…</>
                                : 'Взять в работу'
                              }
                            </button>
                          );
                        })()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 10, fontSize: 12, color: '#475569' }}>
            {!loading && `Показано ${filtered.length} из ${tenders.length} тендеров`}
          </div>
        </main>
      </div>
    </div>
  );
}
