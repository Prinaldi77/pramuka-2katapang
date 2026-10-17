'use client';

import React, { useState } from 'react';
import { createAgendaAction } from '@/app/actions/absensi';
import LocationPickerMap from '../Map/LocationPickerMap';

export default function AgendaForm() {
  const [latitude, setLatitude] = useState(-7.0278);
  const [longitude, setLongitude] = useState(107.5756);
  const [radius, setRadius] = useState(100);

  const handleLocationChange = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  return (
    <div className="bg-white border border-[#D1C9BC] rounded-3xl p-8 shadow-sm space-y-6 text-left">
      <h3 className="font-serif font-bold text-xl text-primary border-b border-[#D1C9BC]/45 pb-3">
        Konfigurasi Jadwal Latihan
      </h3>

      <form action={createAgendaAction} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="judul" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">
            Nama Agenda / Kegiatan
          </label>
          <input
            id="judul"
            name="judul"
            type="text"
            required
            placeholder="Latihan Penggalang Mingguan"
            className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="tanggal" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">
              Tanggal
            </label>
            <input
              id="tanggal"
              name="tanggal"
              type="date"
              required
              className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="radius" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">
              Radius Geofence (Meter)
            </label>
            <input
              id="radius"
              name="radius"
              type="number"
              required
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              placeholder="100"
              className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="jam_mulai" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">
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
            <label htmlFor="jam_selesai" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">
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

        {/* Hidden inputs to pass coordinate states to the server action */}
        <input type="hidden" name="latitude" value={latitude} />
        <input type="hidden" name="longitude" value={longitude} />

        {/* GOOGLE MAP PICKER SECTION */}
        <div className="space-y-2 pt-2 border-t border-[#D1C9BC]/25">
          <span className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold block">
            Peta Lokasi Geofence
          </span>
          <LocationPickerMap
            latitude={latitude}
            longitude={longitude}
            radius={radius}
            onChange={handleLocationChange}
          />
        </div>

        <span className="text-[9px] font-mono text-gray-400 block leading-relaxed pt-2">
          *Toleransi keterlambatan check-in standar pangkalan adalah 15 menit dari jam mulai yang ditentukan.
        </span>

        <button
          type="submit"
          className="w-full py-3.5 bg-primary text-[#E7E2D8] font-mono font-bold uppercase tracking-wider text-xs rounded-xl shadow-md hover:bg-opacity-95 transition-all cursor-pointer"
        >
          Aktifkan Agenda Absensi
        </button>
      </form>
    </div>
  );
}
