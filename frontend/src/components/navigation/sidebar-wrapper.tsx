'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Users, Calendar, Award, LogOut, CheckSquare, Layers, BookOpen, Mail, Image as ImageIcon, User } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';

interface SidebarWrapperProps {
  session: {
    id: number;
    email: string;
    role: 'admin' | 'pembina' | 'siswa';
  };
  children: React.ReactNode;
}

export default function SidebarWrapper({ session, children }: SidebarWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const navLinks = session.role === 'siswa' ? (
    <>
      <Link href="/siswa" onClick={closeSidebar} className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-white/5 text-sm font-medium transition-colors">
        <Users className="h-4 w-4" /> <span>Paspor Jurnal</span>
      </Link>
      <Link href="/siswa/sku" onClick={closeSidebar} className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-white/5 text-sm font-medium transition-colors">
        <CheckSquare className="h-4 w-4" /> <span>SKU & SKK</span>
      </Link>
      <Link href="/siswa/absensi" onClick={closeSidebar} className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-white/5 text-sm font-medium transition-colors">
        <Calendar className="h-4 w-4" /> <span>Absensi GPS</span>
      </Link>
      <Link href="/profil" onClick={closeSidebar} className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-white/5 text-sm font-medium transition-colors">
        <User className="h-4 w-4" /> <span>Edit Profil</span>
      </Link>
    </>
  ) : (
    <>
      <Link href="/admin" onClick={closeSidebar} className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-white/5 text-sm font-medium transition-colors">
        <Layers className="h-4 w-4" /> <span>Ringkasan Panel</span>
      </Link>
      <Link href="/admin/users" onClick={closeSidebar} className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-white/5 text-sm font-medium transition-colors">
        <Users className="h-4 w-4" /> <span>Kelola Anggota</span>
      </Link>
      <Link href="/admin/prestasi" onClick={closeSidebar} className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-white/5 text-sm font-medium transition-colors">
        <Award className="h-4 w-4" /> <span>Kelola Prestasi</span>
      </Link>
      <Link href="/admin/galeri" onClick={closeSidebar} className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-white/5 text-sm font-medium transition-colors">
        <ImageIcon className="h-4 w-4" /> <span>Kelola Galeri</span>
      </Link>
      <Link href="/admin/sejarah" onClick={closeSidebar} className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-white/5 text-sm font-medium transition-colors">
        <BookOpen className="h-4 w-4" /> <span>Kelola Sejarah</span>
      </Link>
      <Link href="/admin/absensi" onClick={closeSidebar} className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-white/5 text-sm font-medium transition-colors">
        <Calendar className="h-4 w-4" /> <span>Kelola Absensi</span>
      </Link>
      <Link href="/admin/penilaian" onClick={closeSidebar} className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-white/5 text-sm font-medium transition-colors">
        <CheckSquare className="h-4 w-4" /> <span>Kelola Penilaian</span>
      </Link>
      <Link href="/admin/pesan" onClick={closeSidebar} className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-white/5 text-sm font-medium transition-colors">
        <Mail className="h-4 w-4" /> <span>Pesan Masuk</span>
      </Link>
      <Link href="/profil" onClick={closeSidebar} className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-white/5 text-sm font-medium transition-colors border-t border-white/10 pt-4 mt-2">
        <User className="h-4 w-4" /> <span>Edit Profil</span>
      </Link>
    </>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#FBF9F6] text-[#111827]">
      {/* MOBILE TOPBAR */}
      <header className="flex md:hidden items-center justify-between px-6 py-4 bg-primary text-white border-b border-[#D1C9BC]/25 sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="p-1 bg-[#E7E2D8] rounded-md border border-[#D1C9BC]/50">
            <img src="/logo.png" alt="Logo" className="h-6 w-6 object-contain" />
          </div>
          <span className="font-serif font-bold text-sm uppercase tracking-wider text-white">Satria Batara</span>
        </div>
        <button onClick={toggleSidebar} className="p-1.5 hover:bg-white/5 rounded-lg text-secondary focus:outline-none cursor-pointer">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* MOBILE DRAWER BACKDROP */}
      {isOpen && (
        <div onClick={closeSidebar} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden animate-fade-in" />
      )}

      {/* SIDEBAR CONTAINER (DESKTOP & MOBILE DRAWER) */}
      <aside className={`
        fixed md:sticky top-0 bottom-0 left-0 z-40
        w-64 bg-primary text-[#E7E2D8] border-r border-[#D1C9BC]
        flex flex-col justify-between p-6
        transition-transform duration-300 ease-in-out md:translate-x-0
        h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:transform-none'}
      `}>
        <div className="space-y-8">
          {/* LOGO */}
          <div className="flex items-center space-x-3">
            <div className="p-1 bg-[#E6DFD3] rounded-md border border-[#D1C9BC]">
              <img src="/logo.png" alt="Logo" className="h-6 w-6 object-contain" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-serif font-bold text-sm uppercase tracking-wider text-white">Satria Batara</span>
              <span className="text-[9px] font-mono text-secondary/60 uppercase">Panel Administrasi</span>
            </div>
          </div>

          {/* NAV ITEMS */}
          <nav className="space-y-2 text-left">
            {navLinks}
          </nav>
        </div>

        {/* PROFILE CARD & LOGOUT */}
        <div className="border-t border-secondary/10 pt-6 space-y-4 text-left">
          <div className="flex flex-col">
            <span className="text-xs font-mono text-secondary/40 uppercase">Masuk Sebagai:</span>
            <span className="text-sm font-bold text-white truncate">{session.email}</span>
            <span className="text-[10px] font-mono text-accent uppercase font-bold mt-0.5">{session.role}</span>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="flex items-center space-x-3 px-4 py-2.5 w-full rounded-lg hover:bg-white/5 text-sm font-medium text-red-400 hover:text-red-300 transition-colors text-left cursor-pointer">
              <LogOut className="h-4 w-4" /> <span>Keluar</span>
            </button>
          </form>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto max-h-screen">
        {children}
      </main>
    </div>
  );
}
