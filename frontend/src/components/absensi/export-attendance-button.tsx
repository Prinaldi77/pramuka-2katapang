'use client';

import React from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';

interface AttendanceLog {
  id: number;
  jarak: number;
  created_at: string;
  foto_absen: string;
  siswa?: {
    users?: {
      nama?: string;
    };
  };
  agenda_absensi?: {
    judul?: string;
  };
}

interface ExportAttendanceButtonProps {
  logs: AttendanceLog[];
}

export default function ExportAttendanceButton({ logs }: ExportAttendanceButtonProps) {
  const handleExportCSV = () => {
    if (!logs || logs.length === 0) {
      alert('Belum ada data riwayat absensi untuk diekspor.');
      return;
    }

    // CSV Headers
    const headers = ['No', 'Nama Siswa', 'Agenda Latihan', 'Waktu Presensi', 'Status', 'Metode Validasi'];

    // CSV Rows
    const rows = logs.map((log, index) => {
      const nama = (log.siswa?.users?.nama || 'Anggota Tanpa Nama').replace(/"/g, '""');
      const agenda = (log.agenda_absensi?.judul || 'Latihan Rutin').replace(/"/g, '""');
      const waktu = new Date(log.created_at).toLocaleString('id-ID').replace(/"/g, '""');
      const status = (log.foto_absen || 'hadir').toUpperCase();
      const metode = log.jarak === 0 ? 'QR Dinamis (HMAC-SHA256)' : (log.jarak < 0 ? 'Surat Izin' : 'Tervalidasi');

      return [index + 1, `"${nama}"`, `"${agenda}"`, `"${waktu}"`, `"${status}"`, `"${metode}"`].join(',');
    });

    // Combine headers and rows with BOM for Excel UTF-8 compatibility
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `rekap_absensi_pramuka_smpn2katapang_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExportCSV}
      type="button"
      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#1E3F20]/10 hover:bg-[#1E3F20]/20 text-primary border border-primary/20 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
      title="Unduh Rekap Laporan Absensi (Format CSV / Excel)"
    >
      <FileSpreadsheet className="h-4 w-4 text-primary" />
      <span>Ekspor CSV</span>
    </button>
  );
}
