'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { createClient } from '@/lib/supabase/client';
import type { KnowledgeDocument } from '@/types/database';
import { useRouter } from 'next/navigation';

const STATUS_COLORS: Record<KnowledgeDocument['status'], string> = {
  uploading: '#FBBF24',
  processing: '#60A5FA',
  processed: '#34D399',
  error: '#F87171',
};

const STATUS_LABELS: Record<KnowledgeDocument['status'], string> = {
  uploading: 'Загрузка',
  processing: 'Обработка',
  processed: 'Готов',
  error: 'Ошибка',
};

const CATEGORY_LABELS: Record<KnowledgeDocument['category'], string> = {
  manual: 'Мануал',
  price_list: 'Прайс-лист',
  certificate: 'Сертификат',
  contract: 'Договор',
  other: 'Другое',
};

function getFileIcon(type: KnowledgeDocument['file_type']) {
  if (type === 'xlsx' || type === 'csv') return FileSpreadsheet;
  return FileText;
}

interface Props {
  documents: KnowledgeDocument[];
  userId: string;
}

export function KnowledgeClient({ documents: initial, userId }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(initial);
  const [uploading, setUploading] = useState(false);

  const pdfs = documents.filter((d) => d.file_type === 'pdf' || d.file_type === 'docx');
  const xlsxFiles = documents.filter((d) => d.file_type === 'xlsx' || d.file_type === 'csv');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase() as KnowledgeDocument['file_type'];
    if (!['pdf', 'xlsx', 'docx', 'csv'].includes(ext)) return;

    setUploading(true);
    const supabase = createClient();
    const path = `${userId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(path, file, { upsert: false });

    if (uploadError) { setUploading(false); return; }

    const category: KnowledgeDocument['category'] =
      ext === 'xlsx' || ext === 'csv' ? 'price_list' : 'manual';

    const { data: doc, error: dbError } = await supabase
      .from('knowledge_documents')
      .insert({
        user_id: userId,
        file_name: file.name,
        file_path: path,
        file_type: ext,
        file_size: file.size,
        status: 'processing',
        category,
      })
      .select()
      .single();

    if (!dbError && doc) {
      setDocuments((prev) => [doc as KnowledgeDocument, ...prev]);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const renderFile = (doc: KnowledgeDocument) => {
    const Icon = getFileIcon(doc.file_type);
    const color = doc.file_type === 'xlsx' || doc.file_type === 'csv' ? '#34D399' : '#F87171';
    const bg = doc.file_type === 'xlsx' || doc.file_type === 'csv' ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)';
    const sizeMb = doc.file_size ? `${(doc.file_size / 1024 / 1024).toFixed(1)} МБ` : '';

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={15} color={color} strokeWidth={1.5} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#F1F5F9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {doc.file_name}
          </div>
          <div style={{ fontSize: 11, color: '#64748B' }}>
            {[sizeMb, CATEGORY_LABELS[doc.category]].filter(Boolean).join(' · ')}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {doc.status === 'processing' && (
            <RefreshCw size={12} color="#60A5FA" strokeWidth={1.5} style={{ animation: 'spin 1s linear infinite' }} />
          )}
          <span style={{ fontSize: 11, color: STATUS_COLORS[doc.status] }}>
            {STATUS_LABELS[doc.status]}
          </span>
        </div>
      </div>
    );
  };

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
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 16px', background: 'transparent',
                color: uploading ? '#475569' : '#94A3B8', fontSize: 13, fontWeight: 500,
                border: '1px solid #1E293B', borderRadius: 8,
                cursor: uploading ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!uploading) {
                  (e.currentTarget as HTMLElement).style.borderColor = '#6366F1';
                  (e.currentTarget as HTMLElement).style.color = '#A5B4FC';
                }
              }}
              onMouseLeave={(e) => {
                if (!uploading) {
                  (e.currentTarget as HTMLElement).style.borderColor = '#1E293B';
                  (e.currentTarget as HTMLElement).style.color = '#94A3B8';
                }
              }}
            >
              <Upload size={14} strokeWidth={1.5} />
              {uploading ? 'Загрузка...' : 'Загрузить документ'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.xlsx,.csv"
              onChange={handleUpload}
              style={{ display: 'none' }}
            />
          </div>

          {documents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: '#64748B', fontSize: 13 }}>
              Документов нет. Загрузите первый документ.
            </div>
          ) : (
            <>
              {/* PDFs / DOCX section */}
              {pdfs.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h2 style={{ fontSize: 12, fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 10px' }}>
                    Мануалы и документация
                  </h2>
                  <div style={{ background: '#0F1629', border: '1px solid #1E293B', borderRadius: 10, overflow: 'hidden' }}>
                    {pdfs.map((doc, i) => (
                      <div key={doc.id} style={{ borderBottom: i < pdfs.length - 1 ? '1px solid rgba(30,41,59,0.6)' : 'none' }}>
                        {renderFile(doc)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* XLSX / CSV section */}
              {xlsxFiles.length > 0 && (
                <div>
                  <h2 style={{ fontSize: 12, fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 10px' }}>
                    Прайс-листы и 1С
                  </h2>
                  <div style={{ background: '#0F1629', border: '1px solid #1E293B', borderRadius: 10, overflow: 'hidden' }}>
                    {xlsxFiles.map((doc, i) => (
                      <div key={doc.id} style={{ borderBottom: i < xlsxFiles.length - 1 ? '1px solid rgba(30,41,59,0.6)' : 'none' }}>
                        {renderFile(doc)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
