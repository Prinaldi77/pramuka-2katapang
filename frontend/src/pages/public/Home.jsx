import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Calendar, ArrowRight, Award, Users, FileText, Image, Crown, Shield } from 'lucide-react';
import heroBg from '../../assets/OPEN_RECTRUITMEN.jpg';
import tentangGudepImg from '../../assets/tentang_gudep.jpg';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';

const Home = () => {
  useDocumentMetadata('Beranda', 'Selamat datang di website resmi Gugus Depan Pramuka SMP Negeri 2 Katapang. Wadah kepanduan kreatif untuk menempa karakter pemuda tangguh, mandiri, dan berjiwa kepemimpinan.');

  const [kegiatan, setKegiatan] = useState([]);
  const [galeri, setGaleri] = useState([]);
  const [stats, setStats] = useState({ siswa: 0, pembina: 0, pengurus: 0, kegiatan: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kegiatanRes, galeriRes, siswaRes, pembinaRes, pengurusRes] = await Promise.all([
          api.kegiatan.getAll(),
          api.galeri.getAll(),
          api.siswa.getAll().catch(() => ({ data: [] })),
          api.pembina.getAll().catch(() => ({ data: [] })),
          api.pengurus.getAll().catch(() => ({ data: [] })),
        ]);

        setKegiatan(kegiatanRes.data.slice(0, 2));
        setGaleri(galeriRes.data.slice(0, 4));
        setStats({
          siswa: (siswaRes && siswaRes.data) ? siswaRes.data.length : 0,
          pembina: (pembinaRes && pembinaRes.data) ? pembinaRes.data.length : 0,
          pengurus: (pengurusRes && pengurusRes.data) ? pengurusRes.data.length : 0,
          kegiatan: (kegiatanRes && kegiatanRes.data) ? kegiatanRes.data.length : 0,
        });
      } catch (err) {
        console.error('Error fetching landing data:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="w-full bg-slate-50 min-h-screen">
      
      {/* Bagian Hero */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-24 sm:py-32 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Grafis Latar Belakang */}
        <div className="absolute inset-0 bg-radial-gradient from-slate-800 to-slate-950 opacity-90 z-0"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl z-0"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl z-0"></div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-800/80 border border-primary-700/50 text-emerald-300">
              Pramuka Penggalang SMPN 2 Katapang
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Satyaku Kudarmakan,<br className="hidden sm:inline"/>
              <span className="text-emerald-400">Darmaku Kubaktikan</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Selamat datang di website resmi Gugus Depan Pramuka SMP Negeri 2 Katapang. Wadah kepanduan kreatif untuk menempa karakter pemuda tangguh, mandiri, dan berjiwa kepemimpinan.
            </p>

          </div>
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-800/60 shadow-2xl glass max-w-[280px] sm:max-w-[320px] transition-transform duration-300 hover:scale-105">
              <img src={heroBg} alt="Logo Gudep" className="w-full h-auto object-contain drop-shadow-[0_0_25px_rgba(16,40,16,0.5)]" />
            </div>
          </div>
        </div>
      </section>

      {/* Bagian Statistik */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-10 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div data-aos="zoom-in" data-aos-delay="100" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft flex items-center space-x-4">
            <div className="p-3.5 bg-emerald-50 text-primary rounded-xl"><Users className="h-6 w-6" /></div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.siswa}</p>
              <p className="text-xs text-slate-500 font-medium">Siswa Terdaftar</p>
            </div>
          </div>
          <div data-aos="zoom-in" data-aos-delay="200" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft flex items-center space-x-4">
            <div className="p-3.5 bg-emerald-50 text-primary rounded-xl"><Users className="h-6 w-6" /></div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.pembina}</p>
              <p className="text-xs text-slate-500 font-medium">Kakak Pembina</p>
            </div>
          </div>
          <div data-aos="zoom-in" data-aos-delay="300" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft flex items-center space-x-4">
            <div className="p-3.5 bg-emerald-50 text-primary rounded-xl"><Users className="h-6 w-6" /></div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.pengurus}</p>
              <p className="text-xs text-slate-500 font-medium">Dewan Pengurus</p>
            </div>
          </div>
          <div data-aos="zoom-in" data-aos-delay="400" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft flex items-center space-x-4">
            <div className="p-3.5 bg-emerald-50 text-primary rounded-xl"><Calendar className="h-6 w-6" /></div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.kegiatan}</p>
              <p className="text-xs text-slate-500 font-medium">Agenda Kegiatan</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bagian Tentang Gudep */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div data-aos="fade-up" className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-soft grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Membangun Karakter Melalui Gerakan Pramuka
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Gugus Depan Pramuka di SMP Negeri 2 Katapang menanamkan kedisiplinan dan keterampilan kepanduan yang diadaptasi dari SKU (Syarat Kecakapan Umum) Pramuka Penggalang. Melalui latihan terstruktur mingguan, perkemahan, penjelajahan, dan bakti sosial, para penggalang di didik untuk cinta tanah air, mandiri, peduli sesama, tanggap darurat, dan menjunjung asas kepramukaan.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start space-x-2">
                <Award className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Disiplin & Tangguh</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Berakar pada nilai Dasa Darma.</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Award className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Kecakapan Hidup</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Pionering, navigasi,LKBB.</p>
                </div>
              </div>
            </div>
          </div>
          <div data-aos="fade-left" className="rounded-2xl overflow-hidden aspect-video border border-slate-200 shadow-soft">
            <img src={tentangGudepImg} alt="Anggota Pramuka Penggalang" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Bagian Berita Terkini & Agenda */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Kolom Kiri: Struktur Kepemimpinan */}
        <div data-aos="fade-up" className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-end border-b border-slate-200 pb-3">
            <h2 className="text-2xl font-bold text-slate-800">Struktur Kepemimpinan</h2>
            <Link to="/kepengurusan" className="text-sm font-semibold text-primary hover:underline flex items-center">
              Lihat Semua Pengurus <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Kartu Kamabigus */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-soft hover:shadow-md transition-shadow flex flex-col justify-between text-center space-y-4">
              <div className="mx-auto p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit">
                <Crown className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">Kepala Sekolah</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Ketua Kamabigus</p>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Penanggung jawab pangkalan SMPN 2 Katapang.
                </p>
              </div>
            </div>

            {/* Kartu Pembina */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-soft hover:shadow-md transition-shadow flex flex-col justify-between text-center space-y-4">
              <div className="mx-auto p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">Kakak Pembina</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Pembina Gudep</p>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Pembina utama Gugus Depan 11.083 - 11.084.
                </p>
              </div>
            </div>

            {/* Kartu Pratama */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-soft hover:shadow-md transition-shadow flex flex-col justify-between text-center space-y-4">
              <div className="mx-auto p-3 bg-amber-50 text-amber-600 rounded-2xl w-fit">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">Pratama</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Ketua Dewan PGalang</p>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Pemimpin dewan pengurus penggalang aktif.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Kegiatan Terdekat */}
        <div data-aos="fade-up" data-aos-delay="200" className="lg:col-span-4 space-y-6">
          <div className="flex justify-between items-end border-b border-slate-200 pb-3">
            <h2 className="text-2xl font-bold text-slate-800">Kegiatan Terdekat</h2>
            <Link to="/kegiatan" className="text-sm font-semibold text-primary hover:underline flex items-center">
              Semua Kegiatan <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {loading ? (
            <SkeletonLoader type="list" rows={2} />
          ) : error ? (
            <p className="text-sm text-red-500">Gagal memuat kegiatan.</p>
          ) : kegiatan.length === 0 ? (
            <p className="text-sm text-slate-500">Tidak ada kegiatan terdekat.</p>
          ) : (
            <div className="space-y-4">
              {kegiatan.map((k) => (
                <div key={k.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft flex space-x-4 hover:border-primary/40 transition-colors">
                  <div className="bg-emerald-50 text-primary p-3 h-fit rounded-xl flex flex-col items-center justify-center font-bold text-xs w-14 flex-shrink-0">
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500">TGL</span>
                    <span className="text-lg text-primary-800 leading-none">{k.tanggal.split('-')[2]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 text-sm truncate hover:text-primary">
                      <Link to={`/kegiatan/${k.id}`}>{k.nama_kegiatan}</Link>
                    </h3>
                    <p className="text-xs text-slate-500 truncate mt-1">{k.lokasi}</p>
                    <p className="text-[10px] text-slate-400 mt-2">{k.tanggal}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </section>

      {/* Bagian Galeri */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-aos="fade-up">
        <div className="flex justify-between items-end border-b border-slate-200 pb-3 mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Galeri Kegiatan</h2>
          <Link to="/galeri" className="text-sm font-semibold text-primary hover:underline flex items-center">
            Semua Foto <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {loading ? (
          <SkeletonLoader type="card" rows={4} />
        ) : error ? (
          <p className="text-sm text-red-500">Gagal memuat galeri.</p>
        ) : galeri.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada foto galeri.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galeri.map((g, i) => (
              <div key={g.id} data-aos="zoom-in" data-aos-delay={i * 100} className="relative group overflow-hidden rounded-2xl aspect-square bg-slate-100 border border-slate-200 shadow-soft">
                <img src={g.gambar} alt={g.judul} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div className="text-white">
                    <p className="font-bold text-xs truncate">{g.judul}</p>
                    <p className="text-[10px] text-slate-300 truncate mt-0.5">{g.deskripsi}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default Home;
