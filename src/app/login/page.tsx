'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0B0F1A' }}>
      {/* Left panel */}
      <div style={{
        width: '48%',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative glows */}
        <div style={{
          position: 'absolute', top: '20%', left: '20%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '15%', right: '15%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: '0 40px' }}>
          <div style={{
            width: 56, height: 56,
            background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 0 30px rgba(99,102,241,0.3)',
          }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M5 13.5L10.5 19L21 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ fontSize: 22, fontWeight: 500, color: '#ffffff', marginBottom: 8 }}>
            CognitAI Tender
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6, maxWidth: 280, margin: '0 auto' }}>
            ИИ-платформа для автоматизации тендерной документации
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        width: '52%',
        background: '#0F1629',
        borderLeft: '1px solid #1E293B',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ width: 300 }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 20, fontWeight: 500, color: '#F1F5F9', marginBottom: 6 }}>
              Вход в систему
            </div>
            <div style={{ fontSize: 12, color: '#64748B' }}>
              Введите данные для входа
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cognitai.kz"
                style={{
                  width: '100%', height: 42,
                  padding: '0 14px',
                  background: '#0B0F1A',
                  border: '1px solid #1E293B',
                  borderRadius: 10,
                  color: '#F1F5F9',
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#6366F1')}
                onBlur={(e) => (e.target.style.borderColor = '#1E293B')}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%', height: 42,
                  padding: '0 14px',
                  background: '#0B0F1A',
                  border: '1px solid #1E293B',
                  borderRadius: 10,
                  color: '#F1F5F9',
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#6366F1')}
                onBlur={(e) => (e.target.style.borderColor = '#1E293B')}
              />
            </div>
            <button
              type="submit"
              style={{
                width: '100%', height: 44,
                background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
                color: '#ffffff',
                fontSize: 14, fontWeight: 500,
                border: 'none', borderRadius: 10,
                cursor: 'pointer',
                marginTop: 4,
                boxShadow: '0 0 20px rgba(99,102,241,0.25)',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.opacity = '0.9')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.opacity = '1')}
            >
              Войти
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
