import { Check } from 'lucide-react';

interface LogoProps {
  showText?: boolean;
  size?: 'sm' | 'md';
}

export function Logo({ showText = true, size = 'md' }: LogoProps) {
  const boxSize = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';
  const iconSize = size === 'sm' ? 14 : 16;
  const textClass = size === 'sm' ? 'text-[13px]' : 'text-[15px]';

  return (
    <div className="flex items-center gap-2.5">
      <div className={`${boxSize} bg-[#534AB7] rounded-[6px] flex items-center justify-center flex-shrink-0`}>
        <Check size={iconSize} className="text-white" strokeWidth={2.5} />
      </div>
      {showText && (
        <span className={`${textClass} font-semibold text-[#111827]`}>CognitAI Tender</span>
      )}
    </div>
  );
}
