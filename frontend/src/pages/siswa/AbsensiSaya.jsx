import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Compass, CheckCircle2, Navigation, Clock, AlertTriangle } from 'lucide-react';
import AttendanceMap from '../../components/Map/AttendanceMap';
import { motion } from 'framer-motion';

const AbsensiSaya = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [agendas, setAgendas] = useState([]);
  const [absensiLogs, setAbsensiLogs] = useState([]);

  // Student GPS Coordinates
  const [gpsCoords, setGpsCoords] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const activeAgenda = agendas.find((a) => a.status === 'aktif');

  const loadAttendanceData = async () => {
    try {
      const [agendaRes, absensiRes] = await Promise.all([
        api.agenda.getAll(),
        api.absensi.getBySiswa(user.siswaId || 101),
      ]);
      setAgendas(agendaRes.data);
      setAbsensiLogs(absensiRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat agenda atau riwayat absensi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendanceData();
  }, []);

  const handleAbsenNow = () => {
    if (!activeAgenda) return;
    if (!navigator.geolocation) {
      setGpsError('Browser Anda tidak mendukung Geolocation.');
      toast.error('Browser tidak mendukung Geolocation.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);
    setGpsCoords(null);
    setIsSuccess(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setGpsCoords(coords);
        setGpsLoading(false);

        // Proceed to submit attendance immediately
        setSubmitting(true);
        try {
          await api.absensi.submit({
            agenda_id: activeAgenda.id,
            siswa_id: user.siswaId || 101,
            nama_siswa: user.name || user.nama || '',
            latitude: coords.latitude,
            longitude: coords.longitude,
          });

          setIsSuccess(true);
          toast.success('Absensi kehadiran berhasil terekam!');
          loadAttendanceData();
        } catch (err) {
          console.error(err);
          const msg = err.response?.data?.message || 'Gagal mengirim absensi.';
          toast.error(msg);
          setGpsError(msg);
        } finally {
          setSubmitting(false);
        }
      },
      (error) => {
        console.error(error);
        setGpsLoading(false);
        let msg = 'Gagal mengakses GPS. Harap berikan izin akses lokasi.';
        if (error.code === 1) msg = 'Akses lokasi ditolak oleh pengguna.';
        setGpsError(msg);
        toast.error(msg);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-md w-1/4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 h-[350px] bg-slate-200 rounded-3xl"></div>
          <div className="lg:col-span-7 h-[350px] bg-slate-200 rounded-3xl"></div>
        </div>
        <div className="h-64 bg-slate-200 rounded-3xl"></div>
      </div>
    );
  }


  // Check if student already checked in for the active agenda
  const alreadyCheckedIn = activeAgenda
    ? absensiLogs.some((l) => l.agenda_id === activeAgenda.id)
    : false;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center">
          <Compass className="h-6 w-6 text-primary mr-2" />
          Absensi Mandiri GPS
        </h1>
        <p className="text-xs text-slate-500 mt-1">Lakukan absensi mandiri berbasis lokasi GPS saat berada di wilayah latihan.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Action Box: Active Checkin (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft space-y-6">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Status Latihan Aktif</h2>
          
          {activeAgenda ? (
            <div className="space-y-6">
              
              {/* Agenda card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <h3 className="font-bold text-slate-800 text-sm">{activeAgenda.judul}</h3>
                <p className="text-xs text-slate-500 flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1" /> Jam Latihan: {activeAgenda.jam_mulai} - {activeAgenda.jam_selesai} WIB
                </p>
                <p className="text-xs text-slate-400">Radius Geofence: {activeAgenda.radius} meter</p>
              </div>

              {alreadyCheckedIn || isSuccess ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col items-center text-center space-y-2"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 12 }}
                  >
                    <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                  </motion.div>
                  <p className="font-bold text-emerald-950 text-sm">Absen Berhasil</p>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    Anda sudah melakukan absensi kehadiran untuk sesi latihan ini.
                  </p>
                </motion.div>
              ) : gpsLoading ? (
                <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col items-center text-center space-y-3">
                  <div className="relative h-12 w-12 flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/20 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-8 w-8 bg-primary/20 border border-primary flex items-center justify-center">
                      <Compass className="h-5 w-5 text-primary animate-spin" style={{ animationDuration: '3s' }} />
                    </span>
                  </div>
                  <p className="font-bold text-slate-800 text-xs animate-pulse">Mengambil Lokasi...</p>
                  <p className="text-[10px] text-slate-400">Harap izinkan perangkat mengakses GPS Anda</p>
                </div>
              ) : submitting ? (
                <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col items-center text-center space-y-3">
                  <div className="relative h-12 w-12 flex items-center justify-center">
                    <span className="relative inline-flex rounded-full h-8 w-8 bg-primary/10 flex items-center justify-center">
                      <Navigation className="h-5 w-5 text-primary animate-pulse" />
                    </span>
                  </div>
                  <p className="font-bold text-slate-800 text-xs">Memproses Absensi...</p>
                  <p className="text-[10px] text-slate-400">Sedang mengirim koordinat Anda ke server</p>
                </div>
              ) : (
                <div className="space-y-4">
                  
                  {/* GPS Coordinates Fetch */}
                  {gpsCoords ? (
                    <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-xs space-y-1 text-slate-600">
                      <p className="font-semibold text-emerald-800">Koordinat GPS Ditemukan:</p>
                      <p>Lat: {gpsCoords.latitude.toFixed(6)}</p>
                      <p>Lng: {gpsCoords.longitude.toFixed(6)}</p>
                    </div>
                  ) : gpsError ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-2 text-xs text-red-800">
                      <AlertTriangle className="h-4.5 w-4.5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p>{gpsError}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      Harap klik tombol di bawah untuk melacak lokasi dan melakukan absensi.
                    </p>
                  )}

                  <button
                    onClick={handleAbsenNow}
                    disabled={gpsLoading || submitting}
                    className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary-700 transition-colors shadow-sm min-h-[44px] disabled:opacity-50"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Absen Sekarang
                  </button>

                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-slate-500">Tidak ada sesi latihan aktif saat ini.</p>
            </div>
          )}
        </div>

        {/* Right Map Box: Leaflet Map (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Peta Wilayah Latihan</h2>
          {activeAgenda ? (
            <AttendanceMap
              agendaLat={Number(activeAgenda.latitude)}
              agendaLng={Number(activeAgenda.longitude)}
              agendaRadius={Number(activeAgenda.radius)}
              userLat={gpsCoords?.latitude}
              userLng={gpsCoords?.longitude}
              agendaTitle={activeAgenda.judul}
            />
          ) : (
            <div className="h-80 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-xs">
              Peta akan muncul jika terdapat latihan aktif.
            </div>
          )}
        </div>

      </div>

      {/* Bottom Block: Riwayat Logs */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft">
        <h2 className="text-lg font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">Riwayat Absensi Saya</h2>
        
        {absensiLogs.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Belum ada riwayat absensi kehadiran.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs sm:text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="px-6 py-4">Sesi Agenda</th>
                  <th className="px-6 py-4">Waktu Absen</th>
                  <th className="px-6 py-4">Jarak Proksimitas</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                 {absensiLogs.map((log) => {
                  const agendaItem = agendas.find(a => a.id === log.agenda_id);
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
                    <tr key={log.id}>
                      <td className="px-6 py-4 font-bold text-slate-900">{agendaTitle}</td>
                      <td className="px-6 py-4">{displayWaktu}</td>
                      <td className="px-6 py-4">{log.jarak !== undefined ? `${log.jarak}m` : (log.distance || '-')}</td>
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
        )}
      </div>

    </div>
  );
};

export default AbsensiSaya;
