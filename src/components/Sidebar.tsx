'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FileText, Database, Settings, Search, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Дашборд' },
  { href: '/tender/new', icon: FileText, label: 'Тендеры' },
  { href: '/tenders/search', icon: Search, label: 'Поиск тендеров' },
  { href: '/knowledge', icon: Database, label: 'База знаний' },
  { href: '/settings', icon: Settings, label: 'Настройки' },
];

interface SidebarProps {
  userEmail?: string;
  userName?: string;
  initials?: string;
}

export function Sidebar({ userEmail = 'admin@cognitai.kz', userName = 'Администратор', initials = 'АС' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/tender/new') return pathname.startsWith('/tender/') && !pathname.startsWith('/tender/audit');
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside
      style={{
        width: 210, background: '#0F1629', borderRight: '1px solid #1E293B',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', left: 0, top: 0, height: '100%',
        padding: '16px 10px', zIndex: 50,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, padding: '0 4px' }}>
        <div style={{
          width: 30, height: 30,
          background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
          borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span style={{ fontSize: 14, fontWeight: 500, color: '#F1F5F9', whiteSpace: 'nowrap' }}>CognitAI</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, textDecoration: 'none',
                transition: 'all 0.15s ease',
                background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: active ? '#A5B4FC' : '#64748B',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.08)';
                  (e.currentTarget as HTMLElement).style.color = '#C7D2FE';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = '#64748B';
                }
              }}
            >
              <Icon size={18} strokeWidth={1.5} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 400, whiteSpace: 'nowrap' }}>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={{ borderTop: '1px solid #1E293B', paddingTop: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'rgba(99,102,241,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#A5B4FC' }}>{initials}</span>
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: 12, color: '#F1F5F9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName || userEmail}</div>
            <div style={{ fontSize: 10, color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userEmail}</div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 12px', borderRadius: 8, border: 'none',
            background: 'transparent', color: '#475569', fontSize: 12,
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)';
            (e.currentTarget as HTMLElement).style.color = '#F87171';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = '#475569';
          }}
        >
          <LogOut size={14} strokeWidth={1.5} />
          Выйти
        </button>
      </div>
    </aside>
  );
}
