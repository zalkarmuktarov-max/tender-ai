'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { MetricCard } from '@/components/MetricCard';
import { TenderStatusBadge } from '@/components/StatusBadge';
import { mockTenders } from '@/data/mockTenderData';

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-[60px] flex flex-col">
        <header className="h-14 bg-white border-b border-[#E5E7EB] flex items-center px-5 justify-between flex-shrink-0">
          <span className="text-[14px] font-semibold text-[#111827]">Дашборд</span>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#534AB7] flex items-center justify-center text-white text-[11px] font-semibold">
              АИ
            </div>
            <span className="text-[13px] text-[#111827]">Администратор</span>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="flex gap-4 mb-6">
            <MetricCard label="Обработано тендеров" value="24" />
            <MetricCard label="Средний % автозаполнения" value="87%" />
            <MetricCard label="Сэкономлено часов" value="142" />
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-[8px]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
              <h2 className="text-[14px] font-semibold text-[#111827]">Тендеры</h2>
              <button
                onClick={() => router.push('/tender/new')}
                className="flex items-center gap-1.5 h-8 px-3 bg-[#534AB7] text-white text-[12px] font-medium rounded-[6px] hover:bg-[#4840A3] transition-colors"
              >
                <Plus size={14} />
                Новый тендер
              </button>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wide px-5 py-3">Номер</th>
                  <th className="text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wide px-5 py-3">Заказчик</th>
                  <th className="text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wide px-5 py-3">Дата</th>
                  <th className="text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wide px-5 py-3">Статус</th>
                </tr>
              </thead>
              <tbody>
                {mockTenders.map((tender) => (
                  <tr
                    key={tender.id}
                    onClick={() => router.push(`/tender/${tender.id}`)}
                    className="border-b border-[#E5E7EB] last:border-b-0 hover:bg-[#F9FAFB] cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3 text-[13px] font-medium text-[#534AB7]">{tender.number}</td>
                    <td className="px-5 py-3 text-[13px] text-[#111827]">{tender.customer}</td>
                    <td className="px-5 py-3 text-[13px] text-[#6B7280]">{tender.date}</td>
                    <td className="px-5 py-3">
                      <TenderStatusBadge status={tender.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
