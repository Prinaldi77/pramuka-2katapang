import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Compass, Search, Calendar, MapPin, Eye } from 'lucide-react';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';

const Absensi = () => {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [agendas, setAgendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgendaFilter, setSelectedAgendaFilter] = useState('');
  const [search, setSearch] = useState('');

  const loadAttendanceLogs = async () => {
    setLoading(true);
    try {
      const [logsRes, agendasRes] = await Promise.all([
        api.absensi.getAll(),
        api.agenda.getAll(),
      ]);
      setLogs(logsRes.data);
      setAgendas(agendasRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengambil riwayat absensi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendanceLogs();
  }, []);

  // Filter logs based on Agenda selection and Search keyword
  const filteredLogs = logs.filter((log) => {
    const matchesAgenda = selectedAgendaFilter 
      ? log.agenda_id === Number(selectedAgendaFilter) 
      : true;
      
    const matchesSearch = log.nama_siswa.toLowerCase().includes(search.toLowerCase()) ||
      String(log.siswa_id).includes(search);
      
    return matchesAgenda && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center">
          <Compass className="h-6 w-6 text-primary mr-2" />
          Rekap Riwayat Absensi GPS
        </h1>
        <p className="text-xs text-slate-500 mt-1">Menampilkan seluruh log daftar hadir penggalang yang tervalidasi radius GPS.</p>
      </div>

      {/* Filters bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Search */}
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

        {/* Agenda select filter */}
        <div>
          <select
            value={selectedAgendaFilter}
            onChange={(e) => setSelectedAgendaFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-all min-h-[44px]"
          >
            <option value="">Semua Sesi Agenda Latihan</option>
            {agendas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.judul} ({a.tanggal})
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
          title="Log Absensi Kosong"
          description={search || selectedAgendaFilter ? 'Tidak ada data absensi cocok dengan filter.' : 'Belum ada siswa yang melakukan absensi.'}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="px-6 py-4">Siswa</th>
                  <th className="px-6 py-4">Agenda Latihan</th>
                  <th className="px-6 py-4">Waktu Absen</th>
                  <th className="px-6 py-4">Koordinat GPS</th>
                  <th className="px-6 py-4">Jarak Proksimitas</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLogs.map((log) => {
                  const agendaItem = agendas.find((a) => a.id === log.agenda_id);
                  const rawJudul = agendaItem?.judul || 'Sesi Latihan';
                  const agendaTitle = rawJudul.split('||')[0];
                  
                  // Format waktu absen secara lokal dari created_at
                  let displayWaktu = '-';
                  if (log.created_at) {
                    const d = new Date(log.created_at);
                    displayWaktu = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
                  }

                  // Hitung status absensi secara dinamis
                  let calculatedStatus = 'HADIR';
                  if (agendaItem && log.created_at) {
                    const titleParts = agendaItem.judul.split('||');
                    const toleransi = titleParts[1] ? Number(titleParts[1]) : 0;
                    
                    const checkIn = new Date(log.created_at);
                    const [h, m] = agendaItem.jam_mulai.split(':');
                    const start = new Date(agendaItem.tanggal);
                    start.setHours(Number(h), Number(m), 0, 0);
                    
                    const diffMins = Math.floor((checkIn - start) / 60000);
                    if (diffMins > toleransi) {
                      calculatedStatus = 'TELAT';
                    }
                  }

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{log.nama_siswa || log.siswa?.users?.nama || 'Siswa'}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">ID: {log.siswa_id}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {agendaTitle}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {displayWaktu}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono">
                        {log.latitude?.toFixed(6)}, {log.longitude?.toFixed(6)}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-primary">
                        {log.jarak !== undefined ? `${log.jarak}m` : (log.distance || '-')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          calculatedStatus === 'HADIR'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {calculatedStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default Absensi;
