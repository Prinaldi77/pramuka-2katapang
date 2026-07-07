'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Compass, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { loginAction } from '../actions/auth';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const response = await loginAction(null, formData);

      if (!response.success || !response.user) {
        setError(response.error || 'Terjadi kesalahan otentikasi.');
      } else {
        // Redirect based on role
        if (response.user.role === 'siswa') {
          router.push('/siswa');
        } else {
          router.push('/admin');
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#111827] flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#D1C9BC_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none"></div>

      {/* FLOATING BACK BUTTON */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 inline-flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-gray-500 hover:text-primary transition-colors bg-white border border-[#D1C9BC] px-4 py-2.5 rounded-xl shadow-sm z-20"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Kembali ke Beranda</span>
      </Link>

      <div className="w-full max-w-md bg-white border border-[#D1C9BC] rounded-3xl p-8 shadow-sm space-y-8 relative z-10 mt-12 md:mt-0">
        
        {/* LOGO & TITLE */}
        <div className="flex flex-col items-center text-center space-y-4">
          <img src="/logo.png" alt="Logo Satria Batara" className="h-16 w-16 object-contain" />
          <div>
            <h1 className="font-serif font-black text-2xl text-primary">Masuk Portal Pramuka</h1>
            <p className="text-xs font-mono text-[#5C3D2E] uppercase font-bold tracking-widest mt-1">
              Gudep 28.065 - 28.066
            </p>
          </div>
        </div>

        {/* ERROR DISPLAY */}
        {error && (
          <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">
              Email Pengguna
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="nama@email.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">
              Kata Sandi
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 bg-primary text-[#E7E2D8] font-mono font-bold uppercase tracking-wider text-xs rounded-xl shadow-md hover:bg-opacity-95 transition-all flex justify-center items-center cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Memproses...
              </>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
