'use client';

import { Upload } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { FileItem } from '@/components/FileItem';
import { mockKnowledgeFiles } from '@/data/mockTenderData';

export default function KnowledgePage() {
  const pdfs = mockKnowledgeFiles.filter((f) => f.type === 'pdf');
  const xlsxFiles = mockKnowledgeFiles.filter((f) => f.type === 'xlsx');

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-[60px] flex flex-col">
        <header className="h-14 bg-white border-b border-[#E5E7EB] flex items-center px-5 justify-between flex-shrink-0">
          <span className="text-[14px] font-semibold text-[#111827]">База знаний</span>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 h-8 px-3 bg-[#534AB7] text-white text-[12px] font-medium rounded-[6px] hover:bg-[#4840A3] transition-colors">
              <Upload size={13} />
              Загрузить новый документ
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#534AB7] flex items-center justify-center text-white text-[11px] font-semibold">
                АИ
              </div>
              <span className="text-[13px] text-[#111827]">Администратор</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 max-w-[800px]">
          <div className="mb-6">
            <h2 className="text-[14px] font-semibold text-[#111827] mb-3">Мануалы</h2>
            <div className="bg-white border border-[#E5E7EB] rounded-[8px] px-4">
              {pdfs.map((file) => (
                <FileItem
                  key={file.id}
                  name={file.name}
                  type={file.type}
                  meta={file.meta}
                  showStatus
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-[14px] font-semibold text-[#111827] mb-3">Прайс-листы и 1С</h2>
            <div className="bg-white border border-[#E5E7EB] rounded-[8px] px-4">
              {xlsxFiles.map((file) => (
                <FileItem
                  key={file.id}
                  name={file.name}
                  type={file.type}
                  meta={file.meta}
                  showStatus
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
