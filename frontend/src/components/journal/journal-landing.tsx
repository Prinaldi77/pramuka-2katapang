'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { sendContactMessageAction } from '@/app/actions/pesan';
import { motion, AnimatePresence } from 'framer-motion';
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
  Heart,
  X
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
  kepengurusan: any[];
}

export default function JournalLanding({ stats, kegiatan, prestasi, galeri, kepengurusan }: JournalLandingProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [isSending, startSending] = useTransition();

  const [activeDetail, setActiveDetail] = useState<{
    type: 'kegiatan' | 'prestasi';
    title: string;
    description: string;
    date: string;
    locationOrTingkat?: string;
    gambar?: string;
  } | null>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (activeDetail) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeDetail]);

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDetail(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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

        // Horizontal parallax for the background image
        gsap.fromTo('.timeline-bg',
          { xPercent: 0 },
          {
            xPercent: -15,
            ease: 'none',
            scrollTrigger: {
              trigger: timelineRef.current,
              scrub: 1,
              start: 'top top',
              end: () => `+=${timelineRef.current?.offsetWidth}`,
            }
          }
        );
      }
    });

    // Vertical parallax for the background image on mobile/tablet (Only for screen widths < 1024px)
    mm.add("(max-width: 1023px)", () => {
      gsap.fromTo('.timeline-bg',
        { yPercent: -10 },
        {
          yPercent: 10,
          ease: 'none',
          scrollTrigger: {
            trigger: timelineRef.current,
            scrub: true,
            start: 'top bottom',
            end: 'bottom top',
          }
        }
      );
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

  // Ambient Particle System (Scout History Archive Atmosphere)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 0.5; // Small and subtle
        this.speedX = (Math.random() - 0.5) * 0.15; // Slow drift
        this.speedY = -(Math.random() * 0.25 + 0.08); // Drift upwards slowly
        this.opacity = Math.random() * 0.4 + 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Reset particle when it goes off screen
        if (this.y < -10 || this.x < -10 || this.x > width + 10) {
          this.y = height + 10;
          this.x = Math.random() * width;
          this.opacity = 0;
        }

        // Fade in slowly if near bottom, or keep subtle pended opacity
        if (this.opacity < 0.5) {
          this.opacity += 0.003;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(209, 201, 188, ${this.opacity})`;
        ctx.fill();
      }
    }

    const particlesArray: Particle[] = [];
    const numberOfParticles = Math.min(60, Math.floor((width * height) / 18000));
    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
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
          <a href="#kepengurusan" className="hover:text-accent transition-colors">Kepengurusan</a>
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
             GUDEP 28.065 - 28.066 
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
        <div 
          className="timeline-bg absolute left-0 top-0 w-[125%] h-full bg-[url('/tentang_gudep.jpg')] bg-cover bg-center pointer-events-none"
          style={{ 
            filter: 'sepia(40%) grayscale(60%) contrast(1.1) brightness(0.95)',
            opacity: 0.22,
            maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)'
          }}
        />
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-0"
        />
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
                  onClick={() => setActiveDetail({
                    type: 'kegiatan',
                    title: item.nama_kegiatan,
                    description: item.deskripsi || 'Tidak ada deskripsi.',
                    date: item.tanggal,
                    locationOrTingkat: item.lokasi || 'SMPN 2 Katapang',
                    gambar: item.gambar
                  })}
                  className="w-[85vw] lg:w-[45vw] timeline-card flex-shrink-0 p-8 border border-[#D1C9BC] rounded-2xl mr-4 lg:mr-8 bg-white/90 backdrop-blur-md flex flex-row justify-between h-80 shadow-md hover:border-primary transition-all text-left snap-center lg:snap-align-none cursor-pointer group"
                >
                  <div className="flex flex-col justify-between flex-1 pr-4">
                    <span className="text-5xl font-serif italic text-accent font-light">{year}</span>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-primary group-hover:text-accent transition-colors">{item.nama_kegiatan}</h3>
                      <p className="text-sm text-gray-700 mt-2 leading-relaxed line-clamp-3">
                        {item.deskripsi}
                      </p>
                    </div>
                  </div>
                  {item.gambar && (
                    <div className="w-1/3 h-full rounded-xl overflow-hidden border border-[#D1C9BC]/40 bg-slate-50 flex-shrink-0">
                      <img src={item.gambar} alt={item.nama_kegiatan} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* KEPENGURUSAN SECTION */}
      <section 
        id="kepengurusan"
        className="py-24 px-6 md:px-12 border-b border-[#D1C9BC] bg-[#E6DFD3]/15 text-left scroll-mt-24"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-mono tracking-widest text-[#5C3D2E] uppercase font-bold">[ STRUKTUR ORGANISASI ]</span>
            <h2 className="text-4xl font-serif font-bold text-primary mt-2">Susunan Kepengurusan Gudep</h2>
            <p className="text-sm text-gray-600 mt-4 leading-relaxed">
              Mulai dari Majelis Pembimbing Gugus Depan, Pembina Satuan, hingga Dewan Penggalang Utama (Pratama, Sekretaris, dan Bendahara).
            </p>
          </div>

          <div className="relative mt-12">
            {(() => {
              const defaultKepengurusan = [
                {
                  id: 'fallback-kamabigus',
                  nama: 'Drs. H. Maman Santoso, M.Pd.',
                  jabatan: 'Kamabigus',
                  foto_profil: '',
                  type: 'pembina',
                  periode: ''
                },
                {
                  id: 'fallback-pembinaputra',
                  nama: 'Kak Ahmad Dahlan, S.Pd.',
                  jabatan: 'Pembina Satuan Putra',
                  foto_profil: '',
                  type: 'pembina',
                  periode: ''
                },
                {
                  id: 'fallback-pembinaputri',
                  nama: 'Kak Siti Nurhaliza, S.Pd.',
                  jabatan: 'Pembina Satuan Putri',
                  foto_profil: '',
                  type: 'pembina',
                  periode: ''
                },
                {
                  id: 'fallback-pratamaputra',
                  nama: 'Rafi Ahmad Fauzi',
                  jabatan: 'Pratama Putra',
                  foto_profil: '',
                  type: 'siswa',
                  periode: '2025/2026'
                },
                {
                  id: 'fallback-pratamaputri',
                  nama: 'Nabila Syakieb',
                  jabatan: 'Pratama Putri',
                  foto_profil: '',
                  type: 'siswa',
                  periode: '2025/2026'
                },
                {
                  id: 'fallback-sekre1',
                  nama: 'Andi Wijaya',
                  jabatan: 'Sekretaris 1',
                  foto_profil: '',
                  type: 'siswa',
                  periode: '2025/2026'
                },
                {
                  id: 'fallback-sekre2',
                  nama: 'Cinta Laura',
                  jabatan: 'Sekretaris 2',
                  foto_profil: '',
                  type: 'siswa',
                  periode: '2025/2026'
                },
                {
                  id: 'fallback-bendahara1',
                  nama: 'Denny Sumargo',
                  jabatan: 'Bendahara 1',
                  foto_profil: '',
                  type: 'siswa',
                  periode: '2025/2026'
                },
                {
                  id: 'fallback-bendahara2',
                  nama: 'Gita Gutawa',
                  jabatan: 'Bendahara 2',
                  foto_profil: '',
                  type: 'siswa',
                  periode: '2025/2026'
                }
              ];

              const finalKepengurusan = defaultKepengurusan.map(def => {
                const normDef = def.jabatan.toLowerCase().trim();
                const dbRecord = kepengurusan.find(k => {
                  const normK = k.jabatan.toLowerCase().trim();
                  return normK === normDef || normK.includes(normDef) || normDef.includes(normK);
                });
                return dbRecord || def;
              });

              // Extract individual roles for structured rendering
              const kamabigus = finalKepengurusan.find(k => k.jabatan.toLowerCase().includes('kamabigus')) || finalKepengurusan[0];
              const pembinaPutra = finalKepengurusan.find(k => k.jabatan.toLowerCase().includes('pembina putra') || k.jabatan.toLowerCase().includes('pembina satuan putra') || k.jabatan.toLowerCase() === 'pembina putra') || finalKepengurusan[1];
              const pembinaPutri = finalKepengurusan.find(k => k.jabatan.toLowerCase().includes('pembina putri') || k.jabatan.toLowerCase().includes('pembina satuan putri') || k.jabatan.toLowerCase() === 'pembina putri') || finalKepengurusan[2];
              const pratamaPutra = finalKepengurusan.find(k => k.jabatan.toLowerCase().includes('pratama putra')) || finalKepengurusan[3];
              const pratamaPutri = finalKepengurusan.find(k => k.jabatan.toLowerCase().includes('pratama putri')) || finalKepengurusan[4];
              const sekretaris1 = finalKepengurusan.find(k => k.jabatan.toLowerCase().includes('sekretaris 1')) || finalKepengurusan[5];
              const sekretaris2 = finalKepengurusan.find(k => k.jabatan.toLowerCase().includes('sekretaris 2')) || finalKepengurusan[6];
              const bendahara1 = finalKepengurusan.find(k => k.jabatan.toLowerCase().includes('bendahara 1')) || finalKepengurusan[7];
              const bendahara2 = finalKepengurusan.find(k => k.jabatan.toLowerCase().includes('bendahara 2')) || finalKepengurusan[8];

              const renderCard = (item: any) => (
                <div className="flex bg-white border-2 border-primary rounded-xl overflow-hidden shadow-md max-w-sm w-full transition-transform hover:scale-[1.03] duration-300 mx-auto z-10 relative">
                  {/* Left side: square photo */}
                  <div className="w-20 h-20 shrink-0 bg-[#FBF9F6] border-r border-[#D1C9BC] flex items-center justify-center overflow-hidden">
                    {item.foto_profil ? (
                      <img src={item.foto_profil} alt={item.nama} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <Compass className="h-10 w-10 text-primary/45" />
                    )}
                  </div>
                  
                  {/* Right side: text details */}
                  <div className="flex flex-col flex-grow min-w-0 justify-between">
                    {/* Top: Position */}
                    <div className="bg-primary px-3 py-1.5 flex items-center">
                      <span className="text-[10px] md:text-xs font-mono font-bold uppercase tracking-wider text-[#E7E2D8] truncate">
                        {item.jabatan}
                      </span>
                    </div>
                    {/* Bottom: Name */}
                    <div className="px-3 py-2 flex-grow flex items-center bg-[#FBF9F6]">
                      <h4 className="font-serif font-bold text-sm md:text-base text-primary italic truncate w-full" title={item.nama}>
                        {item.nama}
                      </h4>
                    </div>
                    {item.periode && (
                      <div className="px-3 pb-1 bg-[#FBF9F6]">
                        <span className="text-[8px] font-mono text-gray-400">
                          Periode: {item.periode}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );

              return (
                <div className="relative max-w-5xl mx-auto space-y-12 md:space-y-0">
                  {/* Vertical central stem line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#D1C9BC] -translate-x-1/2 hidden md:block"></div>

                  {/* Level 1: Kamabigus (Center Top) */}
                  <div className="relative flex justify-center pb-8 md:pb-12">
                    {renderCard(kamabigus)}
                  </div>

                  {/* Level 2: Pembina (Left / Right) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-24 relative py-6 items-center">
                    {/* Left: Pembina Putra */}
                    <div className="flex justify-end relative">
                      <div className="absolute right-0 top-1/2 w-12 h-px border-t-2 border-dashed border-[#D1C9BC] -translate-y-1/2 translate-x-full hidden md:block"></div>
                      {renderCard(pembinaPutra)}
                    </div>
                    {/* Right: Pembina Putri */}
                    <div className="flex justify-start relative">
                      <div className="absolute left-0 top-1/2 w-12 h-px border-t-2 border-dashed border-[#D1C9BC] -translate-y-1/2 -translate-x-full hidden md:block"></div>
                      {renderCard(pembinaPutri)}
                    </div>
                  </div>

                  {/* Level 3: Pratama (Left / Right) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-24 relative py-6 items-center">
                    {/* Left: Pratama Putra */}
                    <div className="flex justify-end relative">
                      <div className="absolute right-0 top-1/2 w-12 h-px border-t-2 border-dashed border-[#D1C9BC] -translate-y-1/2 translate-x-full hidden md:block"></div>
                      {renderCard(pratamaPutra)}
                    </div>
                    {/* Right: Pratama Putri */}
                    <div className="flex justify-start relative">
                      <div className="absolute left-0 top-1/2 w-12 h-px border-t-2 border-dashed border-[#D1C9BC] -translate-y-1/2 -translate-x-full hidden md:block"></div>
                      {renderCard(pratamaPutri)}
                    </div>
                  </div>

                  {/* Level 4: Sekretaris (Left / Right) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-24 relative py-6 items-center">
                    {/* Left: Sekretaris 1 */}
                    <div className="flex justify-end relative">
                      <div className="absolute right-0 top-1/2 w-12 h-px border-t-2 border-dashed border-[#D1C9BC] -translate-y-1/2 translate-x-full hidden md:block"></div>
                      {renderCard(sekretaris1)}
                    </div>
                    {/* Right: Sekretaris 2 */}
                    <div className="flex justify-start relative">
                      <div className="absolute left-0 top-1/2 w-12 h-px border-t-2 border-dashed border-[#D1C9BC] -translate-y-1/2 -translate-x-full hidden md:block"></div>
                      {renderCard(sekretaris2)}
                    </div>
                  </div>

                  {/* Level 5: Bendahara (Left / Right) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-24 relative py-6 items-center">
                    {/* Left: Bendahara 1 */}
                    <div className="flex justify-end relative">
                      <div className="absolute right-0 top-1/2 w-12 h-px border-t-2 border-dashed border-[#D1C9BC] -translate-y-1/2 translate-x-full hidden md:block"></div>
                      {renderCard(bendahara1)}
                    </div>
                    {/* Right: Bendahara 2 */}
                    <div className="flex justify-start relative">
                      <div className="absolute left-0 top-1/2 w-12 h-px border-t-2 border-dashed border-[#D1C9BC] -translate-y-1/2 -translate-x-full hidden md:block"></div>
                      {renderCard(bendahara2)}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
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
              <h2 className="text-4xl font-serif font-bold text-primary mt-2">Prestasi Kejuaraan</h2>
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
                  onClick={() => setActiveDetail({
                    type: 'prestasi',
                    title: item.nama_prestasi,
                    description: item.deskripsi || 'Deskripsi perolehan piala kejuaraan belum dicatat.',
                    date: item.tanggal,
                    locationOrTingkat: item.tingkat || 'Ranting',
                    gambar: item.gambar
                  })}
                  className="bg-white border border-[#D1C9BC] rounded-2xl overflow-hidden shadow-sm flex flex-col h-96 cursor-pointer hover:border-accent transition-colors"
                >
                  {/* Photo at the top if exists */}
                  {item.gambar ? (
                    <div className="h-40 w-full overflow-hidden border-b border-[#D1C9BC]/40 bg-slate-50">
                      <img src={item.gambar} alt={item.nama_prestasi} className="w-full h-full object-cover" loading="lazy" />
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
                  loading="lazy"
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
                  loading="lazy"
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
                    loading="lazy"
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
                    Komplek Gading Junti Asri, Desa Sangkanhurip, Kecamatan Katapang, Kabupaten Bandung, Jawa Barat 40971
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
                    Jumat: 08.00 WIB - 15.00 WIB
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
                <label className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Pesan</label>
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
              Komplek Gading Junti Asri, Desa Sangkanhurip, Kecamatan Katapang, Kabupaten Bandung, Jawa Barat 40971
            </p>
          </div>

          <div className="md:col-span-4 space-y-4">
            <h4 className="font-mono text-xs text-accent uppercase font-bold tracking-widest">[ HUBUNGI KAMI ]</h4>
            <p className="text-xs text-[#C8C2B7] leading-relaxed space-y-1">
              <span>Email: <a href="mailto:pramuka2katapang@gmail.com" className="text-white hover:text-accent transition-colors">pramuka2katapang@gmail.com</a></span><br/>
              <span>WhatsApp: <a href="https://wa.me/6287825056256" target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent transition-colors">+62 878-2505-6256</a></span>
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-[#C8C2B7]/60">
          <p>© {new Date().getFullYear()} Pramuka SMP Negeri 2 Katapang.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0 font-mono text-[10px]">
            <span className="uppercase">Gudep 28.065 - 28.066</span>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {activeDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveDetail(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#FBF9F6] border border-[#D1C9BC] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl relative cursor-default flex flex-col"
            >
              {/* Close Button */}
              <button 
                onClick={() => setActiveDetail(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-md hover:text-black transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Image Header if exists */}
              {activeDetail.gambar && (
                <div className="h-64 sm:h-80 w-full overflow-hidden shrink-0 border-b border-[#D1C9BC]/40 bg-slate-100 relative">
                  <img src={activeDetail.gambar} alt={activeDetail.title} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Modal Body */}
              <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {activeDetail.type === 'prestasi' ? 'Prestasi Kejuaraan' : 'Kegiatan / Sejarah'}
                  </span>
                  {activeDetail.locationOrTingkat && (
                    <span className="text-[9px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {activeDetail.locationOrTingkat}
                    </span>
                  )}
                </div>

                <h3 className="font-serif font-bold text-2xl sm:text-3xl text-primary leading-tight">
                  {activeDetail.title}
                </h3>

                <div className="flex flex-wrap gap-4 text-xs font-mono text-gray-500 pt-1 border-y border-[#D1C9BC]/30 py-3">
                  <div className="flex items-center">
                    <Calendar className="mr-1.5 h-3.5 w-3.5 text-accent" />
                    Tanggal: {activeDetail.date}
                  </div>
                </div>

                <div className="prose max-w-none pt-2">
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-sans whitespace-pre-wrap">
                    {activeDetail.description}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
