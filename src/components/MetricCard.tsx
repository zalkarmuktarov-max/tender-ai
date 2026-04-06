interface MetricCardProps {
  label: string;
  value: string;
}

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[8px] px-5 py-4 flex-1">
      <div className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-1">{label}</div>
      <div className="text-[28px] font-semibold text-[#111827] leading-none">{value}</div>
    </div>
  );
}
