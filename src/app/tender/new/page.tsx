'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, X, ArrowRight } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { createClient } from '@/lib/supabase/client';

interface AttachedFile {
  id: string;
  name: string;
  size: string;
  raw: File;
}

export default function TenderNewPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    addFiles(Array.from(e.dataTransfer.files));
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
  };

  const addFiles = (newFiles: File[]) => {
    const mapped: AttachedFile[] = newFiles.map((f) => ({
      id: `${Date.now()}-${Math.random()}`,
      name: f.name,
      size: `${(f.size / 1024 / 1024).toFixed(1)} МБ`,
      raw: f,
    }));
    setFiles((prev) => [...prev, ...mapped]);
  };

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const handleSubmit = async () => {
    if (files.length === 0) return;
    setSubmitting(true);
    setSubmitError('');

    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push('/login');
        return;
      }

      // Upload files to Storage (non-blocking — log errors but continue)
      for (const file of files) {
        const path = `${user.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(path, file.raw, { upsert: false });
        if (uploadError) {
          console.error('Storage upload error:', uploadError.message);
          // Continue — tender record creation is more important
        }
      }

      // Create tender record
      const number = `ТЗ-${Date.now().toString().slice(-6)}`;
      const name = files[0].name.replace(/\.[^.]+$/, '');

      const { error: insertError } = await supabase
        .from('tenders')
        .insert({
          user_id: user.id,
          number,
          name,
          customer: 'Не указан',
          status: 'processing',
        });

      if (insertError) {
        console.error('Tender insert error:', insertError.message);
        setSubmitError(`Ошибка создания тендера: ${insertError.message}`);
        setSubmitting(false);
        return;
      }

      router.push('/tender/processing');
    } catch (e) {
      console.error('Unexpected error:', e);
      setSubmitError('Неизвестная ошибка. Проверьте консоль.');
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0B0F1A' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 210, display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1, padding: '24px 28px' }}>
          <div style={{ maxWidth: 600 }}>
            <h1 style={{ fontSize: 22, fontWeight: 500, color: '#F1F5F9', margin: '0 0 6px' }}>Новый тендер</h1>
            <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 28px' }}>
              Загрузите техническое задание для обработки
            </p>

            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                height: 180, border: `2px dashed ${isDragOver ? '#6366F1' : '#1E293B'}`,
                borderRadius: 12,
                background: isDragOver ? 'rgba(99,102,241,0.04)' : '#0F1629',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.15s ease', gap: 10,
              }}
            >
              <input
                ref={fileInputRef}
                type="file" multiple accept=".pdf,.docx,.zip"
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
              <Upload size={36} color="#94A3B8" strokeWidth={1.5} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#CBD5E1', marginBottom: 4 }}>
                  Перетащите файлы сюда или нажмите для выбора
                </div>
                <div style={{ fontSize: 12, color: '#64748B' }}>PDF, DOCX, ZIP — до 50 МБ</div>
              </div>
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div style={{ marginTop: 12, background: '#0F1629', border: '1px solid #1E293B', borderRadius: 10, overflow: 'hidden' }}>
                {files.map((file, i) => (
                  <div key={file.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px',
                    borderBottom: i < files.length - 1 ? '1px solid rgba(30,41,59,0.6)' : 'none',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: 'rgba(239,68,68,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <FileText size={15} color="#F87171" strokeWidth={1.5} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#F1F5F9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>{file.size}</div>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4, transition: 'color 0.15s' }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#F87171')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#475569')}
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {submitError && (
              <div style={{ marginTop: 12, fontSize: 12, color: '#F87171', padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }}>
                {submitError}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={files.length === 0 || submitting}
              style={{
                marginTop: 20, width: '100%', height: 46,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: (files.length === 0 || submitting) ? '#1E293B' : 'linear-gradient(135deg, #6366F1, #7C3AED)',
                color: (files.length === 0 || submitting) ? '#475569' : '#ffffff',
                fontSize: 14, fontWeight: 500, border: 'none', borderRadius: 10,
                cursor: (files.length === 0 || submitting) ? 'not-allowed' : 'pointer',
                boxShadow: (files.length === 0 || submitting) ? 'none' : '0 0 20px rgba(99,102,241,0.25)',
                transition: 'all 0.15s',
              }}
            >
              {submitting ? 'Загрузка и создание...' : 'Обработать тендер'}
              {!submitting && <ArrowRight size={16} strokeWidth={1.5} />}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
