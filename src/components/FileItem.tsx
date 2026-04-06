import { FileText, FileSpreadsheet } from 'lucide-react';

interface FileItemProps {
  name: string;
  type: 'pdf' | 'xlsx';
  meta: string;
  showStatus?: boolean;
}

export function FileItem({ name, type, meta, showStatus = false }: FileItemProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px',
      borderBottom: '1px solid rgba(30,41,59,0.6)',
      background: '#0F1629',
    }}
    className="file-item-row"
    >
      <div style={{
        flexShrink: 0, width: 34, height: 34, borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: type === 'pdf' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
      }}>
        {type === 'pdf'
          ? <FileText size={16} color="#F87171" strokeWidth={1.5} />
          : <FileSpreadsheet size={16} color="#34D399" strokeWidth={1.5} />
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#F1F5F9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name}
        </div>
        <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>{meta}</div>
      </div>
      {showStatus && (
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '2px 10px', borderRadius: 20,
          fontSize: 11, fontWeight: 500,
          background: 'rgba(16,185,129,0.15)', color: '#34D399',
        }}>
          Обработан
        </span>
      )}
    </div>
  );
}
