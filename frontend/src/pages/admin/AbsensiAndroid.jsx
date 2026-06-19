import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Smartphone, Search, Compass, AlertTriangle } from 'lucide-react';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';

const AbsensiAndroid = () => {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [kegiatans, setKegiatans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKegiatanFilter, setSelectedKegiatanFilter] = useState('');
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [logsRes, kegiatansRes] = await Promise.all([
        api.androidAbsensi.getAll(),
        api.androidAbsensi.getKegiatan(),
      ]);
      setLogs(logsRes.data.data || []);
      setKegiatans(kegiatansRes.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengambil data dari Database Android.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesKegiatan = selectedKegiatanFilter 
      ? log.agenda_id === Number(selectedKegiatanFilter) 
      : true;
      
    const matchesSearch = log.nama_siswa?.toLowerCase().includes(search.toLowerCase()) ||
      String(log.siswa_id).includes(search);
      
    return matchesKegiatan && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center">
          <Smartphone className="h-6 w-6 text-emerald-600 mr-2" />
          Rekap Absensi (Aplikasi Android)
        </h1>
        <p className="text-xs text-slate-500 mt-1">Data absensi ini diambil secara *real-time* dari Database aplikasi Android Scoutify.</p>
      </div>

      {/* Filters bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau ID siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-all min-h-[44px]"
          />
        </div>

        <div>
          <select
            value={selectedKegiatanFilter}
            onChange={(e) => setSelectedKegiatanFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-all min-h-[44px]"
          >
            <option value="">Semua Kegiatan Android</option>
            {kegiatans.map((k) => (
              <option key={k.id} value={k.id}>
                {k.title}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Data Table */}
      {loading ? (
        <SkeletonLoader type="table" rows={6} />
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          title="Data Kosong"
          description={search || selectedKegiatanFilter ? 'Tidak ada data absensi cocok dengan filter.' : 'Belum ada absensi yang masuk dari Android.'}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="px-6 py-4">Siswa</th>
                  <th className="px-6 py-4">Kegiatan</th>
                  <th className="px-6 py-4">Waktu Absen</th>
                  <th className="px-6 py-4">Jarak Proksimitas</th>
                  <th className="px-6 py-4">Foto Selfie</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{log.nama_siswa}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Regu: {log.regu}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {log.judul_agenda}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {log.waktu_absen}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-emerald-600">
                      {log.jarak ? `${Math.round(log.jarak)} m` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {log.foto_absen ? (
                        <a href={log.foto_absen} target="_blank" rel="noopener noreferrer">
                          <img src={log.foto_absen} alt="Selfie" className="h-10 w-10 object-cover rounded-md border border-slate-200 hover:opacity-80 transition-opacity" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Tanpa Foto</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        log.status === 'HADIR' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AbsensiAndroid;
