'use client';

import { useState, useRef } from 'react';
import { FileText, Database, Download, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { FieldStatusBadge } from '@/components/StatusBadge';
import { mockFormFields } from '@/data/mockTenderData';
import type { FormField } from '@/types/tender';

const statusDot: Record<FormField['status'], string> = {
  exact: '#34D399',
  inferred: '#FBBF24',
  not_found: '#F87171',
};

const rowBg: Record<FormField['status'], string> = {
  exact: 'transparent',
  inferred: 'rgba(245,158,11,0.04)',
  not_found: 'rgba(239,68,68,0.04)',
};

function renderSourceText(text: string, highlight?: string) {
  if (!highlight || !text.includes(highlight)) {
    const parts = text.split(/\*\*(.+?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i} style={{ color: '#F1F5F9' }}>{part}</strong> : part
    );
  }
  const idx = text.indexOf(highlight);
  const before = text.slice(0, idx);
  const after = text.slice(idx + highlight.length);
  const renderParts = (str: string) => {
    const parts = str.split(/\*\*(.+?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i} style={{ color: '#F1F5F9' }}>{part}</strong> : part
    );
  };
  return (
    <>
      {renderParts(before)}
      <mark style={{ background: 'rgba(245,158,11,0.2)', color: '#CBD5E1', padding: '1px 4px', borderRadius: 3 }}>{highlight}</mark>
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
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const tenderLabel = tenderId === 'demo' || tenderId === '1'
    ? 'KZ-2026-МЗ-44182'
    : `#${tenderId}`;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0B0F1A' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 210, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <header style={{
          height: 56,
          background: '#0F1629',
          borderBottom: '1px solid #1E293B',
          display: 'flex', alignItems: 'center',
          padding: '0 18px',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#F1F5F9' }}>
              {tenderLabel} — УЗИ-аппарат
            </div>
            <div style={{ fontSize: 11, color: '#64748B' }}>ГКП «Городская поликлиника №4» г. Астана</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: 'rgba(16,185,129,0.15)', color: '#34D399' }}>
                <CheckCircle size={11} />{exactCount} ok
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: 'rgba(245,158,11,0.15)', color: '#FBBF24' }}>
                <AlertTriangle size={11} />{inferredCount} проверить
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: 'rgba(239,68,68,0.15)', color: '#F87171' }}>
                <XCircle size={11} />{notFoundCount} не найдено
              </span>
            </div>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 6,
              height: 34, padding: '0 14px',
              background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
              color: '#ffffff', fontSize: 12, fontWeight: 500,
              border: 'none', borderRadius: 8,
              cursor: 'pointer',
              boxShadow: '0 0 12px rgba(99,102,241,0.2)',
            }}>
              <Download size={13} strokeWidth={1.5} />
              Экспорт .xlsx
            </button>
          </div>
        </header>

        {/* Three panels */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', overflow: 'hidden' }}>

          {/* Left: ТЗ */}
          <div style={{ borderRight: '1px solid #1E293B', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderBottom: '1px solid #1E293B', background: 'rgba(15,22,41,0.8)', flexShrink: 0 }}>
              <FileText size={13} color="#64748B" strokeWidth={1.5} />
              <span style={{ fontSize: 10, fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ТЗ заказчика</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
              {mockFormFields.map((field) => (
                <div
                  key={field.id}
                  ref={(el) => { tzRefs.current[field.id] = el; }}
                  onClick={() => handleSelectRow(field.id)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 6,
                    marginBottom: 4,
                    cursor: 'pointer',
                    fontSize: 12, lineHeight: 1.5,
                    transition: 'all 0.15s',
                    background: selectedId === field.id ? 'rgba(99,102,241,0.15)' : 'transparent',
                    borderLeft: selectedId === field.id ? '3px solid #6366F1' : '3px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedId !== field.id) (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    if (selectedId !== field.id) (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <span style={{ fontWeight: 500, color: '#A5B4FC', marginRight: 6 }}>{field.id + 1}.</span>
                  <span style={{ color: '#CBD5E1' }}>{field.tz}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Center: Форма 2 */}
          <div style={{ borderRight: '1px solid #1E293B', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderBottom: '1px solid #1E293B', background: 'rgba(15,22,41,0.8)', flexShrink: 0 }}>
              <FileText size={13} color="#64748B" strokeWidth={1.5} />
              <span style={{ fontSize: 10, fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Форма 2</span>
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr style={{ background: '#0F1629' }}>
                    {['Параметр', 'Значение', 'Статус', 'Ограничение'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 500, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '9px 12px', borderBottom: '1px solid #1E293B' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockFormFields.map((field) => (
                    <tr
                      key={field.id}
                      onClick={() => handleSelectRow(field.id)}
                      style={{
                        cursor: 'pointer',
                        background: selectedId === field.id ? 'rgba(99,102,241,0.15)' : rowBg[field.status],
                        borderBottom: '1px solid rgba(30,41,59,0.6)',
                        transition: 'background 0.15s',
                        outline: selectedId === field.id ? '1px solid rgba(99,102,241,0.4)' : 'none',
                        outlineOffset: -1,
                      }}
                      onMouseEnter={(e) => {
                        if (selectedId !== field.id) (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.04)';
                      }}
                      onMouseLeave={(e) => {
                        if (selectedId !== field.id) (e.currentTarget as HTMLElement).style.background = rowBg[field.status];
                      }}
                    >
                      <td style={{ padding: '9px 12px', fontWeight: 500, color: '#CBD5E1' }}>{field.param}</td>
                      <td style={{ padding: '9px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: statusDot[field.status] }} />
                          <span style={{ color: field.status === 'not_found' ? '#475569' : '#CBD5E1', fontStyle: field.status === 'not_found' ? 'italic' : 'normal' }}>
                            {field.value}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '9px 12px' }}><FieldStatusBadge status={field.status} /></td>
                      <td style={{ padding: '9px 12px', color: '#64748B' }}>{field.constraint}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Источник */}
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderBottom: '1px solid #1E293B', background: 'rgba(15,22,41,0.8)', flexShrink: 0 }}>
              <Database size={13} color="#64748B" strokeWidth={1.5} />
              <span style={{ fontSize: 10, fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Источник данных</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
              {selectedField === null ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 12, color: '#475569', textAlign: 'center' }}>
                  Выберите строку в таблице
                </div>
              ) : selectedField.status === 'not_found' ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, textAlign: 'center', padding: '0 16px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <XCircle size={20} color="#F87171" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#CBD5E1', marginBottom: 4 }}>Данные не найдены</div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>Данные не найдены в базе. Заполните вручную.</div>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
                    Извлечённый фрагмент
                  </div>
                  <div style={{
                    background: '#0B0F1A',
                    border: '1px solid #1E293B',
                    borderLeft: '3px solid #F59E0B',
                    borderRadius: 8, padding: 12,
                    fontSize: 12, color: '#CBD5E1', lineHeight: 1.6,
                    marginBottom: 12,
                  }}>
                    {renderSourceText(selectedField.source, selectedField.highlight)}
                  </div>
                  {selectedField.sourceFile && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#475569' }}>
                      <div style={{ width: 22, height: 22, background: 'rgba(239,68,68,0.15)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText size={12} color="#F87171" strokeWidth={1.5} />
                      </div>
                      <span style={{ wordBreak: 'break-all' }}>{selectedField.sourceFile}</span>
                    </div>
                  )}
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #1E293B' }}>
                    <div style={{ fontSize: 10, fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                      Требование ТЗ
                    </div>
                    <div style={{ fontSize: 12, color: '#CBD5E1', lineHeight: 1.6 }}>
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
