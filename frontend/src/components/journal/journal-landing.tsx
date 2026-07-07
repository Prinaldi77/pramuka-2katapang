'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { sendContactMessageAction } from '@/app/actions/pesan';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Compass, 
  MapPin, 
  Calendar, 
  Award, 
  Users, 
  BookOpen, 
  ArrowRight, 
  Layers, 
  Info,
  Shield,
  Heart
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface JournalLandingProps {
  stats: {
    siswa: number;
    pembina: number;
    pengurus: number;
    kegiatan: number;
  };
  kegiatan: any[];
  prestasi: any[];
  galeri: any[];
}

export default function JournalLanding({ stats, kegiatan, prestasi, galeri }: JournalLandingProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLDivElement>(null);

  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [isSending, startSending] = useTransition();

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setContactSuccess(false);
    setContactError(null);

    const formData = new FormData(e.currentTarget);
    startSending(async () => {
      const res = await sendContactMessageAction(formData);
      if (res.success) {
        setContactSuccess(true);
        (e.target as HTMLFormElement).reset();
      } else {
        setContactError(res.error || 'Terjadi kesalahan.');
      }
    });
  };

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsDesktop(window.innerWidth >= 1024);

    const mm = gsap.matchMedia();

    // GSAP Hero Text Reveal Animation
    gsap.from('.hero-reveal', {
      opacity: 0,
      y: window.innerWidth >= 1024 ? 60 : 30,
      duration: 1.2,
      stagger: 0.2,
      ease: 'power4.out',
    });

    // Pinned Horizontal Timeline Scroll Animation (Only for screen widths >= 1024px)
    mm.add("(min-width: 1024px)", () => {
      const sections = gsap.utils.toArray('.timeline-card');
      if (sections.length > 0) {
        gsap.to('.timeline-container', {
          xPercent: -50,
          ease: 'none',
          scrollTrigger: {
            trigger: timelineRef.current,
            pin: true,
            scrub: 1,
            start: 'top top',
            end: () => `+=${timelineRef.current?.offsetWidth}`,
          },
        });
      }
    });

    // Statistics Counter Animation
    gsap.from('.stat-number', {
      innerText: 0,
      duration: 2,
      snap: { innerText: 1 },
      scrollTrigger: {
        trigger: countRef.current,
        start: 'top 85%',
      },
    });

    return () => mm.revert();
  }, []);

  return (
    <div className="w-full bg-[#FBF9F6] text-[#111827] overflow-x-hidden selection:bg-primary/20 selection:text-primary scroll-smooth">
      
      {/* HEADER / NAVIGATION */}
      <header className="sticky top-0 z-50 w-full bg-[#FBF9F6]/95 backdrop-blur-md border-b border-[#D1C9BC] py-4 px-6 md:px-12 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="p-1.5 bg-[#E6DFD3] text-primary rounded-lg transition-transform group-hover:rotate-12 border border-[#D1C9BC]">
            <img src="/logo.png" alt="Logo Pramuka" className="h-6 w-6 object-contain" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-serif font-bold text-lg leading-none uppercase tracking-wider text-primary">
              Satria Batara
            </span>
            <span className="text-[10px] font-mono tracking-widest text-[#5C3D2E] uppercase font-bold mt-1">
              Gudep 28.065 - 28.066
            </span>
          </div>
        </Link>
        <nav className="hidden lg:flex items-center space-x-8 font-mono text-xs font-bold uppercase tracking-wider">
          <a href="#tentang" className="hover:text-accent transition-colors">Tentang Gudep</a>
          <a href="#prestasi" className="hover:text-accent transition-colors">Prestasi</a>
          <a href="#dokumentasi" className="hover:text-accent transition-colors">Galeri Kegiatan</a>
          <a href="#kontak" className="hover:text-accent transition-colors">Kontak</a>
        </nav>
        <Link 
          href="/login" 
          className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-mono font-bold tracking-widest uppercase text-secondary bg-primary hover:bg-opacity-95 transition-all rounded-md shadow-md border border-[#D1C9BC]"
        >
          Masuk
        </Link>
      </header>

      {/* HERO SECTION */}
      <section 
        ref={heroRef}
        className="relative min-h-[90vh] flex flex-col justify-center items-center py-20 px-6 md:px-12 border-b border-[#D1C9BC] overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(#D1C9BC_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 font-mono text-[10px] text-[#5C3D2E] font-bold tracking-widest hidden md:block">
          [ PANGKALAN: SMPN 2 KATAPANG ]
        </div>

        <div className="max-w-5xl text-center space-y-8 z-10 flex flex-col items-center">
          <img src="/logo.png" alt="Logo Satria Batara" className="h-28 w-28 object-contain drop-shadow-md" />
          <span className="hero-reveal inline-flex items-center px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider bg-secondary text-primary border border-primary/20">
            ★ GUDEP 28.065 - 28.066 ★
          </span>
          <h1 className="hero-reveal text-5xl md:text-7xl font-serif font-black text-primary leading-none tracking-tight">
            Satyaku Kudarmakan,<br/>
            <span className="text-accent italic font-normal">Darmaku Kubaktikan</span>
          </h1>
          <p className="hero-reveal text-base md:text-lg max-w-2xl mx-auto leading-relaxed text-gray-700">
            Selamat datang di Sistem Informasi Pramuka SMP Negeri 2 Katapang. Wadah informasi resmi, rekapitulasi prestasi kejuaraan, dan tata kelola administrasi pangkalan untuk menempa karakter pemuda tangguh, mandiri, dan berjiwa kepemimpinan.
          </p>
          <div className="hero-reveal flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <a 
              href="#dokumentasi" 
              className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3.5 text-xs font-mono font-bold uppercase tracking-wider text-secondary bg-primary hover:bg-opacity-90 rounded-md transition-colors"
            >
              Galeri Kegiatan <ArrowRight className="ml-2 h-4 w-4" />
            </a>
            <a 
              href="#tentang" 
              className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3.5 text-xs font-mono font-bold uppercase tracking-wider text-[#5C3D2E] border border-[#D1C9BC] hover:bg-[#E6DFD3]/35 rounded-md transition-colors"
            >
              Tentang Gudep
            </a>
          </div>
        </div>
      </section>

      {/* STATISTICS COUNTER SECTION */}
      <section 
        ref={countRef}
        className="py-12 border-b border-[#D1C9BC] bg-[#E6DFD3]/30"
      >
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8 text-left">
          <div className="flex flex-col items-center justify-center text-center p-6 border-r border-[#D1C9BC]/40 last:border-0">
            <Users className="h-8 w-8 text-primary mb-3" />
            <span className="stat-number text-4xl font-serif font-bold text-primary">{stats.siswa}</span>
            <span className="text-xs font-mono tracking-widest text-[#5C3D2E] uppercase font-bold mt-2">Anggota Aktif</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center p-6 border-r border-[#D1C9BC]/40 last:border-0">
            <Shield className="h-8 w-8 text-primary mb-3" />
            <span className="stat-number text-4xl font-serif font-bold text-primary">{stats.pembina}</span>
            <span className="text-xs font-mono tracking-widest text-[#5C3D2E] uppercase font-bold mt-2">Kakak Pembina</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center p-6 border-r border-[#D1C9BC]/40 last:border-0">
            <Layers className="h-8 w-8 text-primary mb-3" />
            <span className="stat-number text-4xl font-serif font-bold text-primary">{stats.pengurus}</span>
            <span className="text-xs font-mono tracking-widest text-[#5C3D2E] uppercase font-bold mt-2">Dewan Pengurus</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center p-6 border-r border-[#D1C9BC]/40 last:border-0">
            <Calendar className="h-8 w-8 text-primary mb-3" />
            <span className="stat-number text-4xl font-serif font-bold text-primary">{stats.kegiatan}</span>
            <span className="text-xs font-mono tracking-widest text-[#5C3D2E] uppercase font-bold mt-2">Kegiatan Terdaftar</span>
          </div>
        </div>
      </section>

      {/* HORIZONTAL TIMELINE HISTORY SECTION */}
      <section 
        ref={timelineRef}
        id="tentang"
        className="min-h-screen bg-[#F5F2EB] text-[#111827] flex flex-col justify-center py-20 border-b border-[#D1C9BC] relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('/tentang_gudep.jpg')] bg-cover bg-center opacity-25 pointer-events-none"></div>
        <div className="px-6 md:px-12 mb-12 relative z-10 text-left">
          <span className="text-xs font-mono tracking-widest text-[#5C3D2E] uppercase font-bold">[ ARSIP SEJARAH ]</span>
          <h2 className="text-4xl font-serif font-bold text-primary mt-2">Jejak Langkah Satria Batara</h2>
        </div>
        
        <div className="flex items-center w-full lg:w-[200vw] h-[55vh] lg:h-[50vh] px-6 lg:px-12 timeline-container relative z-10 overflow-x-auto lg:overflow-x-visible snap-x snap-mandatory lg:snap-none scrollbar-none">
          {!kegiatan || kegiatan.length === 0 ? (
            <div className="text-center py-12 text-gray-400 w-full font-mono text-sm">
              Belum ada arsip sejarah terdaftar.
            </div>
          ) : (
            kegiatan.map((item, idx) => {
              const year = item.tanggal ? new Date(item.tanggal).getFullYear() : '-';
              return (
                <div 
                  key={item.id || idx} 
                  className="w-[85vw] lg:w-[45vw] timeline-card flex-shrink-0 p-8 border border-[#D1C9BC] rounded-2xl mr-4 lg:mr-8 bg-white/90 backdrop-blur-md flex flex-col justify-between h-80 shadow-md hover:border-primary transition-all text-left snap-center lg:snap-align-none"
                >
                  <span className="text-5xl font-serif italic text-accent font-light">{year}</span>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-primary">{item.nama_kegiatan}</h3>
                    <p className="text-sm text-gray-700 mt-2 leading-relaxed line-clamp-3">
                      {item.deskripsi}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* PRESTASI CHAMPIONSHIP SHOWCASE */}
      <section 
        id="prestasi"
        className="py-24 px-6 md:px-12 border-b border-[#D1C9BC] text-left scroll-mt-24"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-16">
            <div>
              <span className="text-xs font-mono tracking-widest text-[#5C3D2E] uppercase font-bold">[ ARSIP KEJUARAAN ]</span>
              <h2 className="text-4xl font-serif font-bold text-primary mt-2">Papan Prestasi Ekspedisi</h2>
            </div>
            <p className="text-sm text-gray-600 max-w-md mt-4 md:mt-0 leading-relaxed">
              Daftar penghargaan dan trofi kejuaraan yang diraih oleh kontingen Pramuka SMPN 2 Katapang (Satria Batara) dalam kompetisi tingkat Kwartir, Cabang, Provinsi, hingga Nasional.
            </p>
          </div>

          <div className={prestasi.length === 0 ? "block" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"}>
            {prestasi.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-white/40 border border-[#D1C9BC] rounded-3xl">
                Belum ada data prestasi kejuaraan pangkalan yang terdaftar.
              </div>
            ) : (
              prestasi.map((item, idx) => (
                <motion.div 
                  key={item.id || idx}
                  whileHover={isDesktop ? { y: -8, rotateZ: idx % 2 === 0 ? 1 : -1 } : {}}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white border border-[#D1C9BC] rounded-2xl overflow-hidden shadow-sm flex flex-col h-96 cursor-pointer hover:border-accent transition-colors"
                >
                  {/* Photo at the top if exists */}
                  {item.gambar ? (
                    <div className="h-40 w-full overflow-hidden border-b border-[#D1C9BC]/40 bg-slate-50">
                      <img src={item.gambar} alt={item.nama_prestasi} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-40 w-full flex items-center justify-center text-accent bg-amber-50 border-b border-[#D1C9BC]/40">
                      <Award className="h-12 w-12" />
                    </div>
                  )}
                  
                  <div className="p-6 flex-1 flex flex-col justify-between text-left">
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full font-bold uppercase">
                          {item.tingkat || 'Kompetisi'}
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-base text-primary mt-2 line-clamp-1">{item.nama_prestasi}</h3>
                      <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                        {item.deskripsi || 'Deskripsi perolehan piala kejuaraan belum dicatat.'}
                      </p>
                    </div>
                    <div className="text-[10px] font-mono text-[#5C3D2E] font-bold mt-2">
                      Tanggal: {item.tanggal}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* EXPEDITION JOURNAL MASONRY GALLERY */}
      <section 
        id="dokumentasi"
        className="py-24 px-6 md:px-12 border-b border-[#D1C9BC] bg-[#F3EFE9] text-left scroll-mt-24"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-mono tracking-widest text-[#5C3D2E] uppercase font-bold">[ GALERI DOKUMENTASI ]</span>
            <h2 className="text-4xl font-serif font-bold text-primary mt-2">Arsip Foto Kegiatan</h2>
            <p className="text-sm text-gray-600 mt-4 leading-relaxed">
              Catatan dokumentasi visual latihan mingguan, pionering tali-temali, penjelajahan alam bebas, dan perkemahan.
            </p>
          </div>

          {/* GALERI CONTAINER */}
          {galeri.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="break-inside-avoid bg-white border border-[#D1C9BC] rounded-2xl overflow-hidden shadow-sm group cursor-pointer relative hover:border-accent transition-all duration-300">
                <img 
                  src="/OPEN_RECTRUITMEN.jpg" 
                  alt="Open Recruitment"
                  className="w-full h-auto object-cover max-h-96 group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="p-4 bg-white border-t border-[#D1C9BC]/40">
                  <h3 className="font-serif font-bold text-sm text-primary">Penerimaan Anggota Baru</h3>
                  <p className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold mt-1">Gudep Satria Batara</p>
                </div>
              </div>
              <div className="break-inside-avoid bg-white border border-[#D1C9BC] rounded-2xl overflow-hidden shadow-sm group cursor-pointer relative hover:border-accent transition-all duration-300">
                <img 
                  src="/tentang_gudep.jpg" 
                  alt="Latihan Bersama"
                  className="w-full h-auto object-cover max-h-96 group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="p-4 bg-white border-t border-[#D1C9BC]/40">
                  <h3 className="font-serif font-bold text-sm text-primary">Latihan Kepemimpinan Lapangan</h3>
                  <p className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold mt-1">Gudep Satria Batara</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {galeri.map((item, idx) => (
                <div 
                  key={item.id || idx}
                  className="break-inside-avoid bg-white border border-[#D1C9BC] rounded-2xl overflow-hidden shadow-sm group cursor-pointer relative hover:border-accent transition-all duration-300"
                >
                  <img 
                    src={item.gambar} 
                    alt={item.judul}
                    className="w-full h-auto object-cover max-h-96 group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="p-4 bg-white border-t border-[#D1C9BC]/40">
                    <h3 className="font-serif font-bold text-sm text-primary">{item.judul}</h3>
                    <p className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold mt-1">Gudep Satria Batara</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* KONTAK SECTION */}
      <section 
        id="kontak"
        className="py-24 px-6 md:px-12 border-b border-[#D1C9BC] bg-[#FBF9F6] text-left scroll-mt-24"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* LEFT: Info Kontak & Peta */}
          <div className="space-y-8">
            <div>
              <span className="text-xs font-mono tracking-widest text-[#5C3D2E] uppercase font-bold">[ SALURAN KOMUNIKASI ]</span>
              <h2 className="text-4xl font-serif font-bold text-primary mt-2">Hubungi Satria Batara</h2>
              <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                Ada pertanyaan mengenai pendaftaran anggota baru Gudep, kegiatan kepramukaan, atau butuh bantuan administrasi? Silakan hubungi kami.
              </p>
            </div>

            <div className="space-y-6 font-mono text-sm text-[#5C3D2E]">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-secondary text-primary rounded-xl shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Pangkalan Gudep</span>
                  <p className="font-serif font-bold text-base text-primary mt-0.5">SMP Negeri 2 Katapang</p>
                  <p className="text-xs text-gray-500 mt-1 font-sans leading-relaxed">
                    SMP Negeri 2 Katapang, Jl. Terusan Kopo No.KM.13, Kec. Katapang, Kabupaten Bandung, Jawa Barat 40971
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-secondary text-primary rounded-xl shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Jam Layanan Sekretariat</span>
                  <p className="font-serif font-bold text-base text-primary mt-0.5">Setiap Hari Latihan</p>
                  <p className="text-xs text-gray-500 mt-1 font-sans">
                    Jumat: 13.30 WIB - 17.00 WIB
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Formulir Kontak */}
          <div className="bg-white border border-[#D1C9BC] rounded-3xl p-8 shadow-sm space-y-6">
            <h3 className="font-serif font-bold text-xl text-primary border-b border-[#D1C9BC]/45 pb-3">Kirim Pesan Langsung</h3>
            {contactSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl">
                Pesan Anda berhasil terkirim! Tim Pembina Gudep akan segera membalas lewat alamat surel yang Anda cantumkan.
              </div>
            )}
            {contactError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl">
                {contactError}
              </div>
            )}
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Nama Lengkap</label>
                <input 
                  name="nama"
                  type="text" 
                  required
                  placeholder="Masukkan nama Anda"
                  className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Alamat Email</label>
                <input 
                  name="email"
                  type="email" 
                  required
                  placeholder="nama@domain.com"
                  className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Isi Pesan Jurnal</label>
                <textarea 
                  name="pesan"
                  rows={4}
                  required
                  placeholder="Tuliskan pesan atau pertanyaan Anda di sini..."
                  className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                ></textarea>
              </div>
              <button 
                type="submit"
                disabled={isSending}
                className="w-full py-3.5 bg-primary text-[#E7E2D8] font-mono font-bold uppercase tracking-wider text-xs rounded-xl shadow-md hover:bg-opacity-95 transition-all cursor-pointer flex justify-center items-center font-bold"
              >
                {isSending ? 'Mengirim...' : 'Kirim Pesan'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-primary text-[#E7E2D8] py-16 px-6 md:px-12 border-t border-[#D1C9BC]/20 text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-white/10 pb-12">
          
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="Logo Satria Batara" 
                className="h-12 w-12 object-contain bg-white/10 p-1.5 rounded-xl border border-white/10" 
              />
              <div>
                <span className="font-serif font-bold text-lg uppercase tracking-wider text-white block leading-tight">Satria Batara</span>
                <span className="text-[10px] font-mono tracking-widest text-accent uppercase font-bold block mt-0.5">GUDEP 28.065 - 28.066</span>
              </div>
            </div>
            <p className="text-xs text-[#C8C2B7] max-w-sm leading-relaxed">
              Satria Batara merupakan pangkalan gerakan pramuka resmi yang berpusat di SMP Negeri 2 Katapang, Kabupaten Bandung. Berfungsi sebagai wadah pembinaan kepemimpinan dan karakter kepanduan untuk membentuk penggalang yang mandiri, disiplin, berakhlak mulia, serta setia pada Dasa Darma.
            </p>
          </div>

          <div className="md:col-span-3 space-y-4">
            <h4 className="font-mono text-xs text-accent uppercase font-bold tracking-widest">[ ALAMAT SEKRETARIAT ]</h4>
            <p className="text-xs text-[#C8C2B7] leading-relaxed">
              SMP Negeri 2 Katapang, Jl. Terusan Kopo No.KM.13, Kec. Katapang, Kabupaten Bandung, Jawa Barat 40971
            </p>
          </div>

          <div className="md:col-span-4 space-y-4">
            <h4 className="font-mono text-xs text-accent uppercase font-bold tracking-widest">[ HUBUNGI KAMI ]</h4>
            <p className="text-xs text-[#C8C2B7] leading-relaxed space-y-1">
              <span>Email: <a href="mailto:gudep@smpn2katapang.sch.id" className="text-white hover:text-accent transition-colors">gudep@smpn2katapang.sch.id</a></span><br/>
              <span>WhatsApp: <a href="https://wa.me/6287825056256" target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent transition-colors">+62 878-2505-6256</a></span>
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-[#C8C2B7]/60">
          <p>© {new Date().getFullYear()} SMP Negeri 2 Katapang. Dibuat dengan semangat kepanduan.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0 font-mono text-[10px]">
            <span className="uppercase">Gudep 28.065 - 28.066</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
