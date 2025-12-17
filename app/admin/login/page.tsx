'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setError('Nome utente o password non validi');
      }
    } catch (err) {
      setError('Login fallito. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2d1810] relative overflow-hidden flex flex-col items-center justify-center px-4 md:px-8 lg:px-24">
      {/* Textured Background Overlay */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay'
        }}
      />

      {/* Rust/Brown Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-transparent to-red-900/20" />

      <div className="max-w-md w-full relative z-10">
        <div className="bg-gradient-to-br from-[#1a1310]/90 to-[#2d1810]/90 backdrop-blur-sm rounded-lg shadow-2xl p-6 md:p-8 border border-[#e8dcc4]/20">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#e8dcc4] mb-2 tracking-wide">
              LOGIN AMMINISTRATORE
            </h1>
            <p className="text-[#e8dcc4]/70 text-sm md:text-base">
              Inserisci le tue credenziali per accedere al pannello di amministrazione
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div>
              <label htmlFor="username" className="block text-xs md:text-sm font-medium text-[#e8dcc4] mb-2 tracking-wide">
                NOME UTENTE
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border-2 border-[#e8dcc4]/30 rounded bg-[#1a1310]/50 text-[#e8dcc4] focus:ring-2 focus:ring-[#e8dcc4] focus:border-[#e8dcc4] transition-all placeholder-[#e8dcc4]/40"
                placeholder="Inserisci nome utente"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs md:text-sm font-medium text-[#e8dcc4] mb-2 tracking-wide">
                PASSWORD
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border-2 border-[#e8dcc4]/30 rounded bg-[#1a1310]/50 text-[#e8dcc4] focus:ring-2 focus:ring-[#e8dcc4] focus:border-[#e8dcc4] transition-all placeholder-[#e8dcc4]/40"
                placeholder="Inserisci password"
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700 text-[#e8dcc4] px-3 md:px-4 py-2 md:py-3 rounded text-sm md:text-base">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full border-2 border-[#e8dcc4] text-[#e8dcc4] font-semibold py-2 md:py-3 px-4 rounded tracking-wider text-sm md:text-base hover:bg-[#e8dcc4] hover:text-[#2d1810] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'ACCESSO IN CORSO...' : 'ACCEDI'}
            </button>
          </form>

          <div className="mt-4 md:mt-6 text-center">
            <Link href="/" className="text-[#e8dcc4] hover:text-white transition-colors tracking-wide text-sm md:text-base">
              ← TORNA ALLA HOME
            </Link>
          </div>

          <div className="mt-4 md:mt-6 p-3 md:p-4 bg-[#1a1310]/50 rounded border border-[#e8dcc4]/10">
            <p className="text-xs text-[#e8dcc4]/60 text-center">
              Credenziali predefinite: admin / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
