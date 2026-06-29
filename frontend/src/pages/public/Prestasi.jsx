import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Award, Calendar, Search } from 'lucide-react';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { motion } from 'framer-motion';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';

const Prestasi = () => {
  useDocumentMetadata('Prestasi Gudep', 'Daftar raihan prestasi, piagam penghargaan, juara perlombaan tingkat regional dan nasional yang diraih oleh Pramuka SMP Negeri 2 Katapang.');

  const [prestasiList, setPrestasiList] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPrestasi = async () => {
      try {
        const res = await api.prestasi.getAll();
        setPrestasiList(res.data);
      } catch (err) {
        console.error('Error fetching achievements:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPrestasi();
  }, []);

  const filteredPrestasi = prestasiList.filter((p) =>
    p.judul.toLowerCase().includes(search.toLowerCase()) ||
    p.deskripsi.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Halaman */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Galeri Prestasi Gudep</h1>
            <p className="text-sm text-slate-500 mt-1">Daftar pencapaian, piala, dan penghargaan yang berhasil diraih oleh Pramuka SMPN 2 Katapang.</p>
          </div>
          {/* Kolom Pencarian */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari prestasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary transition-colors min-h-[44px]"
            />
          </div>
        </div>

        {/* Daftar Konten */}
        {loading ? (
          <SkeletonLoader type="card" rows={4} />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 font-semibold">Gagal memuat daftar prestasi. Coba periksa koneksi Anda.</p>
          </div>
        ) : filteredPrestasi.length === 0 ? (
          <EmptyState
            title="Prestasi Tidak Ditemukan"
            description={search ? `Pencarian "${search}" tidak menemukan kecocokan.` : 'Belum ada prestasi yang dicatat.'}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredPrestasi.map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ scale: 1.02, y: -4 }}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-soft transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Foto Prestasi */}
                  {p.gambar ? (
                    <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
                      <img src={p.gambar} alt={p.judul} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 px-2.5 py-1 bg-amber-500 text-white rounded-lg flex items-center space-x-1.5 shadow-sm">
                        <Award className="h-4 w-4" />
                        <span className="text-[10px] font-bold tracking-wider uppercase">Prestasi</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center border-b border-slate-100">
                      <div className="p-4 bg-amber-100/80 text-amber-600 rounded-full">
                        <Award className="h-10 w-10" />
                      </div>
                    </div>
                  )}

                  {/* Keterangan */}
                  <div className="p-6 space-y-3">
                    <span className="inline-flex items-center text-[10px] text-slate-400 font-semibold space-x-1 bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-md">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      <span>{p.tanggal}</span>
                    </span>
                    <h3 className="font-bold text-slate-800 text-lg leading-snug">
                      {p.judul}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                      {p.deskripsi}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Prestasi;
