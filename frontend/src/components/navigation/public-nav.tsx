'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Compass } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function PublicNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const links = [
    { name: 'Beranda', href: '/' },
    { name: 'Sejarah', href: '/sejarah' },
    { name: 'Prestasi', href: '/prestasi' },
    { name: 'Galeri', href: '/galeri' },
    { name: 'Kontak', href: '/kontak' },
  ];

  return (
    <header className="sticky top-0 w-full bg-[#FBF9F6]/90 backdrop-blur-md border-b border-[#D1C9BC]/35 z-50">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        {/* LOGO & BRAND */}
        <Link href="/" onClick={closeMenu} className="flex items-center space-x-3 group">
          <div className="p-1.5 bg-[#E6DFD3] rounded-xl border border-[#D1C9BC]/70 transition-transform group-hover:scale-105">
            <img src="/logo.png" alt="Logo" className="h-7 w-7 object-contain" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-serif font-black text-sm uppercase tracking-widest text-primary">Satria Batara</span>
            <span className="text-[8px] font-mono text-gray-500 uppercase tracking-wider">Gudep 28.065 - 28.066</span>
          </div>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <nav className="hidden md:flex items-center space-x-8">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-mono font-bold uppercase tracking-wider transition-colors hover:text-primary ${
                  isActive ? 'text-primary border-b-2 border-primary pb-1' : 'text-gray-500'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* DESKTOP PORTAL ENTRY BUTTON */}
        <div className="hidden md:block">
          <Link
            href="/login"
            className="px-5 py-2.5 bg-primary text-[#E7E2D8] font-mono font-bold uppercase tracking-wider text-xs rounded-xl shadow-md hover:bg-opacity-95 transition-all"
          >
            Masuk Portal
          </Link>
        </div>

        {/* MOBILE HAMBURGER BUTTON */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 rounded-xl border border-[#D1C9BC]/45 text-primary hover:bg-[#E6DFD3]/20 transition-all cursor-pointer"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* MOBILE NAV OVERLAY */}
      {isOpen && (
        <div className="md:hidden border-t border-[#D1C9BC]/25 bg-[#FBF9F6] px-6 py-8 space-y-6 shadow-xl animate-fade-in text-left">
          <nav className="flex flex-col space-y-4">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={`text-xs font-mono font-bold uppercase tracking-widest py-2 border-b border-[#D1C9BC]/20 transition-colors ${
                    isActive ? 'text-primary' : 'text-gray-500'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
          <div className="pt-4">
            <Link
              href="/login"
              onClick={closeMenu}
              className="w-full py-3.5 bg-primary text-[#E7E2D8] font-mono font-bold uppercase tracking-wider text-xs rounded-xl shadow-md hover:bg-opacity-95 transition-all text-center block"
            >
              Masuk Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
