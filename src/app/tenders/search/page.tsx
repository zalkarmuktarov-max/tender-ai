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

function RelevanceBar({ value }: { value: number }) {
  const color =
    value > 70 ? '#16A34A' : value >= 30 ? '#CA8A04' : '#9CA3AF';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[12px] font-medium" style={{ color }}>
        {value}%
      </span>
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
      const matchQuery =
        !query ||
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

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <Sidebar />
      <div className="flex-1 ml-[60px] flex flex-col">
        <header className="h-14 bg-white border-b border-[#E5E7EB] flex items-center px-5 justify-between flex-shrink-0">
          <span className="text-[14px] font-semibold text-[#111827]">Поиск тендеров</span>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#534AB7] flex items-center justify-center text-white text-[11px] font-semibold">
              АИ
            </div>
            <span className="text-[13px] text-[#111827]">Администратор</span>
          </div>
        </header>

        <main className="flex-1 p-6">
          <h1 className="text-[18px] font-semibold text-[#111827] mb-1">Поиск тендеров</h1>
          <p className="text-[13px] text-[#6B7280] mb-5">Результаты с портала goszakup.gov.kz, отсортированы по релевантности</p>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-5">
            <div className="relative flex-1 min-w-[220px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Поиск по названию, номеру, заказчику…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-[13px] border border-[#E5E7EB] rounded-[6px] bg-white text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#534AB7]"
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-9 px-3 text-[13px] border border-[#E5E7EB] rounded-[6px] bg-white text-[#111827] focus:outline-none focus:border-[#534AB7]"
            >
              <option>Все</option>
              <option>Медоборудование</option>
              <option>IT-оборудование</option>
              <option>Строительство</option>
            </select>

            <input
              type="text"
              placeholder="Бюджет от"
              value={budgetFrom}
              onChange={(e) => setBudgetFrom(e.target.value)}
              className="h-9 w-[120px] px-3 text-[13px] border border-[#E5E7EB] rounded-[6px] bg-white text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#534AB7]"
            />
            <input
              type="text"
              placeholder="Бюджет до"
              value={budgetTo}
              onChange={(e) => setBudgetTo(e.target.value)}
              className="h-9 w-[120px] px-3 text-[13px] border border-[#E5E7EB] rounded-[6px] bg-white text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#534AB7]"
            />

            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="h-9 px-3 text-[13px] border border-[#E5E7EB] rounded-[6px] bg-white text-[#111827] focus:outline-none focus:border-[#534AB7]"
            >
              <option>Все регионы</option>
              <option>Астана</option>
              <option>Алматы</option>
              <option>Караганда</option>
              <option>Шымкент</option>
              <option>Актау</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white border border-[#E5E7EB] rounded-[8px] overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="text-left text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide px-4 py-3">Номер закупки</th>
                  <th className="text-left text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide px-4 py-3">Наименование</th>
                  <th className="text-left text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide px-4 py-3">Заказчик</th>
                  <th className="text-left text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide px-4 py-3">Бюджет</th>
                  <th className="text-left text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide px-4 py-3">Дедлайн</th>
                  <th className="text-left text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide px-4 py-3">Релевантность</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-[13px] text-[#9CA3AF] py-12">
                      Тендеры не найдены
                    </td>
                  </tr>
                )}
                {filtered.map((tender) => {
                  const highlight = tender.relevance > 70;
                  return (
                    <tr
                      key={tender.id}
                      className={`border-b border-[#E5E7EB] last:border-b-0 transition-colors hover:brightness-[0.97] ${
                        highlight ? 'bg-[#F0FDF4]' : 'bg-white'
                      }`}
                    >
                      <td className="px-4 py-3 text-[12px] font-mono text-[#534AB7] whitespace-nowrap">
                        {tender.id}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#111827] max-w-[300px]">
                        <span className="line-clamp-2">{tender.name}</span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#6B7280] max-w-[180px]">
                        <span className="line-clamp-2">{tender.customer}</span>
                      </td>
                      <td className="px-4 py-3 text-[13px] font-medium text-[#111827] whitespace-nowrap">
                        {tender.budget}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#6B7280] whitespace-nowrap">
                        {tender.deadline}
                      </td>
                      <td className="px-4 py-3">
                        <RelevanceBar value={tender.relevance} />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            router.push(
                              `/tender/new?name=${encodeURIComponent(tender.name)}`
                            )
                          }
                          className="h-7 px-3 text-[12px] font-medium text-[#534AB7] border border-[#534AB7] rounded-[5px] hover:bg-[#EEF0FB] transition-colors whitespace-nowrap"
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

          <div className="mt-3 text-[12px] text-[#9CA3AF]">
            Показано {filtered.length} из {TENDERS.length} тендеров
          </div>
        </main>
      </div>
    </div>
  );
}
