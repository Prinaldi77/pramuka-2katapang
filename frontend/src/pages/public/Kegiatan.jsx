import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Calendar, Search, MapPin, ArrowRight } from 'lucide-react';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { motion } from 'framer-motion';

const Kegiatan = () => {
  const [kegiatanList, setKegiatanList] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const itemsPerPage = 6;

  useEffect(() => {
    const fetchKegiatan = async () => {
      try {
        const res = await api.kegiatan.getAll();
        setKegiatanList(res.data);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchKegiatan();
  }, []);

  const filteredKegiatan = kegiatanList.filter((k) =>
    k.nama_kegiatan.toLowerCase().includes(search.toLowerCase()) ||
    k.lokasi.toLowerCase().includes(search.toLowerCase()) ||
    k.deskripsi.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination Math
  const totalPages = Math.ceil(filteredKegiatan.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredKegiatan.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Agenda Kegiatan</h1>
            <p className="text-sm text-slate-500 mt-1">Daftar agenda latihan rutin, perkemahan, penjelajahan, dan kegiatan kepramukaan lainnya.</p>
          </div>
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kegiatan..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary transition-colors min-h-[44px]"
            />
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <SkeletonLoader type="card" rows={6} />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 font-semibold">Gagal memuat kegiatan. Coba periksa koneksi Anda.</p>
          </div>
        ) : filteredKegiatan.length === 0 ? (
          <EmptyState
            title="Kegiatan Tidak Ditemukan"
            description={search ? `Pencarian "${search}" tidak menemukan kecocokan.` : 'Belum ada agenda kegiatan saat ini.'}
          />
        ) : (
          <>
            {/* Activities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentItems.map((k) => (
                <motion.div
                  key={k.id}
                  whileHover={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' }}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-soft transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-video w-full overflow-hidden bg-slate-100 border-b border-slate-100">
                      <img src={k.gambar} alt={k.nama_kegiatan} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="flex flex-wrap gap-3 text-[10px] font-semibold text-slate-400">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{k.tanggal}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="truncate max-w-[120px]">{k.lokasi}</span>
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-base line-clamp-2 hover:text-primary">
                        <Link to={`/kegiatan/${k.id}`}>{k.nama_kegiatan}</Link>
                      </h3>
                      <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed">
                        {k.deskripsi}
                      </p>
                    </div>
                  </div>
                  <div className="px-6 pb-6 pt-2">
                    <Link
                      to={`/kegiatan/${k.id}`}
                      className="inline-flex items-center text-xs font-bold text-primary hover:underline min-h-[44px]"
                    >
                      Lihat Rincian Kegiatan
                      <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 pt-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 min-h-[44px]"
                >
                  Sebelumnya
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg min-h-[44px] ${
                      currentPage === i + 1
                        ? 'bg-primary text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 min-h-[44px]"
                >
                  Berikutnya
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default Kegiatan;
