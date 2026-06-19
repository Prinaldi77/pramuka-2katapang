import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Compass, GraduationCap, Clock, Award, ChevronRight, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } }
};

const Dashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [agendas, setAgendas] = useState([]);
  const [absensiLogs, setAbsensiLogs] = useState([]);
  const [rapor, setRapor] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [agendaRes, absensiRes, raporRes] = await Promise.all([
          api.agenda.getAll(),
          api.absensi.getBySiswa(user.siswaId || 101),
          api.nilai.getRapor(user.siswaId || 101).catch(() => ({ data: null })),
        ]);
        setAgendas(agendaRes.data);
        setAbsensiLogs(absensiRes.data);
        setRapor(raporRes.data);
      } catch (err) {
        console.error(err);
        toast.error('Gagal mengambil data ringkasan dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Title area */}
        <div className="space-y-2">
          <div className="h-8 bg-slate-200 rounded-md w-1/3"></div>
          <div className="h-4 bg-slate-200 rounded-md w-1/4"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>

        {/* Large Widget card */}
        <div className="h-28 bg-slate-200 rounded-3xl"></div>

        {/* Quick links block */}
        <div className="h-56 bg-slate-200 rounded-3xl"></div>
      </div>
    );
  }

  const activeAgenda = agendas.find((a) => a.status === 'aktif');
  const alreadyCheckedIn = activeAgenda
    ? absensiLogs.some((l) => l.agenda_id === activeAgenda.id)
    : false;

  const totalSessions = agendas.filter(a => a.status === 'selesai').length || 1;
  const attendedCount = absensiLogs.length;
  const attendanceRate = Math.round((attendedCount / totalSessions) * 100) || 0;

  return (
    <div className="space-y-8">
      
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Selamat Datang, Kak <span className="text-primary">{user.name || user.nama || 'Siswa'}</span>!
        </h1>
        <p className="text-xs text-slate-500 mt-1">Gudep 11.083 - 11.084 Pangkalan SMP Negeri 2 Katapang.</p>
      </div>

      {/* Grid Stats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-3 gap-6"
      >
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft flex items-center space-x-4 cursor-default transition-shadow duration-200"
        >
          <div className="p-4 bg-emerald-50 text-primary rounded-xl"><Compass className="h-6 w-6" /></div>
          <div>
            <p className="text-2xl font-extrabold text-slate-800">
              <CountUp end={attendedCount} duration={1.2} />
            </p>
            <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Kehadiran Latihan</p>
          </div>
        </motion.div>
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft flex items-center space-x-4 cursor-default transition-shadow duration-200"
        >
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><Clock className="h-6 w-6" /></div>
          <div>
            <p className="text-2xl font-extrabold text-slate-800">
              <CountUp end={attendanceRate} duration={1.2} suffix="%" />
            </p>
            <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Persentase Hadir</p>
          </div>
        </motion.div>
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft flex items-center space-x-4 cursor-default transition-shadow duration-200"
        >
          <div className="p-4 bg-amber-50 text-amber-600 rounded-xl"><GraduationCap className="h-6 w-6" /></div>
          <div>
            <p className="text-2xl font-extrabold text-slate-800">
              {rapor?.rata_rata ? <CountUp end={rapor.rata_rata} duration={1.2} /> : '-'}
            </p>
            <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Rata-Rata Karakter</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Alert Check-In for Live Latihan */}
      {activeAgenda && (
        <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-center sm:justify-between gap-4 glass-card ${
          alreadyCheckedIn ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' : 'bg-amber-50/80 border-amber-200 text-amber-950'
        }`}>
          <div className="flex items-center space-x-4 text-center sm:text-left flex-col sm:flex-row">
            <AlertCircle className={`h-8 w-8 flex-shrink-0 mb-2 sm:mb-0 ${alreadyCheckedIn ? 'text-emerald-600' : 'text-amber-600 animate-pulse'}`} />
            <div>
              <p className="font-bold text-sm">
                {alreadyCheckedIn ? 'Sesi Latihan Aktif: Sudah Absen' : 'Sesi Latihan Aktif: Harap Absen GPS'}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-lg">
                Agenda "{activeAgenda.judul}" sedang berlangsung. {alreadyCheckedIn ? 'Terima kasih telah melakukan check-in lokasi.' : 'Segera lakukan absensi mandiri GPS dari menu Absensi Saya.'}
              </p>
            </div>
          </div>
          {!alreadyCheckedIn && (
            <Link
              to="/siswa/absensi"
              className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-bold text-white bg-primary rounded-xl hover:bg-primary-700 transition-colors shadow-sm min-h-[44px]"
            >
              Absen Sekarang <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          )}
        </div>
      )}

      {/* Quick Links Menu */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft">
        <h3 className="font-bold text-slate-800 text-sm sm:text-base mb-6 border-b border-slate-100 pb-2">Tautan Navigasi Cepat</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <motion.div whileHover={{ scale: 1.02 }} className="flex flex-col">
            <Link
              to="/siswa/profil"
              className="p-5 border border-slate-100 rounded-2xl hover:border-primary/40 bg-slate-50/50 transition-all flex flex-col justify-between h-full"
            >
              <div>
                <Award className="h-6 w-6 text-slate-500 mb-2" />
                <h4 className="font-bold text-slate-800 text-sm">Identitas Saya</h4>
                <p className="text-xs text-slate-400 mt-1">NIS, kelas, gender, dan detail orang tua.</p>
              </div>
              <span className="text-xs font-bold text-primary mt-4 inline-flex items-center">Lihat Profil <ChevronRight className="h-3.5 w-3.5 ml-1" /></span>
            </Link>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} className="flex flex-col">
            <Link
              to="/siswa/absensi"
              className="p-5 border border-slate-100 rounded-2xl hover:border-primary/40 bg-slate-50/50 transition-all flex flex-col justify-between h-full"
            >
              <div>
                <Compass className="h-6 w-6 text-slate-500 mb-2" />
                <h4 className="font-bold text-slate-800 text-sm">Absensi Geofence</h4>
                <p className="text-xs text-slate-400 mt-1">Kirim lokasi GPS mandiri saat berada di pangkalan latihan.</p>
              </div>
              <span className="text-xs font-bold text-primary mt-4 inline-flex items-center">Buka Absen <ChevronRight className="h-3.5 w-3.5 ml-1" /></span>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="flex flex-col">
            <Link
              to="/siswa/nilai"
              className="p-5 border border-slate-100 rounded-2xl hover:border-primary/40 bg-slate-50/50 transition-all flex flex-col justify-between h-full"
            >
              <div>
                <GraduationCap className="h-6 w-6 text-slate-500 mb-2" />
                <h4 className="font-bold text-slate-800 text-sm">Rapor Karakter</h4>
                <p className="text-xs text-slate-400 mt-1">Lihat grafik radar 5 elemen kedisiplinan dan saran pembina.</p>
              </div>
              <span className="text-xs font-bold text-primary mt-4 inline-flex items-center">Buka Rapor <ChevronRight className="h-3.5 w-3.5 ml-1" /></span>
            </Link>
          </motion.div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
