'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, X, ArrowRight } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';

interface AttachedFile {
  id: number;
  name: string;
  size: string;
}

export default function TenderNewPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<AttachedFile[]>([
    { id: 1, name: 'ТЗ_УЗИ_аппарат_Поликлиника4_Астана.pdf', size: '2.4 МБ' },
  ]);

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
    const mapped = newFiles.map((f, i) => ({
      id: Date.now() + i,
      name: f.name,
      size: `${(f.size / 1024 / 1024).toFixed(1)} МБ`,
    }));
    setFiles((prev) => [...prev, ...mapped]);
  };
  const removeFile = (id: number) => setFiles((prev) => prev.filter((f) => f.id !== id));

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
                height: 180,
                border: `2px dashed ${isDragOver ? '#6366F1' : '#1E293B'}`,
                borderRadius: 12,
                background: isDragOver ? 'rgba(99,102,241,0.04)' : '#0F1629',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                gap: 10,
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
              <div style={{
                marginTop: 12,
                background: '#0F1629',
                border: '1px solid #1E293B',
                borderRadius: 10,
                overflow: 'hidden',
              }}>
                {files.map((file) => (
                  <div key={file.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px',
                    borderBottom: '1px solid rgba(30,41,59,0.6)',
                  }}
                  className="last:border-b-0"
                  >
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

            <button
              onClick={() => router.push('/tender/processing')}
              disabled={files.length === 0}
              style={{
                marginTop: 20,
                width: '100%', height: 46,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: files.length === 0 ? '#1E293B' : 'linear-gradient(135deg, #6366F1, #7C3AED)',
                color: files.length === 0 ? '#475569' : '#ffffff',
                fontSize: 14, fontWeight: 500,
                border: 'none', borderRadius: 10,
                cursor: files.length === 0 ? 'not-allowed' : 'pointer',
                boxShadow: files.length === 0 ? 'none' : '0 0 20px rgba(99,102,241,0.25)',
                transition: 'all 0.15s',
              }}
            >
              Обработать тендер
              <ArrowRight size={16} strokeWidth={1.5} />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
