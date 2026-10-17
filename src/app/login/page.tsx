'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Loader2, ArrowLeft, User, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { loginAction } from '../actions/auth';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="relative min-h-screen w-full font-plus-jakarta overflow-x-hidden bg-scout-brown/10">
      {/* Fullscreen Background with Overlay */}
      <div className="fixed inset-0 z-0">
        <div 
          style={{ backgroundImage: `url('/bg_scout.png')` }} 
          className="bg-cover bg-center w-full h-full transform scale-105"
        ></div>
        <div className="absolute inset-0 scout-overlay"></div>
      </div>

      {/* FLOATING BACK BUTTON */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-scout-gold transition-colors bg-black/40 backdrop-blur-md border border-outline-variant/30 px-4 py-2.5 rounded-xl shadow-sm z-20"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Kembali ke Beranda</span>
      </Link>

      {/* Main Content Container */}
      <main className="relative z-10 min-h-screen w-full flex flex-col md:flex-row md:h-screen">
        
        {/* Left Column: Branding Area */}
        <div className="w-full md:w-1/2 flex flex-col justify-between p-6 md:p-16 pt-24 md:pt-16 min-h-[50vh] md:min-h-0">
          
          {/* Branding Header */}
          <div className="flex flex-col space-y-6 mt-6 md:mt-0">
            <img 
              src="/tunas_kelapa_logo.png" 
              alt="Tunas Kelapa Logo" 
              className="w-24 h-24 md:w-32 md:h-32 object-contain animate-pulse" 
            />
            
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight font-plus-jakarta">
                Portal Pramuka
              </h1>
              <div className="space-y-1">
                <p className="text-xl md:text-2xl font-bold text-scout-gold">Gudep 28.065 – 28.066</p>
                <p className="text-base md:text-lg text-on-surface-variant/80">SMP Negeri 2 Katapang</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-2">
              <div className="h-[2px] w-12 bg-scout-gold"></div>
              <span className="text-[10px] md:text-xs text-scout-gold tracking-widest uppercase font-bold">
                Aktif • Berprestasi • Berkarakter
              </span>
            </div>
          </div>

          {/* Partner Logos */}
          <div className="flex items-center gap-8 pt-12 md:pt-0 pb-4">
            <img 
              src="/smpn2_katapang_logo.png" 
              alt="SMPN 2 Katapang Logo" 
              className="h-12 w-auto opacity-90 hover:opacity-100 transition-opacity" 
            />
            <img 
              src="/wosm_logo.png" 
              alt="WOSM Logo" 
              className="h-12 w-auto opacity-90 hover:opacity-100 transition-opacity" 
            />
          </div>
        </div>

        {/* Right Column: Login Card */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-16 min-h-[50vh] md:min-h-0">
          <div className="glass-card w-full max-w-md p-8 rounded-2xl shadow-2xl transition-all duration-500 hover:border-scout-gold/40 group">
            
            <div className="flex flex-col items-center text-center mb-8">
              <div className="bg-white/10 p-6 rounded-full mb-4">
                <img 
                  alt="Barisan Satria Batara Logo" 
                  className="w-24 h-24 object-contain" 
                  src="/barisan_satria_batara_logo.png" 
                />
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Masuk ke Portal</h2>
              <p className="text-sm text-on-surface-variant">Silakan masuk menggunakan akun Anda</p>
            </div>

            {/* ERROR DISPLAY */}
            {error && (
              <div className="flex items-center space-x-2 p-4 mb-6 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded-xl backdrop-blur-md">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] text-scout-gold font-bold tracking-wider block ml-1 uppercase">EMAIL PENGGUNA</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant/60" />
                  <input 
                    id="email"
                    name="email"
                    type="email" 
                    required
                    placeholder="nama@email.com" 
                    className="w-full bg-surface-container/30 border border-outline-variant/30 rounded-xl py-4 pl-12 pr-4 text-white placeholder-on-surface-variant/40 focus:ring-2 focus:ring-scout-gold/50 focus:border-scout-gold transition-all outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-scout-gold font-bold tracking-wider block ml-1 uppercase">KATA SANDI</label>
                  <a href="#" className="text-[10px] text-on-surface-variant hover:text-scout-gold transition-colors font-bold uppercase">Lupa sandi?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant/60" />
                  <input 
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"} 
                    required
                    placeholder="••••••••" 
                    className="w-full bg-surface-container/30 border border-outline-variant/30 rounded-xl py-4 pl-12 pr-12 text-white placeholder-on-surface-variant/40 focus:ring-2 focus:ring-scout-gold/50 focus:border-scout-gold transition-all outline-none" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-scout-gold transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 px-1">
                <input 
                  type="checkbox" 
                  id="remember" 
                  className="w-4 h-4 rounded border-outline-variant/30 bg-surface-container/30 text-scout-brown focus:ring-scout-gold/50" 
                />
                <label htmlFor="remember" className="text-xs text-on-surface-variant">Ingat saya di perangkat ini</label>
              </div>

              <button 
                type="submit" 
                disabled={isPending}
                className="w-full bg-scout-brown hover:bg-scout-secondary text-white font-bold py-4 rounded-xl shadow-lg transform active:scale-95 transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                    <span>MEMPROSES...</span>
                  </>
                ) : (
                  <>
                    <span>MASUK</span>
                    <LogIn className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-outline-variant/20 text-center">
              <p className="text-xs text-on-surface-variant">
                Belum punya akun?{' '}
                <a href="#" className="text-scout-gold font-bold hover:underline decoration-scout-gold/30 underline-offset-4">Hubungi Pembina</a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
