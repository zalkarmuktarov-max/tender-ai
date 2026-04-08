'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { createClient } from '@/lib/supabase/client';
import type { KnowledgeDocument } from '@/types/database';

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
  return type === 'xlsx' || type === 'csv' ? FileSpreadsheet : FileText;
}

interface Props {
  documents: KnowledgeDocument[];
  userId: string;
}

export function KnowledgeClient({ documents: initial, userId }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(initial);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const pdfs = documents.filter((d) => d.file_type === 'pdf' || d.file_type === 'docx');
  const xlsxFiles = documents.filter((d) => d.file_type === 'xlsx' || d.file_type === 'csv');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['pdf', 'xlsx', 'docx', 'csv'].includes(ext)) {
      setUploadError('Неподдерживаемый формат файла');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) { setUploadError('Ошибка авторизации'); setUploading(false); return; }

      const fileType = ext as KnowledgeDocument['file_type'];
      const category: KnowledgeDocument['category'] = fileType === 'xlsx' || fileType === 'csv' ? 'price_list' : 'manual';
      const filePath = `${user.id}/${Date.now()}-${file.name}`;

      // Upload to Storage
      const { error: storageError } = await supabase.storage.from('documents').upload(filePath, file, { upsert: false });
      if (storageError) console.error('Storage error:', storageError.message);

      // Create DB record
      const { data: doc, error: dbError } = await supabase
        .from('knowledge_documents')
        .insert({ user_id: user.id, file_name: file.name, file_path: filePath, file_type: fileType, file_size: file.size, status: 'uploading', category })
        .select().single();

      if (dbError || !doc) {
        setUploadError(`Ошибка сохранения: ${dbError?.message}`);
        setUploading(false);
        return;
      }

      // Add to list with 'processing' status
      const processingDoc = { ...doc, status: 'processing' as const } as KnowledgeDocument;
      setDocuments((prev) => [processingDoc, ...prev]);

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);

      // Trigger n8n webhook
      console.log('Triggering knowledge webhook with:', { document_id: doc.id, file_url: publicUrl, user_id: user.id });
      try {
        const triggerRes = await fetch('/api/knowledge/trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ document_id: doc.id, file_url: publicUrl, user_id: user.id }),
        });
        const triggerJson = await triggerRes.json();
        console.log('Trigger response:', triggerRes.status, triggerJson);
      } catch (e) {
        console.error('knowledge trigger error:', e);
      }

      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Poll Supabase every 3s until status changes from 'processing'
      const POLL_TIMEOUT = 5 * 60 * 1000;
      const pollStart = Date.now();
      const pollStatus = async () => {
        if (Date.now() - pollStart > POLL_TIMEOUT) {
          setDocuments((prev) => prev.map((d) => d.id === doc.id ? { ...d, status: 'error' as const } : d));
          setUploadError('Превышено время обработки (5 минут).');
          return;
        }
        const { data: updated } = await supabase
          .from('knowledge_documents')
          .select('status, items_count')
          .eq('id', doc.id)
          .single();

        if (!updated || updated.status === 'processing' || updated.status === 'uploading') {
          setTimeout(pollStatus, 3000);
          return;
        }
        setDocuments((prev) => prev.map((d) =>
          d.id === doc.id
            ? { ...d, status: updated.status as KnowledgeDocument['status'], items_count: updated.items_count ?? 0 }
            : d
        ));
        if (updated.status === 'error') {
          setUploadError('Ошибка обработки документа.');
        }
      };
      setTimeout(pollStatus, 3000);
      return;

    } catch (err) {
      console.error('Upload error:', err);
      setUploadError('Неизвестная ошибка. Проверьте консоль.');
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const renderFile = (doc: KnowledgeDocument) => {
    const Icon = getFileIcon(doc.file_type);
    const isXlsx = doc.file_type === 'xlsx' || doc.file_type === 'csv';
    const color = isXlsx ? '#34D399' : '#F87171';
    const bg = isXlsx ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)';
    const sizeMb = doc.file_size ? `${(doc.file_size / 1024 / 1024).toFixed(1)} МБ` : '';
    const meta = [sizeMb, doc.items_count ? `${doc.items_count} параметров` : '', CATEGORY_LABELS[doc.category]].filter(Boolean).join(' · ');

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={15} color={color} strokeWidth={1.5} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#F1F5F9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {doc.file_name}
          </div>
          <div style={{ fontSize: 11, color: '#64748B' }}>{meta}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {(doc.status === 'processing' || doc.status === 'uploading') && (
            <RefreshCw size={12} color="#60A5FA" strokeWidth={1.5} style={{ animation: 'spin 1s linear infinite' }} />
          )}
          <span style={{ fontSize: 11, color: STATUS_COLORS[doc.status] }}>{STATUS_LABELS[doc.status]}</span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0B0F1A' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 210 }}>
        <main style={{ padding: '24px 28px' }}>
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
              onMouseEnter={(e) => { if (!uploading) { (e.currentTarget as HTMLElement).style.borderColor = '#6366F1'; (e.currentTarget as HTMLElement).style.color = '#A5B4FC'; } }}
              onMouseLeave={(e) => { if (!uploading) { (e.currentTarget as HTMLElement).style.borderColor = '#1E293B'; (e.currentTarget as HTMLElement).style.color = '#94A3B8'; } }}
            >
              <Upload size={14} strokeWidth={1.5} />
              {uploading ? 'Обработка...' : 'Загрузить документ'}
            </button>
            <input ref={fileInputRef} type="file" accept=".pdf,.docx,.xlsx,.csv" onChange={handleUpload} style={{ display: 'none' }} />
          </div>

          {uploadError && (
            <div style={{ marginBottom: 16, fontSize: 12, color: '#F87171', padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }}>
              {uploadError}
            </div>
          )}

          {documents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: '#64748B', fontSize: 13 }}>
              Документов нет. Загрузите первый документ — Claude AI извлечёт все параметры автоматически.
            </div>
          ) : (
            <>
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
