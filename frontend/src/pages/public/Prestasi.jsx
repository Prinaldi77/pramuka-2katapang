import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Award, Calendar, Search } from 'lucide-react';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { motion } from 'framer-motion';

const Prestasi = () => {
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
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Galeri Prestasi</h1>
            <p className="text-sm text-slate-500 mt-1">Daftar pencapaian, piala, dan penghargaan yang berhasil diraih oleh Pramuka SMPN 2 Katapang.</p>
          </div>
          {/* Search Input */}
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

        {/* Content Section */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPrestasi.map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' }}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-soft flex items-start space-x-4 transition-all duration-200"
              >
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl flex-shrink-0">
                  <Award className="h-6 w-6" />
                </div>
                <div className="space-y-2 flex-1 min-w-0">
                  <span className="flex items-center text-[10px] text-slate-400 font-semibold space-x-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{p.tanggal}</span>
                  </span>
                  <h3 className="font-bold text-slate-800 text-base leading-tight">
                    {p.judul}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {p.deskripsi}
                  </p>
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
