'use client';

import React, { useState } from 'react';
import { MapPin, CheckCircle2, AlertCircle, Clock, Heart, ClipboardList } from 'lucide-react';
import { checkInAction, submitIzinSakitAction } from '@/app/actions/absensi';

interface CheckInWidgetProps {
  siswaId: number;
  activeAgendas: any[];
  initialLogs: any[];
}

export default function CheckInWidget({ siswaId, activeAgendas, initialLogs }: CheckInWidgetProps) {
  const [logs, setLogs] = useState(initialLogs);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [outOfRadius, setOutOfRadius] = useState(false);
  const [activeAgenda, setActiveAgenda] = useState<any>(activeAgendas?.[0] || null);

  if (!activeAgenda) {
    return (
      <div className="bg-[#E6DFD3]/20 border border-[#D1C9BC] rounded-3xl p-8 text-center space-y-3">
        <Clock className="h-8 w-8 text-gray-400 mx-auto" />
        <h3 className="font-serif font-bold text-lg text-primary">Tidak Ada Agenda Latihan Aktif</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
          Belum ada jadwal latihan atau agenda absensi GPS yang diaktifkan oleh pembina saat ini.
        </p>
      </div>
    );
  }

  const isCheckedIn = logs.some((l) => l.agenda_id === activeAgenda.id);

  const handleGPSCheckIn = () => {
    setLoading(true);
    setError(null);
    setOutOfRadius(false);

    if (!navigator.geolocation) {
      setError('Browser Anda tidak mendukung deteksi lokasi GPS.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });

        const result = await checkInAction({
          siswa_id: siswaId,
          agenda_id: activeAgenda.id,
          latitude,
          longitude,
        });

        if (result.success) {
          // Success
          setLogs((prev) => [result.data, ...prev]);
        } else if (result.outOfRadius) {
          setOutOfRadius(true);
          setError(result.error || 'Anda di luar radius.');
        } else {
          setError(result.error || 'Gagal mengirim koordinat.');
        }
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError('Gagal mendapatkan lokasi GPS. Pastikan izin akses lokasi peramban diaktifkan.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleIzinSakit = async (tipe: 'izin' | 'sakit') => {
    setLoading(true);
    setError(null);

    const result = await submitIzinSakitAction({
      siswa_id: siswaId,
      agenda_id: activeAgenda.id,
      tipe,
    });

    if (result.success) {
      setLogs((prev) => [result.data, ...prev]);
      setOutOfRadius(false);
    } else {
      setError(result.error || 'Gagal mengajukan izin/sakit.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white border border-[#D1C9BC] rounded-3xl p-8 shadow-sm space-y-6 text-left relative overflow-hidden">
      <div className="absolute top-0 right-0 p-3 bg-secondary text-primary font-mono text-[9px] font-bold rounded-bl-xl tracking-wider">
        GPS GEOFENCE ACTIVE
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">[ PRESENSI TERJADWAL ]</span>
        <h3 className="font-serif font-bold text-xl text-primary">{activeAgenda.judul}</h3>
        <p className="text-xs text-gray-500 font-sans">
          Batas Waktu: {activeAgenda.jam_mulai} - {activeAgenda.jam_selesai} WIB • Radius: {activeAgenda.radius}m
        </p>
      </div>

      {isCheckedIn ? (
        <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Absensi / Izin Berhasil Dicatat!</p>
            <p className="opacity-90">Terima kasih, kehadiran Anda hari ini telah terekam secara aman di pangkalan.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="flex items-start space-x-2.5 p-4 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-2xl">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-700 mt-0.5" />
              <div>
                <p className="font-bold">Perhatian</p>
                <p className="opacity-90 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {outOfRadius ? (
            <div className="space-y-3 pt-2">
              <p className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Pilih Alasan Berhalangan Hadir:</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleIzinSakit('izin')}
                  className="py-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono font-bold uppercase rounded-xl hover:bg-blue-100 transition-colors flex justify-center items-center cursor-pointer"
                >
                  <ClipboardList className="h-4 w-4 mr-2" /> Ajukan Izin
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleIzinSakit('sakit')}
                  className="py-3 bg-red-50 border border-red-200 text-red-800 text-xs font-mono font-bold uppercase rounded-xl hover:bg-red-100 transition-colors flex justify-center items-center cursor-pointer"
                >
                  <Heart className="h-4 w-4 mr-2" /> Ajukan Sakit
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleGPSCheckIn}
              className="w-full py-4 bg-primary text-[#E7E2D8] font-mono font-bold uppercase tracking-wider text-xs rounded-xl shadow-md hover:bg-opacity-95 transition-all flex justify-center items-center cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-[#E7E2D8] mr-2"></div>
                  Mendeteksi Koordinat GPS...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 mr-2" /> Lakukan Absensi Geofence
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
