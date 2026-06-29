import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Calendar as CalendarIcon, Clock, MapPin, Tag } from 'lucide-react';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { motion } from 'framer-motion';

const Kalender = () => {
  const toast = useToast();
  const [agendas, setAgendas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgendas = async () => {
      try {
        const res = await api.agenda.getAll();
        // Urutkan agenda berdasarkan tanggal (terdekat dahulu)
        const sorted = (res.data || []).sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
        setAgendas(sorted);
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat jadwal agenda.');
      } finally {
        setLoading(false);
      }
    };
    fetchAgendas();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Judul Halaman */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center">
          <CalendarIcon className="h-6 w-6 text-primary mr-2" />
          Tabel Kalender Kegiatan
        </h1>
        <p className="text-xs text-slate-500 mt-1">Jadwal lengkap agenda latihan rutin, pelantikan, dan kegiatan luar ruangan.</p>
      </div>

      {/* Tampilan Timeline */}
      {loading ? (
        <SkeletonLoader type="card" rows={4} />
      ) : agendas.length === 0 ? (
        <EmptyState
          title="Jadwal Kosong"
          description="Belum ada agenda kegiatan kepramukaan yang dijadwalkan."
        />
      ) : (
        <div className="relative border-l border-slate-200 ml-4 md:ml-6 pl-6 space-y-8 py-4">
          {agendas.map((a, idx) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="relative"
            >
              {/* Penanda Linimasa */}
              <span className={`absolute -left-[35px] top-1.5 flex items-center justify-center w-6 h-6 rounded-full border-4 border-white shadow-sm ${
                a.status === 'aktif' ? 'bg-primary animate-pulse' : 'bg-slate-300'
              }`}>
                <Clock className="h-3 w-3 text-white" />
              </span>

              {/* Kartu Informasi Agenda */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-soft hover:border-primary/30 transition-colors space-y-4 max-w-xl">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center space-x-1 text-[10px] text-slate-400 font-semibold bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                    <CalendarIcon className="h-3.5 w-3.5 mr-0.5" />
                    {a.tanggal}
                  </span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    a.status === 'aktif'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                      : 'bg-slate-100 border border-slate-200 text-slate-500'
                  }`}>
                    {a.status === 'aktif' ? 'Aktif' : 'Selesai'}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 text-base">{(a.judul || 'Agenda Kegiatan').split('||')[0]}</h3>
                  {a.judul && a.judul.includes('||') && (
                    <p className="text-[10px] text-amber-600 font-semibold mt-0.5">
                      Toleransi Keterlambatan: {a.judul.split('||')[1]} menit
                    </p>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 pt-1.5">
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{a.jam_mulai} - {a.jam_selesai} WIB</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate max-w-[150px]">{a.lokasi || 'Pangkalan'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Tag className="h-3.5 w-3.5 text-slate-400" />
                      <span>Radius {a.radius || 100}m</span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Kalender;
