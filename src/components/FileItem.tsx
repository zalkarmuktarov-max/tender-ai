import { FileText, FileSpreadsheet } from 'lucide-react';

interface FileItemProps {
  name: string;
  type: 'pdf' | 'xlsx';
  meta: string;
  showStatus?: boolean;
}

export function FileItem({ name, type, meta, showStatus = false }: FileItemProps) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#E5E7EB] last:border-b-0">
      <div className={`flex-shrink-0 w-8 h-8 rounded-[6px] flex items-center justify-center ${type === 'pdf' ? 'bg-[#FDEAEA]' : 'bg-[#F0F7E6]'}`}>
        {type === 'pdf'
          ? <FileText size={16} className="text-[#E24B4A]" />
          : <FileSpreadsheet size={16} className="text-[#639922]" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-[#111827] truncate">{name}</div>
        <div className="text-[11px] text-[#6B7280]">{meta}</div>
      </div>
      {showStatus && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-[20px] text-xs font-medium bg-[#F0F7E6] text-[#639922] border border-[#C6E397]">
          Обработан
        </span>
      )}
    </div>
  );
}
