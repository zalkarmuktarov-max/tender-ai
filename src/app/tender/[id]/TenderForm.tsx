'use client';

import { useState, useRef, useEffect } from 'react';
import { FileText, Database, Download, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { FieldStatusBadge } from '@/components/StatusBadge';
import { mockFormFields } from '@/data/mockTenderData';
import type { FormField } from '@/types/tender';

const statusDot: Record<FormField['status'], string> = {
  exact: 'bg-[#639922]',
  inferred: 'bg-[#EF9F27]',
  not_found: 'bg-[#E24B4A]',
};

const rowBg: Record<FormField['status'], string> = {
  exact: '',
  inferred: 'bg-[#FFFBF2]',
  not_found: 'bg-[#FEF6F6]',
};

function renderSourceText(text: string, highlight?: string) {
  if (!highlight || !text.includes(highlight)) {
    const parts = text.split(/\*\*(.+?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    );
  }

  const idx = text.indexOf(highlight);
  const before = text.slice(0, idx);
  const after = text.slice(idx + highlight.length);

  const renderParts = (str: string) => {
    const parts = str.split(/\*\*(.+?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    );
  };

  return (
    <>
      {renderParts(before)}
      <mark className="bg-[#FEF3C7] text-[#111827] px-0.5 rounded">{highlight}</mark>
      {renderParts(after)}
    </>
  );
}

interface TenderFormProps {
  tenderId: string;
}

export function TenderForm({ tenderId }: TenderFormProps) {
  const [selectedId, setSelectedId] = useState<number>(2);
  const tzRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const exactCount = mockFormFields.filter((f) => f.status === 'exact').length;
  const inferredCount = mockFormFields.filter((f) => f.status === 'inferred').length;
  const notFoundCount = mockFormFields.filter((f) => f.status === 'not_found').length;

  const selectedField = mockFormFields.find((f) => f.id === selectedId) ?? null;

  const handleSelectRow = (id: number) => {
    setSelectedId(id);
    const el = tzRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const isTenderNumeric = !isNaN(Number(tenderId));
  const tenderLabel = isTenderNumeric && tenderId === '1'
    ? '#2024-МЗ-4471'
    : tenderId === 'demo'
    ? '#2024-МЗ-4471'
    : `#${tenderId}`;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-[60px] flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-[#E5E7EB] flex items-center px-5 justify-between flex-shrink-0">
          <div>
            <div className="text-[14px] font-semibold text-[#111827]">
              Tender {tenderLabel} — УЗИ-аппарат
            </div>
            <div className="text-[11px] text-[#6B7280]">ГБУЗ ГКБ им. Боткина</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[20px] text-[11px] font-medium bg-[#F0F7E6] text-[#639922] border border-[#C6E397]">
                <CheckCircle size={11} />
                {exactCount} ok
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[20px] text-[11px] font-medium bg-[#FEF6E7] text-[#B07000] border border-[#F7D68A]">
                <AlertTriangle size={11} />
                {inferredCount} проверить
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[20px] text-[11px] font-medium bg-[#FDEAEA] text-[#C0392B] border border-[#F5B0B0]">
                <XCircle size={11} />
                {notFoundCount} не найдено
              </span>
            </div>
            <button className="flex items-center gap-1.5 h-8 px-3 bg-[#534AB7] text-white text-[12px] font-medium rounded-[6px] hover:bg-[#4840A3] transition-colors">
              <Download size={13} />
              Экспорт .xlsx
            </button>
          </div>
        </header>

        {/* Three panels */}
        <div className="flex-1 grid overflow-hidden" style={{ gridTemplateColumns: '1fr 1.5fr 1fr' }}>

          {/* Left panel — ТЗ */}
          <div className="border-r border-[#E5E7EB] flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E5E7EB] bg-white flex-shrink-0">
              <FileText size={14} className="text-[#6B7280]" />
              <span className="text-[12px] font-semibold text-[#111827]">ТЗ заказчика</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {mockFormFields.map((field) => (
                <div
                  key={field.id}
                  ref={(el) => { tzRefs.current[field.id] = el; }}
                  onClick={() => handleSelectRow(field.id)}
                  className={`p-3 rounded-[6px] mb-1.5 cursor-pointer transition-colors text-[12px] leading-relaxed ${
                    selectedId === field.id
                      ? 'border border-[#534AB7] bg-[#EEF0FB]'
                      : 'border border-transparent hover:bg-[#F9FAFB]'
                  }`}
                >
                  <span className="font-medium text-[#534AB7] mr-1.5">{field.id + 1}.</span>
                  <span className="text-[#374151]">{field.tz}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Center panel — Форма 2 */}
          <div className="border-r border-[#E5E7EB] flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E5E7EB] bg-white flex-shrink-0">
              <FileText size={14} className="text-[#6B7280]" />
              <span className="text-[12px] font-semibold text-[#111827]">Форма 2</span>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-[12px]">
                <thead className="sticky top-0 bg-[#F9FAFB] z-10">
                  <tr className="border-b border-[#E5E7EB]">
                    <th className="text-left font-medium text-[#6B7280] px-3 py-2.5 w-[130px]">Параметр</th>
                    <th className="text-left font-medium text-[#6B7280] px-3 py-2.5">Значение</th>
                    <th className="text-left font-medium text-[#6B7280] px-3 py-2.5 w-[100px]">Статус</th>
                    <th className="text-left font-medium text-[#6B7280] px-3 py-2.5 w-[100px]">Ограничение</th>
                  </tr>
                </thead>
                <tbody>
                  {mockFormFields.map((field) => (
                    <tr
                      key={field.id}
                      onClick={() => handleSelectRow(field.id)}
                      className={`border-b border-[#E5E7EB] cursor-pointer transition-colors ${rowBg[field.status]} ${
                        selectedId === field.id ? 'ring-1 ring-inset ring-[#534AB7]' : 'hover:bg-[#F9FAFB]'
                      }`}
                    >
                      <td className="px-3 py-2.5 font-medium text-[#111827]">{field.param}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[field.status]}`} />
                          <span className={field.status === 'not_found' ? 'text-[#9CA3AF] italic' : 'text-[#111827]'}>
                            {field.value}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <FieldStatusBadge status={field.status} />
                      </td>
                      <td className="px-3 py-2.5 text-[#6B7280]">{field.constraint}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right panel — Источник */}
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E5E7EB] bg-white flex-shrink-0">
              <Database size={14} className="text-[#6B7280]" />
              <span className="text-[12px] font-semibold text-[#111827]">Источник данных</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {selectedField === null ? (
                <div className="flex items-center justify-center h-full text-[12px] text-[#9CA3AF] text-center">
                  Выберите строку в таблице
                </div>
              ) : selectedField.status === 'not_found' ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
                  <div className="w-10 h-10 rounded-full bg-[#FDEAEA] flex items-center justify-center">
                    <XCircle size={20} className="text-[#E24B4A]" />
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-[#111827] mb-1">Данные не найдены</div>
                    <div className="text-[12px] text-[#6B7280]">
                      Данные не найдены в базе. Заполните вручную.
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide mb-3">
                    Извлечённый фрагмент
                  </div>
                  <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] p-3 text-[12px] text-[#374151] leading-relaxed mb-3">
                    {renderSourceText(selectedField.source, selectedField.highlight)}
                  </div>
                  {selectedField.sourceFile && (
                    <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
                      <div className="w-6 h-6 bg-[#FDEAEA] rounded-[4px] flex items-center justify-center flex-shrink-0">
                        <FileText size={12} className="text-[#E24B4A]" />
                      </div>
                      <span className="break-all">{selectedField.sourceFile}</span>
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                    <div className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
                      Требование ТЗ
                    </div>
                    <div className="text-[12px] text-[#374151] leading-relaxed">
                      {selectedField.tz}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
