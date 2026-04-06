'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
      <div className="w-[360px]">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-8">
          <h1 className="text-[18px] font-semibold text-[#111827] mb-1">Вход в систему</h1>
          <p className="text-[13px] text-[#6B7280] mb-6">Введите данные для входа</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cognitai.ru"
                className="w-full h-9 px-3 text-[13px] border border-[#E5E7EB] rounded-[6px] outline-none focus:border-[#534AB7] focus:ring-2 focus:ring-[#534AB7]/10 transition-colors placeholder:text-[#9CA3AF]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-9 px-3 text-[13px] border border-[#E5E7EB] rounded-[6px] outline-none focus:border-[#534AB7] focus:ring-2 focus:ring-[#534AB7]/10 transition-colors placeholder:text-[#9CA3AF]"
              />
            </div>
            <button
              type="submit"
              className="w-full h-9 bg-[#534AB7] text-white text-[13px] font-medium rounded-[6px] hover:bg-[#4840A3] transition-colors mt-1"
            >
              Войти
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
