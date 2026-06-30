import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { motion } from 'framer-motion';
import { Users, Shield, Crown, UserCheck, ShieldAlert, Award } from 'lucide-react';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

const Kepengurusan = () => {
  useDocumentMetadata('Susunan Organisasi & Kepengurusan', 'Struktur organisasi pembina Gugus Depan dan dewan pengurus penggalang aktif Pramuka SMP Negeri 2 Katapang.');

  const [pembinaList, setPembinaList] = useState([]);
  const [pengurusList, setPengurusList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        const [pembinaRes, pengurusRes] = await Promise.all([
          api.pembina.getAll(),
          api.pengurus.getAll(),
        ]);
        setPembinaList(pembinaRes.data || []);
        setPengurusList(pengurusRes.data || []);
      } catch (err) {
        console.error('Error fetching organizational data:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchOrgData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-red-500 font-semibold text-lg">Gagal memuat struktur kepengurusan.</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg">Coba Lagi</button>
      </div>
    );
  }

  // Filter pengurus harian (Pratama, Sekretaris, Bendahara)
  const dewanHarian = pengurusList.filter(p => 
    p.jabatan.toLowerCase().includes('pratama') || 
    p.jabatan.toLowerCase().includes('sekretaris') || 
    p.jabatan.toLowerCase().includes('bendahara')
  );

  const dewanSeksi = pengurusList.filter(p => 
    !dewanHarian.some(dh => dh.id === p.id)
  );

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Header Halaman */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-primary-800 border border-emerald-200">
            Satria Batara Organisasi
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight leading-none uppercase">
            Struktur Kepengurusan
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Struktur kepemimpinan dan dewan koordinasi Gugus Depan Pramuka 28.065-28.066 Pangkalan SMP Negeri 2 Katapang Periode Aktif.
          </p>
        </div>

        {/* 1. Majelis Pembimbing Gugus Depan (Mabigus) */}
        <div className="space-y-6">
          <div className="flex items-center justify-center space-x-2.5">
            <Shield className="h-6 w-6 text-emerald-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Pelindung & Penasehat</h2>
          </div>
          <div className="flex justify-center">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-soft max-w-md w-full text-center space-y-3"
            >
              <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-xl mb-1">
                <Crown className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-lg">Kepala Sekolah SMPN 2 Katapang</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Ketua Mabigus (Majelis Pembimbing Gugus Depan)</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Penanggung jawab utama seluruh kegiatan kepramukaan di lingkungan pangkalan SMP Negeri 2 Katapang.
              </p>
            </motion.div>
          </div>
        </div>

        {/* 2. Pembina Gugus Depan */}
        <div className="space-y-8">
          <div className="flex items-center justify-center space-x-2.5">
            <Users className="h-6 w-6 text-emerald-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Majelis Pembina Gudep</h2>
          </div>
          {pembinaList.length === 0 ? (
            <p className="text-center text-xs text-slate-400 italic">Belum ada data Pembina yang terdaftar.</p>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {pembinaList.map((p) => (
                <motion.div 
                  key={p.id}
                  variants={itemVariants}
                  whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' }}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-soft space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl w-fit">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-base">{p.nama}</h3>
                      <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">{p.jabatan}</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex flex-col space-y-1 text-xs text-slate-500">
                    <span className="flex justify-between">
                      <span className="font-semibold text-slate-400">NIP/NTA:</span>
                      <span className="font-medium text-slate-700">{p.nip || '-'}</span>
                    </span>
                    <span className="flex justify-between">
                      <span className="font-semibold text-slate-400">Telepon:</span>
                      <span className="font-medium text-slate-700">{p.telepon || '-'}</span>
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* 3. Dewan Kerja Penggalang (Dewan Galang) */}
        <div className="space-y-8">
          <div className="flex items-center justify-center space-x-2.5">
            <Award className="h-6 w-6 text-emerald-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Dewan Kerja Penggalang</h2>
          </div>

          {pengurusList.length === 0 ? (
            <p className="text-center text-xs text-slate-400 italic">Belum ada data Pengurus Dewan Galang yang aktif.</p>
          ) : (
            <div className="space-y-10">
              
              {/* Dewan Pengurus Harian */}
              {dewanHarian.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-center text-xs font-bold uppercase tracking-wider text-slate-400">Pengurus Harian</h3>
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center"
                  >
                    {dewanHarian.map((p) => (
                      <motion.div 
                        key={p.id}
                        variants={itemVariants}
                        whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' }}
                        className="bg-white border border-primary-100 rounded-2xl p-6 shadow-soft space-y-4 flex flex-col justify-between relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 bg-primary/10 text-primary px-3 py-1 text-[9px] font-bold rounded-bl-xl uppercase tracking-wider">
                          DPH
                        </div>
                        <div className="space-y-3">
                          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl w-fit">
                            <Crown className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-slate-800 text-base">{p.nama}</h3>
                            <p className="text-xs text-primary-700 font-bold uppercase mt-0.5">{p.jabatan}</p>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-slate-100 flex flex-col space-y-1 text-xs text-slate-500">
                          <span className="flex justify-between">
                            <span className="font-semibold text-slate-400">Kelas:</span>
                            <span className="font-medium text-slate-700">{p.kelas}</span>
                          </span>
                          <span className="flex justify-between">
                            <span className="font-semibold text-slate-400">Periode:</span>
                            <span className="font-medium text-slate-700">{p.periode}</span>
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              )}

              {/* Dewan Seksi Bidang */}
              {dewanSeksi.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-center text-xs font-bold uppercase tracking-wider text-slate-400">Seksi / Koordinator Bidang</h3>
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                  >
                    {dewanSeksi.map((p) => (
                      <motion.div 
                        key={p.id}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white border border-slate-200 rounded-xl p-4 shadow-soft space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="p-2 bg-slate-50 text-slate-600 rounded-lg w-fit">
                            <UserCheck className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm leading-tight">{p.nama}</h4>
                            <p className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">{p.jabatan}</p>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-slate-100 flex flex-col space-y-1 text-[10px] text-slate-400">
                          <span className="flex justify-between">
                            <span>Kelas:</span>
                            <span className="font-medium text-slate-600">{p.kelas}</span>
                          </span>
                          <span className="flex justify-between">
                            <span>Periode:</span>
                            <span className="font-medium text-slate-600">{p.periode}</span>
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Kepengurusan;
