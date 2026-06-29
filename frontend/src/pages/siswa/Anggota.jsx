import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Users, Search, User, Compass } from 'lucide-react';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { motion } from 'framer-motion';

const Anggota = () => {
  const toast = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.siswa.getAll();
        setMembers(res.data || []);
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat daftar anggota.');
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const filteredMembers = members.filter((m) =>
    (m.nama || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.kelas || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.nis || '').includes(search)
  );

  return (
    <div className="space-y-6">
      
      {/* Judul Halaman */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center">
          <Users className="h-6 w-6 text-primary mr-2" />
          Daftar Anggota / Siswa
        </h1>
        <p className="text-xs text-slate-500 mt-1">Melihat daftar seluruh anggota pramuka penggalang Gugus Depan.</p>
      </div>

      {/* Kolom Pencarian */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft flex items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, kelas, atau NIS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-all min-h-[44px]"
          />
        </div>
      </div>

      {/* Grid Anggota */}
      {loading ? (
        <SkeletonLoader type="card" rows={6} />
      ) : filteredMembers.length === 0 ? (
        <EmptyState
          title="Anggota Tidak Ditemukan"
          description={search ? `Pencarian "${search}" tidak menemukan hasil.` : 'Belum ada data anggota.'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredMembers.map((m, idx) => (
            <motion.div
              key={m.id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-soft hover:border-primary/45 transition-colors flex items-center space-x-4"
            >
              <div className="h-12 w-12 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                {m.nama ? m.nama.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-slate-800 text-sm truncate leading-snug">{m.nama || 'Nama Anggota'}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">NIS: {m.nis || '-'}</p>
                <div className="flex items-center space-x-2 mt-1.5">
                  <span className="inline-block text-[10px] bg-slate-50 border border-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                    Kelas: {m.kelas || '-'}
                  </span>
                  <span className="inline-block text-[10px] bg-emerald-50 border border-emerald-100 text-primary-800 px-2 py-0.5 rounded font-medium">
                    {m.jenis_kelamin || '-'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Anggota;
