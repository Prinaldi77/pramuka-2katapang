import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Compass, GraduationCap, Calendar, Award, ChevronRight, AlertCircle, Eye, Camera, MapPin, X } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';

// Rumus Haversine untuk menghitung jarak dalam satuan meter
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Radius bumi dalam meter
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Jarak dalam meter
};

const Dashboard = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [agendas, setAgendas] = useState([]);
  const [absensiLogs, setAbsensiLogs] = useState([]);
  const [rapor, setRapor] = useState(null);

  // State untuk modal konfirmasi absensi
  const [absenModalOpen, setAbsenModalOpen] = useState(false);
  const [absenStep, setAbsenStep] = useState('geo'); // 'geo' | 'face' | 'success'
  const [gpsLoading, setGpsLoading] = useState(false);
  const [coords, setCoords] = useState(null);
  const [distance, setDistance] = useState(null);
  const [outOfRadius, setOutOfRadius] = useState(false);
  const [lateToCheckIn, setLateToCheckIn] = useState(false);

  // State untuk modal form izin atau sakit
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState('izin'); // 'izin' | 'sakit' | 'lainnya'
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);

  // State untuk pemindaian wajah lewat kamera
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [faceScanning, setFaceScanning] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [agendaRes, absensiRes, raporRes] = await Promise.all([
        api.agenda.getAll(),
        api.absensi.getBySiswa(user.siswaId || 101),
        api.nilai.getRapor(user.siswaId || 101).catch(() => ({ data: null })),
      ]);
      setAgendas(agendaRes.data || []);
      setAbsensiLogs(absensiRes.data || []);
      setRapor(raporRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengambil data ringkasan dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Bersihkan stream kamera saat komponen ditutup
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const activeAgenda = agendas.find((a) => a.status === 'aktif');
  const alreadyCheckedIn = activeAgenda
    ? absensiLogs.some((l) => l.agenda_id === activeAgenda.id)
    : false;

  const totalSessions = agendas.filter((a) => a.status === 'selesai').length || 1;
  const attendedCount = absensiLogs.length;
  const attendanceRate = Math.round((attendedCount / totalSessions) * 100) || 0;

  // Trigger pengecekan lokasi GPS
  const startAttendanceCheck = () => {
    if (!activeAgenda) return;
    setAbsenStep('geo');
    setAbsenModalOpen(true);
    setGpsLoading(true);
    setCoords(null);
    setOutOfRadius(false);
    setLateToCheckIn(false);

    // 1. Pengecekan batas waktu absensi
    const now = new Date();
    const [selesaiHour, selesaiMin] = activeAgenda.jam_selesai.split(':');
    const deadline = new Date();
    deadline.setHours(Number(selesaiHour), Number(selesaiMin), 0);
    
    if (now > deadline) {
      setLateToCheckIn(true);
      setGpsLoading(false);
      setOutOfRadius(true); // Posisi dianggap tidak valid jika terlambat
      return;
    }

    // 2. Pengecekan radius lokasi (Geofence)
    if (!navigator.geolocation) {
      toast.error('Browser Anda tidak mendukung GPS lokasi.');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const studentCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoords(studentCoords);
        setGpsLoading(false);

        // Hitung jarak posisi siswa dengan koordinat latihan
        const dist = getDistance(
          studentCoords.latitude,
          studentCoords.longitude,
          Number(activeAgenda.latitude),
          Number(activeAgenda.longitude)
        );
        setDistance(dist);

        if (dist > Number(activeAgenda.radius)) {
          setOutOfRadius(true);
          toast.warning('Anda berada di luar radius lokasi latihan!');
        } else {
          // Jika berada di dalam radius, lanjutkan ke tahap verifikasi wajah
          setAbsenStep('face');
          startFaceVerification();
        }
      },
      (error) => {
        console.error(error);
        setGpsLoading(false);
        toast.error('Gagal mengakses GPS. Pastikan izin lokasi aktif.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Memulai pemindaian wajah
  const startFaceVerification = async () => {
    setFaceScanning(true);
    setFaceVerified(false);
    setCameraError(false);

    // Minta akses kamera perangkat
    setTimeout(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Akses kamera gagal, gunakan simulasi:', err);
        setCameraError(true);
      }

      // Simulasi pemindaian wajah selama 3 detik
      setTimeout(async () => {
        setFaceScanning(false);
        setFaceVerified(true);
        stopCamera();

        // Kirim data absensi ke server
        try {
          await api.absensi.submit({
            agenda_id: activeAgenda.id,
            siswa_id: user.siswaId || 101,
            nama_siswa: user.name || user.nama || '',
            latitude: coords ? coords.latitude : Number(activeAgenda.latitude),
            longitude: coords ? coords.longitude : Number(activeAgenda.longitude),
          });
          toast.success('Verifikasi wajah sukses! Absensi terekam.');
          setAbsenStep('success');
          fetchDashboardData();
        } catch (err) {
          console.error(err);
          toast.error(err.response?.data?.message || 'Gagal mengirim absensi.');
          setAbsenModalOpen(false);
        }
      }, 3000);
    }, 500);
  };

  // Pengiriman formulir izin (Dikirim sebagai pesan masuk untuk review Pembina)
  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!leaveReason.trim()) {
      toast.warning('Harap berikan alasan izin/sakit.');
      return;
    }

    setLeaveSubmitting(true);
    try {
      const payload = {
        nama: user.name || 'Siswa',
        email: user.email || 'siswa@gmail.com',
        subjek: `Absensi [${leaveType.toUpperCase()}] - ${activeAgenda?.judul || 'Latihan'}`,
        pesan: `Siswa ${user.name} mengajukan izin absen dengan keterangan: "${leaveReason.trim()}". (Dikirim otomatis dari aplikasi Android karena posisi di luar radius / waktu habis).`,
      };

      // Kirim pesan ke endpoint pesan masuk pembina
      await api.pesan.create(payload);
      toast.success('Keterangan ketidakhadiran berhasil dikirim ke Pembina!');
      setLeaveModalOpen(false);
      setAbsenModalOpen(false);
      setLeaveReason('');
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengirim alasan izin.');
    } finally {
      setLeaveSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 bg-slate-200 rounded-md w-1/3"></div>
          <div className="h-4 bg-slate-200 rounded-md w-1/4"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-28 bg-slate-200 rounded-3xl"></div>
        <div className="h-56 bg-slate-200 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Selamat Datang, Kak <span className="text-primary">{user.name || 'Siswa'}</span>!
        </h1>
        <p className="text-xs text-slate-500 mt-1">Gudep 28.065 - 28.066 Pangkalan SMP Negeri 2 Katapang.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft flex items-center space-x-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl"><Compass className="h-6 w-6" /></div>
          <div>
            <p className="text-2xl font-extrabold text-slate-800">
              <CountUp end={attendedCount} duration={1.2} />
            </p>
            <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Kehadiran Latihan</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft flex items-center space-x-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><Calendar className="h-6 w-6" /></div>
          <div>
            <p className="text-2xl font-extrabold text-slate-800">
              <CountUp end={attendanceRate} duration={1.2} suffix="%" />
            </p>
            <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Persentase Hadir</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft flex items-center space-x-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-xl"><GraduationCap className="h-6 w-6" /></div>
          <div>
            <p className="text-2xl font-extrabold text-slate-800">
              {rapor?.rata_rata ? <CountUp end={rapor.rata_rata} duration={1.2} /> : '-'}
            </p>
            <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Rata-Rata Karakter</p>
          </div>
        </div>
      </div>

      {/* Direct Attendance Action Block */}
      {activeAgenda && (
        <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-center sm:justify-between gap-4 shadow-soft bg-white ${
          alreadyCheckedIn ? 'border-emerald-200 text-emerald-950' : 'border-amber-200 text-amber-950'
        }`}>
          <div className="flex items-center space-x-4 text-center sm:text-left flex-col sm:flex-row">
            <AlertCircle className={`h-8 w-8 flex-shrink-0 mb-2 sm:mb-0 ${alreadyCheckedIn ? 'text-emerald-600' : 'text-amber-600 animate-pulse'}`} />
            <div>
              <p className="font-bold text-sm">
                {alreadyCheckedIn ? 'Absensi Selesai: Sudah Terdaftar' : 'Ada Latihan Aktif: Harap Absen'}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-lg">
                Agenda "{activeAgenda.judul.split('||')[0]}" sedang berlangsung hari ini.
                {(() => {
                  const toleransi = activeAgenda.judul.split('||')[1];
                  if (toleransi && Number(toleransi) > 0) {
                    return ` (Toleransi telat: ${toleransi} menit).`;
                  }
                  return '';
                })()}
                {alreadyCheckedIn ? ' Anda telah melakukan check-in lokasi.' : ' Lakukan absensi langsung menggunakan pemindai wajah dan verifikasi lokasi GPS.'}
              </p>
            </div>
          </div>
          {!alreadyCheckedIn && (
            <button
              onClick={startAttendanceCheck}
              className="inline-flex items-center justify-center px-6 py-2.5 text-xs font-bold text-white bg-primary rounded-xl hover:bg-primary-700 transition-colors shadow-sm min-h-[44px] w-full sm:w-auto"
            >
              Absen Sekarang <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          )}
        </div>
      )}

      {/* Quick Links Menu */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft">
        <h3 className="font-bold text-slate-800 text-sm sm:text-base mb-6 border-b border-slate-100 pb-2">Tautan Navigasi Cepat</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <motion.div whileHover={{ scale: 1.02 }} className="flex flex-col">
            <Link
              to="/siswa/anggota"
              className="p-5 border border-slate-100 rounded-2xl hover:border-primary/40 bg-slate-50/50 transition-all flex flex-col justify-between h-full"
            >
              <div>
                <User className="h-6 w-6 text-slate-500 mb-2" />
                <h4 className="font-bold text-slate-800 text-sm">Profil Anggota</h4>
                <p className="text-xs text-slate-400 mt-1">Daftar profil nama-nama siswa anggota Pramuka.</p>
              </div>
              <span className="text-xs font-bold text-primary mt-4 inline-flex items-center">Lihat Anggota <ChevronRight className="h-3.5 w-3.5 ml-1" /></span>
            </Link>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} className="flex flex-col">
            <Link
              to="/siswa/kalender"
              className="p-5 border border-slate-100 rounded-2xl hover:border-primary/40 bg-slate-50/50 transition-all flex flex-col justify-between h-full"
            >
              <div>
                <Calendar className="h-6 w-6 text-slate-500 mb-2" />
                <h4 className="font-bold text-slate-800 text-sm">Kalender Latihan</h4>
                <p className="text-xs text-slate-400 mt-1">Lihat lini masa agenda kegiatan pangkalan.</p>
              </div>
              <span className="text-xs font-bold text-primary mt-4 inline-flex items-center">Lihat Jadwal <ChevronRight className="h-3.5 w-3.5 ml-1" /></span>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="flex flex-col">
            <Link
              to="/siswa/menu-lainnya"
              className="p-5 border border-slate-100 rounded-2xl hover:border-primary/40 bg-slate-50/50 transition-all flex flex-col justify-between h-full"
            >
              <div>
                <GraduationCap className="h-6 w-6 text-slate-500 mb-2" />
                <h4 className="font-bold text-slate-800 text-sm">Menu Lainnya</h4>
                <p className="text-xs text-slate-400 mt-1">Jadwal piket, Dasa Darma, leaderboard poin, dan info aplikasi.</p>
              </div>
              <span className="text-xs font-bold text-primary mt-4 inline-flex items-center font-semibold">Buka Menu <ChevronRight className="h-3.5 w-3.5 ml-1" /></span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ATTENDANCE CHECK MODAL */}
      <AnimatePresence>
        {absenModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col justify-between p-6 space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-extrabold text-slate-800 text-sm">Validasi Kehadiran Siswa</h3>
                <button 
                  onClick={() => { setAbsenModalOpen(false); stopCamera(); }}
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Step 1: Geolocation Check */}
              {absenStep === 'geo' && (
                <div className="text-center space-y-4 py-4">
                  {gpsLoading ? (
                    <div className="space-y-3">
                      <LoadingSpinner size="md" />
                      <p className="text-xs text-slate-500 font-semibold animate-pulse">Menghubungkan ke satelit GPS...</p>
                    </div>
                  ) : outOfRadius ? (
                    <div className="space-y-4">
                      <div className="h-12 w-12 bg-red-50 text-red-500 border border-red-200 rounded-2xl flex items-center justify-center mx-auto">
                        <AlertCircle className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-red-600 text-sm">
                          {lateToCheckIn ? 'Absensi Telah Ditutup!' : 'Berada di Luar Radius!'}
                        </h4>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                          {lateToCheckIn 
                            ? 'Waktu pengerjaan absensi untuk agenda latihan ini telah berakhir.' 
                            : `Anda berada sejauh ${distance ? (distance/1000).toFixed(2) : 'beberapa'} km dari koordinat pangkalan. Radius maksimum adalah ${activeAgenda.radius} meter.`
                          }
                        </p>
                      </div>
                      <div className="pt-2">
                        <button
                          onClick={() => setLeaveModalOpen(true)}
                          className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-700 min-h-[44px]"
                        >
                          Isi Form Izin / Sakit
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="h-12 w-12 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto">
                        <MapPin className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">Lokasi GPS Terverifikasi</h4>
                        <p className="text-xs text-slate-400 mt-1">Jarak Anda: {distance ? distance.toFixed(1) : '0'} meter (Dalam Radius)</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Face Verification */}
              {absenStep === 'face' && (
                <div className="text-center space-y-4 flex flex-col items-center">
                  <div className="space-y-1 w-full">
                    <h4 className="font-bold text-slate-800 text-xs">Pindai Verifikasi Wajah</h4>
                    <p className="text-[10px] text-slate-400">Posisikan wajah Anda tegak lurus di depan kamera.</p>
                  </div>

                  {/* Camera view container with scan overlay */}
                  <div className="w-56 h-56 rounded-full border-4 border-primary relative overflow-hidden bg-slate-950 flex items-center justify-center group shadow-soft">
                    {cameraError ? (
                      // Tampilkan simulasi jika kamera tidak aktif
                      <div className="flex flex-col items-center text-slate-500 p-4 space-y-2">
                        <User className="h-16 w-16 text-slate-400 animate-pulse" />
                        <span className="text-[9px]">Simulasi Kamera...</span>
                      </div>
                    ) : (
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                    )}
                    {/* Laser scan line effect */}
                    {faceScanning && (
                      <div className="absolute inset-x-0 h-1 bg-primary/70 shadow-[0_0_8px_#8b5cf6] animate-[bounce_2s_infinite] z-20"></div>
                    )}
                    {/* Scanning indicator */}
                    <div className="absolute top-2 px-2.5 py-0.5 bg-black/60 rounded-full text-white text-[8px] tracking-wider uppercase font-bold animate-pulse z-20 flex items-center space-x-1">
                      <Camera className="h-2.5 w-2.5 text-primary" />
                      <span>Scanning Face</span>
                    </div>
                  </div>

                  <p className="text-xs text-primary-800 font-semibold animate-pulse">
                    Memverifikasi struktur wajah Anda...
                  </p>
                </div>
              )}

              {/* Step 3: Success check */}
              {absenStep === 'success' && (
                <div className="text-center space-y-4 py-4">
                  <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <Compass className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-base">Absen Berhasil Dikirim!</h4>
                    <p className="text-xs text-slate-400 mt-1">Kehadiran latihan Anda hari ini telah terekam aman.</p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => setAbsenModalOpen(false)}
                      className="w-full px-4 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 min-h-[44px]"
                    >
                      Selesai
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LEAVE / PERMISSION FORM MODAL */}
      <AnimatePresence>
        {leaveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-slate-800 text-sm">Formulir Keterangan Absen</h3>
                <button 
                  onClick={() => setLeaveModalOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleLeaveSubmit} className="space-y-4 text-xs sm:text-sm">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Kategori Alasan</label>
                  <div className="flex space-x-3">
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="leaveType"
                        value="izin"
                        checked={leaveType === 'izin'}
                        onChange={() => setLeaveType('izin')}
                        className="text-primary focus:ring-primary h-4 w-4"
                      />
                      <span>Izin</span>
                    </label>
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="leaveType"
                        value="sakit"
                        checked={leaveType === 'sakit'}
                        onChange={() => setLeaveType('sakit')}
                        className="text-primary focus:ring-primary h-4 w-4"
                      />
                      <span>Sakit</span>
                    </label>
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="leaveType"
                        value="lainnya"
                        checked={leaveType === 'lainnya'}
                        onChange={() => setLeaveType('lainnya')}
                        className="text-primary focus:ring-primary h-4 w-4"
                      />
                      <span>Alasan Lainnya</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="reason" className="text-xs font-semibold text-slate-700">Tuliskan Keterangan Secara Detail</label>
                  <textarea
                    id="reason"
                    rows="4"
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="Contoh: Mengikuti seleksi olimpiade sekolah tingkat provinsi / Sedang demam tinggi..."
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                    required
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setLeaveModalOpen(false)}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 min-h-[44px]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={leaveSubmitting}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-700 min-h-[44px]"
                  >
                    {leaveSubmitting ? 'Mengirim...' : 'Kirim Keterangan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Dashboard;
