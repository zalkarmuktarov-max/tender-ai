'use client';

import { Upload } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { FileItem } from '@/components/FileItem';
import { mockKnowledgeFiles } from '@/data/mockTenderData';

export default function KnowledgePage() {
  const pdfs = mockKnowledgeFiles.filter((f) => f.type === 'pdf');
  const xlsxFiles = mockKnowledgeFiles.filter((f) => f.type === 'xlsx');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0B0F1A' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 210 }}>
        <main style={{ padding: '24px 28px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 500, color: '#F1F5F9', margin: '0 0 4px' }}>База знаний</h1>
              <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>Документы для автоматического заполнения форм</p>
            </div>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '9px 16px',
              background: 'transparent',
              color: '#94A3B8', fontSize: 13, fontWeight: 500,
              border: '1px solid #1E293B', borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = '#6366F1';
              (e.currentTarget as HTMLElement).style.color = '#A5B4FC';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = '#1E293B';
              (e.currentTarget as HTMLElement).style.color = '#94A3B8';
            }}
            >
              <Upload size={14} strokeWidth={1.5} />
              Загрузить документ
            </button>
          </div>

          {/* PDFs section */}
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 12, fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 10px' }}>
              Мануалы и документация
            </h2>
            <div style={{
              background: '#0F1629',
              border: '1px solid #1E293B',
              borderRadius: 10,
              overflow: 'hidden',
            }}>
              {pdfs.map((file, i) => (
                <div key={file.id} style={{ borderBottom: i < pdfs.length - 1 ? '1px solid rgba(30,41,59,0.6)' : 'none' }}>
                  <FileItem name={file.name} type={file.type} meta={file.meta} showStatus />
                </div>
              ))}
            </div>
          </div>

          {/* XLSX section */}
          <div>
            <h2 style={{ fontSize: 12, fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 10px' }}>
              Прайс-листы и 1С
            </h2>
            <div style={{
              background: '#0F1629',
              border: '1px solid #1E293B',
              borderRadius: 10,
              overflow: 'hidden',
            }}>
              {xlsxFiles.map((file, i) => (
                <div key={file.id} style={{ borderBottom: i < xlsxFiles.length - 1 ? '1px solid rgba(30,41,59,0.6)' : 'none' }}>
                  <FileItem name={file.name} type={file.type} meta={file.meta} showStatus />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
