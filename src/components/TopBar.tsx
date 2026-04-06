import { Logo } from './Logo';

interface TopBarProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export function TopBar({ left, right }: TopBarProps) {
  return (
    <header className="h-14 bg-white border-b border-[#E5E7EB] flex items-center px-5 gap-4 flex-shrink-0">
      <div className="flex-1 flex items-center gap-3">
        {left ?? <Logo />}
      </div>
      <div className="flex items-center gap-3">
        {right ?? (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#534AB7] flex items-center justify-center text-white text-[11px] font-semibold">
              АИ
            </div>
            <span className="text-[13px] text-[#111827]">Администратор</span>
          </div>
        )}
      </div>
    </header>
  );
}
