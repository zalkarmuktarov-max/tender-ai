'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';

const steps = [
  { id: 0, label: 'Парсинг ТЗ', sub: 'Извлечено 16 требований', status: 'done' },
  { id: 1, label: 'Поиск по базе знаний', sub: 'Найдено 3 подходящих товара', status: 'done' },
  { id: 2, label: 'Генерация Формы 2', sub: 'Заполняется...', status: 'active' },
  { id: 3, label: 'Валидация', sub: 'Ожидание', status: 'waiting' },
];

export default function ProcessingPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/tender/demo');
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-[60px] flex flex-col">
        <header className="h-14 bg-white border-b border-[#E5E7EB] flex items-center px-5 justify-between flex-shrink-0">
          <span className="text-[14px] font-semibold text-[#111827]">Обработка тендера</span>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#534AB7] flex items-center justify-center text-white text-[11px] font-semibold">
              АИ
            </div>
            <span className="text-[13px] text-[#111827]">Администратор</span>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center">
          <div className="w-[480px]">
            <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-8">
              <h1 className="text-[16px] font-semibold text-[#111827] mb-1">
                Tender #2024-МЗ-4471
              </h1>
              <p className="text-[13px] text-[#6B7280] mb-8">УЗИ-аппарат — обработка документов</p>

              <div className="relative">
                <div className="absolute left-[15px] top-0 bottom-0 w-px bg-[#E5E7EB]" />
                <div className="flex flex-col gap-0">
                  {steps.map((step, i) => (
                    <div key={step.id} className="flex items-start gap-4 pb-7 last:pb-0 relative">
                      <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 ${
                        step.status === 'done'
                          ? 'bg-[#639922] border-[#639922]'
                          : step.status === 'active'
                          ? 'bg-[#534AB7] border-[#534AB7]'
                          : 'bg-white border-[#E5E7EB]'
                      }`}>
                        {step.status === 'done' && <Check size={14} className="text-white" strokeWidth={2.5} />}
                        {step.status === 'active' && <Loader2 size={14} className="text-white animate-spin" />}
                        {step.status === 'waiting' && <div className="w-2 h-2 rounded-full bg-[#D1D5DB]" />}
                      </div>
                      <div className="pt-1">
                        <div className={`text-[13px] font-medium ${
                          step.status === 'waiting' ? 'text-[#9CA3AF]' : 'text-[#111827]'
                        }`}>
                          {step.label}
                        </div>
                        <div className={`text-[12px] mt-0.5 ${
                          step.status === 'active' ? 'text-[#534AB7]' :
                          step.status === 'done' ? 'text-[#639922]' : 'text-[#9CA3AF]'
                        }`}>
                          {step.sub}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-center text-[12px] text-[#9CA3AF] mt-4">Автоматический переход через 3 секунды...</p>
          </div>
        </main>
      </div>
    </div>
  );
}
