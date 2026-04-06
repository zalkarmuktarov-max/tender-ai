'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';

interface Tender {
  id: string;
  name: string;
  customer: string;
  budget: string;
  budgetNum: number;
  deadline: string;
  relevance: number;
  region: string;
  category: string;
}

const TENDERS: Tender[] = [
  { id: 'KZ-2026-МЗ-44182', name: 'Поставка аппарата УЗИ для ГКП «Городская поликлиника №4» г. Астана', customer: 'ГКП «Городская поликлиника №4»', budget: '4 800 000 ₸', budgetNum: 4800000, deadline: '18.04.2026', relevance: 92, region: 'Астана', category: 'Медоборудование' },
  { id: 'KZ-2026-МЗ-44190', name: 'Поставка портативного УЗИ-сканера для БСМП г. Алматы', customer: 'ГКП «БСМП» г. Алматы', budget: '5 500 000 ₸', budgetNum: 5500000, deadline: '22.04.2026', relevance: 88, region: 'Алматы', category: 'Медоборудование' },
  { id: 'KZ-2026-МЗ-44201', name: 'Закупка рентгенодиагностического комплекса для ОКБ Караганда', customer: 'ГКП «ОКБ» Караганда', budget: '18 200 000 ₸', budgetNum: 18200000, deadline: '25.04.2026', relevance: 34, region: 'Караганда', category: 'Медоборудование' },
  { id: 'KZ-2026-МЗ-44215', name: 'Поставка аппарата ИВЛ для ОРИТ ГКБ №7 Шымкент', customer: 'ГКП «ГКБ №7» Шымкент', budget: '8 900 000 ₸', budgetNum: 8900000, deadline: '20.04.2026', relevance: 15, region: 'Шымкент', category: 'Медоборудование' },
  { id: 'KZ-2026-ИТ-30441', name: 'Поставка серверного оборудования для АО «Казпочта»', customer: 'АО «Казпочта»', budget: '32 000 000 ₸', budgetNum: 32000000, deadline: '28.04.2026', relevance: 8, region: 'Астана', category: 'IT-оборудование' },
  { id: 'KZ-2026-МЗ-44228', name: 'Поставка эндоскопического оборудования для ГБ Актау', customer: 'ГКП «Городская больница» Актау', budget: '12 400 000 ₸', budgetNum: 12400000, deadline: '30.04.2026', relevance: 45, region: 'Актау', category: 'Медоборудование' },
  { id: 'KZ-2026-МЗ-44236', name: 'Закупка лабораторного анализатора для ЦРБ Тараз', customer: 'ГКП «ЦРБ» Тараз', budget: '6 700 000 ₸', budgetNum: 6700000, deadline: '15.04.2026', relevance: 71, region: 'Алматы', category: 'Медоборудование' },
  { id: 'KZ-2026-МЗ-44244', name: 'Поставка цифрового маммографа для онкоцентр Астана', customer: 'ГКП «Онкоцентр» Астана', budget: '22 500 000 ₸', budgetNum: 22500000, deadline: '02.05.2026', relevance: 28, region: 'Астана', category: 'Медоборудование' },
];

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

function RelevanceBar({ value }: { value: number }) {
  const color = value > 70 ? '#34D399' : value >= 30 ? '#FBBF24' : '#475569';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 72, height: 6, background: '#1E293B', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 3, transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 500, color, minWidth: 32 }}>{value}%</span>
    </div>
  );
}

export default function TendersSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Все');
  const [region, setRegion] = useState('Все регионы');
  const [budgetFrom, setBudgetFrom] = useState('');
  const [budgetTo, setBudgetTo] = useState('');

  const filtered = useMemo(() => {
    return TENDERS.filter((t) => {
      const matchQuery = !query ||
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.id.toLowerCase().includes(query.toLowerCase()) ||
        t.customer.toLowerCase().includes(query.toLowerCase());
      const matchCategory = category === 'Все' || t.category === category;
      const matchRegion = region === 'Все регионы' || t.region === region;
      const from = budgetFrom ? parseInt(budgetFrom.replace(/\D/g, '')) : 0;
      const to = budgetTo ? parseInt(budgetTo.replace(/\D/g, '')) : Infinity;
      const matchBudget = t.budgetNum >= from && t.budgetNum <= to;
      return matchQuery && matchCategory && matchRegion && matchBudget;
    }).sort((a, b) => b.relevance - a.relevance);
  }, [query, category, region, budgetFrom, budgetTo]);

  const headers = ['Номер закупки', 'Наименование', 'Заказчик', 'Бюджет', 'Дедлайн', 'Релевантность', ''];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0B0F1A' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 210 }}>
        <main style={{ padding: '24px 28px' }}>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: '#F1F5F9', margin: '0 0 4px' }}>Поиск тендеров</h1>
          <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 20px' }}>
            Результаты с портала goszakup.gov.kz, отсортированы по релевантности
          </p>

          {/* Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
              <Search size={14} color="#64748B" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Поиск по названию, номеру, заказчику…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ ...inputStyle, width: '100%', paddingLeft: 32, boxSizing: 'border-box' }}
              />
            </div>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={selectStyle}>
              <option>Все</option>
              <option>Медоборудование</option>
              <option>IT-оборудование</option>
              <option>Строительство</option>
            </select>
            <input type="text" placeholder="Бюджет от" value={budgetFrom} onChange={(e) => setBudgetFrom(e.target.value)} style={{ ...inputStyle, width: 110 }} />
            <input type="text" placeholder="Бюджет до" value={budgetTo} onChange={(e) => setBudgetTo(e.target.value)} style={{ ...inputStyle, width: 110 }} />
            <select value={region} onChange={(e) => setRegion(e.target.value)} style={selectStyle}>
              <option>Все регионы</option>
              <option>Астана</option>
              <option>Алматы</option>
              <option>Караганда</option>
              <option>Шымкент</option>
              <option>Актау</option>
            </select>
          </div>

          {/* Table */}
          <div style={{ background: '#0F1629', border: '1px solid #1E293B', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {headers.map((h) => (
                    <th key={h} style={{
                      textAlign: 'left', fontSize: 10, fontWeight: 500,
                      color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px',
                      padding: '10px 14px', borderBottom: '1px solid #1E293B',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', fontSize: 13, color: '#475569', padding: '48px 0' }}>Тендеры не найдены</td></tr>
                )}
                {filtered.map((tender) => {
                  const highlight = tender.relevance > 70;
                  return (
                    <tr
                      key={tender.id}
                      style={{
                        background: highlight ? 'rgba(16,185,129,0.04)' : 'transparent',
                        borderBottom: '1px solid rgba(30,41,59,0.6)',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.04)')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = highlight ? 'rgba(16,185,129,0.04)' : 'transparent')}
                    >
                      <td style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'monospace', color: '#A5B4FC', whiteSpace: 'nowrap' }}>
                        {tender.id}
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: 12, color: '#CBD5E1', maxWidth: 260 }}>
                        <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {tender.name}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: 12, color: '#64748B', maxWidth: 160 }}>
                        <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {tender.customer}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 500, color: '#A5B4FC', whiteSpace: 'nowrap' }}>
                        {tender.budget}
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: 12, color: '#64748B', whiteSpace: 'nowrap' }}>
                        {tender.deadline}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <RelevanceBar value={tender.relevance} />
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <button
                          onClick={() => router.push(`/tender/new?name=${encodeURIComponent(tender.name)}`)}
                          style={{
                            height: 28, padding: '0 10px',
                            fontSize: 11, fontWeight: 500,
                            color: '#64748B',
                            background: 'transparent',
                            border: '1px solid #1E293B',
                            borderRadius: 6,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor = '#6366F1';
                            (e.currentTarget as HTMLElement).style.color = '#A5B4FC';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor = '#1E293B';
                            (e.currentTarget as HTMLElement).style.color = '#64748B';
                          }}
                        >
                          Взять в работу
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: '#475569' }}>
            Показано {filtered.length} из {TENDERS.length} тендеров
          </div>
        </main>
      </div>
    </div>
  );
}
