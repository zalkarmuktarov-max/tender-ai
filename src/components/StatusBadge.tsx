import type { TenderStatus, FieldStatus } from '@/types/tender';

interface TenderStatusBadgeProps {
  status: TenderStatus | 'completed' | 'rejected';
}

const tenderStatusMap: Record<string, { label: string; bg: string; color: string }> = {
  done:       { label: 'Завершён',     bg: 'rgba(16,185,129,0.15)',  color: '#34D399' },
  completed:  { label: 'Завершён',     bg: 'rgba(16,185,129,0.15)',  color: '#34D399' },
  review:     { label: 'На ревью',     bg: 'rgba(245,158,11,0.15)',  color: '#FBBF24' },
  processing: { label: 'В обработке',  bg: 'rgba(99,102,241,0.15)', color: '#A5B4FC' },
  rejected:   { label: 'Отклонён',     bg: 'rgba(239,68,68,0.15)',   color: '#F87171' },
};

export function TenderStatusBadge({ status }: TenderStatusBadgeProps) {
  const { label, bg, color } = tenderStatusMap[status] ?? { label: status, bg: '#1E293B', color: '#64748B' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 500,
      background: bg, color,
    }}>
      {label}
    </span>
  );
}

interface FieldStatusBadgeProps {
  status: FieldStatus;
}

const fieldStatusMap: Record<FieldStatus, { label: string; bg: string; color: string }> = {
  exact:     { label: 'exact_match', bg: 'rgba(16,185,129,0.15)',  color: '#34D399' },
  inferred:  { label: 'inferred',    bg: 'rgba(245,158,11,0.15)',  color: '#FBBF24' },
  not_found: { label: 'not_found',   bg: 'rgba(239,68,68,0.15)',   color: '#F87171' },
};

export function FieldStatusBadge({ status }: FieldStatusBadgeProps) {
  const { label, bg, color } = fieldStatusMap[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '1px 8px', borderRadius: 20,
      fontSize: 10, fontWeight: 500,
      background: bg, color,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}
