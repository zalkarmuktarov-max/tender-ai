'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Database, Settings, Search } from 'lucide-react';
import { Logo } from './Logo';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Дашборд' },
  { href: '/tender/new', icon: FileText, label: 'Тендеры' },
  { href: '/tenders/search', icon: Search, label: 'Поиск тендеров' },
  { href: '/knowledge', icon: Database, label: 'База знаний' },
  { href: '/settings', icon: Settings, label: 'Настройки' },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/tender/new') return pathname.startsWith('/tender/');
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-[60px] hover:w-[220px] bg-white border-r border-[#E5E7EB] flex flex-col z-50 overflow-hidden transition-all duration-200 group">
      <div className="h-14 flex items-center px-4 border-b border-[#E5E7EB] flex-shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 bg-[#534AB7] rounded-[6px] flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-[13px] font-semibold text-[#111827] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            CognitAI Tender
          </span>
        </div>
      </div>

      <nav className="flex-1 py-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center h-10 px-[18px] gap-3 mx-2 rounded-[6px] mb-0.5 transition-colors ${
                active
                  ? 'bg-[#EEF0FB] text-[#534AB7]'
                  : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]'
              }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              <span className="text-[13px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
