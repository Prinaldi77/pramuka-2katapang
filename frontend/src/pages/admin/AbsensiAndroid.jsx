import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Smartphone, Search, Compass, AlertTriangle, Printer } from 'lucide-react';
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
      
      {/* CSS untuk Pencetakan Template PDF */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
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
            <Smartphone className="h-6 w-6 text-emerald-600 mr-2" />
            Rekap Absensi (Aplikasi Android)
          </h1>
          <p className="text-xs text-slate-500 mt-1">Data absensi ini diambil secara *real-time* dari Database aplikasi Android Scoutify.</p>
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
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-soft no-print">
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
          <h3 className="text-base font-bold uppercase underline tracking-wide">Laporan Rekapitulasi Absensi Android (Scoutify)</h3>
          <p className="text-[11px] font-medium text-slate-700">
            Kegiatan: {selectedKegiatanFilter ? kegiatans.find(k => k.id === Number(selectedKegiatanFilter))?.title : 'Semua Kegiatan Android'}
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
              <th className="border border-black px-5 py-2 text-left">Nama Siswa</th>
              <th className="border border-black px-3 py-2">Regu / Kelas</th>
              <th className="border border-black px-4 py-2 text-left">Agenda Kegiatan</th>
              <th className="border border-black px-3 py-2">Waktu Absen</th>
              <th className="border border-black px-3 py-2">Proksimitas</th>
              <th className="border border-black px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log, idx) => (
              <tr key={log.id} className="text-center hover:bg-slate-50">
                <td className="border border-black px-2.5 py-1.5">{idx + 1}</td>
                <td className="border border-black px-5 py-1.5 text-left font-bold">{log.nama_siswa || 'Siswa'}</td>
                <td className="border border-black px-3 py-1.5">{log.regu}</td>
                <td className="border border-black px-4 py-1.5 text-left">{log.judul_agenda}</td>
                <td className="border border-black px-3 py-1.5">{log.waktu_absen}</td>
                <td className="border border-black px-3 py-1.5">{log.jarak ? `${Math.round(log.jarak)}m` : '-'}</td>
                <td className="border border-black px-3 py-1.5 font-bold">{log.status}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Ringkasan Data & Tanda Tangan */}
        <div className="mt-8 flex justify-between items-start text-[11px] font-bold">
          <div className="space-y-1">
            <p>Total Kehadiran Android: {filteredLogs.length} Siswa</p>
            <p>Jumlah Hadir: {filteredLogs.filter(l => l.status === 'HADIR').length} Siswa</p>
            <p>Jumlah Terlambat: {filteredLogs.filter(l => l.status === 'TELAT').length} Siswa</p>
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

export default AbsensiAndroid;
