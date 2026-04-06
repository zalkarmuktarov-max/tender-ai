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
    { id: 1, name: 'ТЗ_УЗИ_аппарат_ГКБ_Боткина.pdf', size: '2.4 МБ' },
  ]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
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
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-[60px] flex flex-col">
        <header className="h-14 bg-white border-b border-[#E5E7EB] flex items-center px-5 justify-between flex-shrink-0">
          <span className="text-[14px] font-semibold text-[#111827]">Новый тендер</span>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#534AB7] flex items-center justify-center text-white text-[11px] font-semibold">
              АИ
            </div>
            <span className="text-[13px] text-[#111827]">Администратор</span>
          </div>
        </header>

        <main className="flex-1 p-6 max-w-[700px]">
          <h1 className="text-[18px] font-semibold text-[#111827] mb-1">Загрузка документов ТЗ</h1>
          <p className="text-[13px] text-[#6B7280] mb-6">Прикрепите файлы технического задания для автоматической обработки</p>

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-[8px] p-10 text-center cursor-pointer transition-colors ${
              isDragOver
                ? 'border-[#534AB7] bg-[#EEF0FB]'
                : 'border-[#E5E7EB] bg-white hover:border-[#534AB7] hover:bg-[#F9FAFB]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.zip"
              onChange={handleFileInput}
              className="hidden"
            />
            <div className="w-10 h-10 bg-[#EEF0FB] rounded-full flex items-center justify-center mx-auto mb-3">
              <Upload size={20} className="text-[#534AB7]" />
            </div>
            <div className="text-[14px] font-medium text-[#111827] mb-1">
              Перетащите файлы сюда или нажмите для выбора
            </div>
            <div className="text-[12px] text-[#6B7280]">PDF, DOCX, ZIP — до 50 МБ</div>
          </div>

          {files.length > 0 && (
            <div className="mt-4 bg-white border border-[#E5E7EB] rounded-[8px] overflow-hidden">
              {files.map((file) => (
                <div key={file.id} className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E7EB] last:border-b-0">
                  <div className="w-8 h-8 bg-[#FDEAEA] rounded-[6px] flex items-center justify-center flex-shrink-0">
                    <FileText size={15} className="text-[#E24B4A]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-[#111827] truncate">{file.name}</div>
                    <div className="text-[11px] text-[#6B7280]">{file.size}</div>
                  </div>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-[#9CA3AF] hover:text-[#E24B4A] transition-colors"
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
            className="mt-6 flex items-center gap-2 h-9 px-5 bg-[#534AB7] text-white text-[13px] font-medium rounded-[6px] hover:bg-[#4840A3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Обработать тендер
            <ArrowRight size={15} />
          </button>
        </main>
      </div>
    </div>
  );
}
