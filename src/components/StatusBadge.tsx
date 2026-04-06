import type { TenderStatus, FieldStatus } from '@/types/tender';

interface TenderStatusBadgeProps {
  status: TenderStatus;
}

const tenderStatusMap: Record<TenderStatus, { label: string; className: string }> = {
  done: { label: 'Завершён', className: 'bg-[#F0F7E6] text-[#639922] border border-[#C6E397]' },
  review: { label: 'На ревью', className: 'bg-[#FEF6E7] text-[#B07000] border border-[#F7D68A]' },
  processing: { label: 'В обработке', className: 'bg-[#EAF2FD] text-[#2A6DB5] border border-[#B0CFF5]' },
};

export function TenderStatusBadge({ status }: TenderStatusBadgeProps) {
  const { label, className } = tenderStatusMap[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-[20px] text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

interface FieldStatusBadgeProps {
  status: FieldStatus;
}

const fieldStatusMap: Record<FieldStatus, { label: string; className: string }> = {
  exact: { label: 'exact_match', className: 'bg-[#F0F7E6] text-[#639922] border border-[#C6E397]' },
  inferred: { label: 'inferred', className: 'bg-[#FEF6E7] text-[#B07000] border border-[#F7D68A]' },
  not_found: { label: 'not_found', className: 'bg-[#FDEAEA] text-[#C0392B] border border-[#F5B0B0]' },
};

export function FieldStatusBadge({ status }: FieldStatusBadgeProps) {
  const { label, className } = fieldStatusMap[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-[20px] text-[10px] font-medium ${className}`}>
      {label}
    </span>
  );
}
