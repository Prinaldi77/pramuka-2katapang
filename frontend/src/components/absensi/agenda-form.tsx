'use client';

import React from 'react';
import { createAgendaAction } from '@/app/actions/absensi';
import { Calendar, Clock, Sparkles, QrCode } from 'lucide-react';

export default function AgendaForm() {
  return (
    <div className="bg-white border border-[#D1C9BC] rounded-3xl p-8 shadow-sm space-y-6 text-left">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#1E3F20]/10 text-primary rounded-full text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Sistem QR Dinamis 60 Detik</span>
        </div>
        <h3 className="font-serif font-bold text-xl text-primary border-b border-[#D1C9BC]/45 pb-3">
          Jadwal Latihan Baru
        </h3>
        <p className="text-xs text-gray-500 font-mono mt-2">
          Agenda yang dibuat otomatis terhubung dengan sistem presensi QR Code dinamis (tanpa GPS / geofence).
        </p>
      </div>

      <form action={createAgendaAction} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="judul" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">
            Nama Agenda / Kegiatan Latihan
          </label>
          <input
            id="judul"
            name="judul"
            type="text"
            required
            placeholder="Contoh: Latihan Rutin Sandi & Tali Temali"
            className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="tanggal" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-primary" />
            Tanggal Latihan
          </label>
          <input
            id="tanggal"
            name="tanggal"
            type="date"
            required
            className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="jam_mulai" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1.5 text-primary" />
              Jam Mulai (WIB)
            </label>
            <input
              id="jam_mulai"
              name="jam_mulai"
              type="time"
              required
              className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="jam_selesai" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1.5 text-primary" />
              Jam Selesai (WIB)
            </label>
            <input
              id="jam_selesai"
              name="jam_selesai"
              type="time"
              required
              className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Hidden inputs to maintain Supabase table schema compatibility */}
        <input type="hidden" name="latitude" value="0" />
        <input type="hidden" name="longitude" value="0" />
        <input type="hidden" name="radius" value="0" />

        <div className="p-3.5 bg-[#FBF9F6] border border-[#D1C9BC]/60 rounded-xl space-y-1">
          <span className="text-[11px] font-mono text-[#5C3D2E] font-bold flex items-center">
            <QrCode className="h-3.5 w-3.5 mr-1 text-primary" />
            Alur Presensi Siswa:
          </span>
          <p className="text-[10px] font-mono text-gray-500 leading-relaxed">
            Setelah agenda diaktifkan, klik tombol <strong>"TAMPILKAN QR LIVE"</strong> di samping. Siswa membuka menu Absensi di HP masing-masing untuk memindai QR code tersebut.
          </p>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-primary text-[#E7E2D8] font-mono font-bold uppercase tracking-wider text-xs rounded-xl shadow-md hover:bg-opacity-95 transition-all cursor-pointer flex items-center justify-center space-x-2"
        >
          <span>Aktifkan Agenda Latihan</span>
        </button>
      </form>
    </div>
  );
}
