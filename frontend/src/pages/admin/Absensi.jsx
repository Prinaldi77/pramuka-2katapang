import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Compass, Search, Calendar, MapPin, Eye, Printer } from 'lucide-react';
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
      
      {/* CSS untuk Pencetakan Template PDF */}
      <style>{`
        @media print {
          /* Sembunyikan semua elemen layout web */
          body * {
            visibility: hidden;
          }
          /* Hanya tampilkan area template print */
          #print-template, #print-template * {
            visibility: visible;
          }
          #print-template {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: block !important;
            color: #000000 !important;
            background-color: #ffffff !important;
          }
          /* Pengaturan Halaman cetak */
          @page {
            size: A4 portrait;
            margin: 1.5cm;
          }
        }
      `}</style>

      {/* Title & Cetak Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center">
            <Compass className="h-6 w-6 text-primary mr-2" />
            Rekap Riwayat Absensi GPS
          </h1>
          <p className="text-xs text-slate-500 mt-1">Menampilkan seluruh log daftar hadir penggalang yang tervalidasi radius GPS.</p>
        </div>
        
        {filteredLogs.length > 0 && (
          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-sm min-h-[44px]"
          >
            <Printer className="h-4 w-4 mr-2" />
            Cetak Rekap PDF
          </button>
        )}
      </div>

      {/* Filters bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft grid grid-cols-1 sm:grid-cols-2 gap-4 no-print">
        
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
                {a.judul.split('||')[0]} ({a.tanggal})
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
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-soft no-print">
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

      {/* TEMPLATE PRINT FORMAL PDF (Disembunyikan di layar, hanya muncul saat dicetak) */}
      <div id="print-template" className="hidden text-black p-8 font-serif leading-relaxed">
        {/* Kop Surat Gerakan Pramuka */}
        <div className="text-center border-b-4 border-double border-black pb-3 mb-6">
          <h2 className="text-xl font-bold tracking-wide uppercase">Gerakan Pramuka</h2>
          <h1 className="text-2xl font-black tracking-wider uppercase mt-1">Gugus Depan 28.065 - 28.066</h1>
          <h3 className="text-sm font-bold uppercase mt-0.5">Pangkalan SMP Negeri 2 Katapang</h3>
          <p className="text-[10px] italic text-slate-600 mt-1">
            Alamat: Jl. Terusan Kopo No. 1, Katapang, Kec. Katapang, Kab. Bandung, Jawa Barat
          </p>
        </div>

        {/* Info Dokumen */}
        <div className="text-center space-y-2 mb-6">
          <h3 className="text-base font-bold uppercase underline tracking-wide">Laporan Rekapitulasi Absensi Geofence GPS</h3>
          <p className="text-[11px] font-medium text-slate-700">
            Sesi Agenda: {selectedAgendaFilter ? agendas.find(a => a.id === Number(selectedAgendaFilter))?.judul.split('||')[0] : 'Semua Sesi Agenda Latihan'}
          </p>
          <p className="text-[10px] text-slate-500">
            Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Tabel Rekap Absensi */}
        <table className="w-full border-collapse border border-black text-[11px]">
          <thead>
            <tr className="bg-slate-100 text-center font-bold">
              <th className="border border-black px-2.5 py-2 w-8">No</th>
              <th className="border border-black px-3 py-2 w-24">NIS / ID Siswa</th>
              <th className="border border-black px-5 py-2 text-left">Nama Siswa</th>
              <th className="border border-black px-4 py-2 text-left">Agenda Latihan</th>
              <th className="border border-black px-3 py-2">Waktu Absen</th>
              <th className="border border-black px-3 py-2">Proksimitas</th>
              <th className="border border-black px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log, idx) => {
              const agendaItem = agendas.find((a) => a.id === log.agenda_id);
              const agendaTitle = (agendaItem?.judul || 'Sesi Latihan').split('||')[0];
              
              let displayWaktu = '-';
              if (log.created_at) {
                const d = new Date(log.created_at);
                displayWaktu = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
              }

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
                <tr key={log.id} className="text-center hover:bg-slate-50">
                  <td className="border border-black px-2.5 py-1.5">{idx + 1}</td>
                  <td className="border border-black px-3 py-1.5">{log.siswa_id}</td>
                  <td className="border border-black px-5 py-1.5 text-left font-bold">{log.nama_siswa || 'Siswa'}</td>
                  <td className="border border-black px-4 py-1.5 text-left">{agendaTitle}</td>
                  <td className="border border-black px-3 py-1.5">{displayWaktu}</td>
                  <td className="border border-black px-3 py-1.5">{log.jarak !== undefined ? `${log.jarak}m` : '-'}</td>
                  <td className="border border-black px-3 py-1.5 font-bold">{calculatedStatus}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Ringkasan Data & Tanda Tangan */}
        <div className="mt-8 flex justify-between items-start text-[11px] font-bold">
          <div className="space-y-1">
            <p>Total Daftar Hadir: {filteredLogs.length} Siswa</p>
            <p>Jumlah Tepat Waktu: {filteredLogs.filter(l => {
              const aItem = agendas.find(a => a.id === l.agenda_id);
              if (!aItem || !l.created_at) return true;
              const toleransi = aItem.judul.split('||')[1] ? Number(aItem.judul.split('||')[1]) : 0;
              const checkIn = new Date(l.created_at);
              const [h, m] = aItem.jam_mulai.split(':');
              const start = new Date(aItem.tanggal);
              start.setHours(Number(h), Number(m), 0, 0);
              return Math.floor((checkIn - start) / 60000) <= toleransi;
            }).length} Siswa</p>
            <p>Jumlah Terlambat: {filteredLogs.filter(l => {
              const aItem = agendas.find(a => a.id === l.agenda_id);
              if (!aItem || !l.created_at) return false;
              const toleransi = aItem.judul.split('||')[1] ? Number(aItem.judul.split('||')[1]) : 0;
              const checkIn = new Date(l.created_at);
              const [h, m] = aItem.jam_mulai.split(':');
              const start = new Date(aItem.tanggal);
              start.setHours(Number(h), Number(m), 0, 0);
              return Math.floor((checkIn - start) / 60000) > toleransi;
            }).length} Siswa</p>
          </div>

          <div className="text-center w-64 space-y-12">
            <p>Bandung, {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="font-semibold leading-relaxed">Mengetahui,<br/>Pembina Gugus Depan</p>
            <div className="h-12"></div>
            <p className="font-bold underline tracking-wider">(.......................................)</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Absensi;
