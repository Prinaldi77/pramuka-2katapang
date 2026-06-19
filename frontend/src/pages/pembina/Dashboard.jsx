import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Users, Compass, Clock, GraduationCap, Users2, ChevronRight, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
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
  const [stats, setStats] = useState({ siswa: 0, agenda: 0, absensi: 0 });
  const [agendas, setAgendas] = useState([]);

  useEffect(() => {
    const fetchPembinaStats = async () => {
      try {
        const [siswaRes, agendaRes, absensiRes] = await Promise.all([
          api.siswa.getAll(),
          api.agenda.getAll(),
          api.absensi.getAll(),
        ]);
        setStats({
          siswa: siswaRes.data.length,
          agenda: agendaRes.data.length,
          absensi: absensiRes.data.length,
        });
        setAgendas(agendaRes.data);
      } catch (err) {
        console.error(err);
        toast.error('Gagal mengambil data statistik Pembina.');
      } finally {
        setLoading(false);
      }
    };
    fetchPembinaStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Welcome header */}
        <div className="space-y-2">
          <div className="h-8 bg-slate-200 rounded-md w-1/3"></div>
          <div className="h-4 bg-slate-200 rounded-md w-1/2"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>

        {/* Action card if active */}
        <div className="h-28 bg-slate-200 rounded-3xl"></div>

        {/* Quick actions block */}
        <div className="h-56 bg-slate-200 rounded-3xl"></div>
      </div>
    );
  }

  const activeAgenda = agendas.find(a => a.status === 'aktif');

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Selamat Datang, Kak <span className="text-primary">{user.name || user.nama || 'Pembina'}</span>!
        </h1>
        <p className="text-xs text-slate-500 mt-1">Panel Pembina - Gudep 11.083 - 11.084 Pangkalan SMP Negeri 2 Katapang.</p>
      </div>

      {/* Stats Cards */}
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
          <div className="p-4 bg-emerald-50 text-primary rounded-xl"><Users className="h-6 w-6" /></div>
          <div>
            <p className="text-2xl font-extrabold text-slate-800">
              <CountUp end={stats.siswa} duration={1.2} />
            </p>
            <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Siswa Terdaftar</p>
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
              <CountUp end={stats.agenda} duration={1.2} />
            </p>
            <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Agenda Absensi</p>
          </div>
        </motion.div>
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft flex items-center space-x-4 cursor-default transition-shadow duration-200"
        >
          <div className="p-4 bg-rose-50 text-rose-600 rounded-xl"><Compass className="h-6 w-6" /></div>
          <div>
            <p className="text-2xl font-extrabold text-slate-800">
              <CountUp end={stats.absensi} duration={1.2} />
            </p>
            <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Log Absensi GPS</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Geofence notice */}
      {activeAgenda && (
        <div className="p-6 rounded-3xl border border-emerald-200 bg-emerald-50/50 text-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-4 glass-card">
          <div className="flex items-center space-x-4 text-center sm:text-left flex-col sm:flex-row">
            <AlertCircle className="h-8 w-8 text-primary flex-shrink-0 mb-2 sm:mb-0" />
            <div>
              <p className="font-bold text-sm">Sesi Latihan GPS Sedang Berlangsung</p>
              <p className="text-xs text-slate-500 mt-1">
                Agenda "{activeAgenda.judul}" aktif hari ini. Para penggalang dapat melakukan absensi mandiri di lokasi.
              </p>
            </div>
          </div>
          <Link
            to="/pembina/absensi"
            className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-bold text-white bg-primary rounded-xl hover:bg-primary-700 transition-colors shadow-sm min-h-[44px]"
          >
            Monitor Absensi <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      )}

      {/* Quick Action grid */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft">
        <h3 className="font-bold text-slate-800 text-sm sm:text-base mb-6 border-b border-slate-100 pb-2">Manajemen Cepat</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <motion.div whileHover={{ scale: 1.02 }} className="flex flex-col">
            <Link
              to="/pembina/nilai"
              className="p-5 border border-slate-100 rounded-2xl hover:border-primary/40 bg-slate-50/50 transition-all flex flex-col justify-between h-full"
            >
              <div>
                <GraduationCap className="h-6 w-6 text-slate-500 mb-2" />
                <h4 className="font-bold text-slate-800 text-sm">Kelola Penilaian</h4>
                <p className="text-xs text-slate-400 mt-1">Input nilai kedisiplinan, kerajinan, dan tanggung jawab siswa.</p>
              </div>
              <span className="text-xs font-bold text-primary mt-4 inline-flex items-center">Buka Penilaian <ChevronRight className="h-3.5 w-3.5 ml-1" /></span>
            </Link>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} className="flex flex-col">
            <Link
              to="/pembina/agenda"
              className="p-5 border border-slate-100 rounded-2xl hover:border-primary/40 bg-slate-50/50 transition-all flex flex-col justify-between h-full"
            >
              <div>
                <Clock className="h-6 w-6 text-slate-500 mb-2" />
                <h4 className="font-bold text-slate-800 text-sm">Agenda Latihan</h4>
                <p className="text-xs text-slate-400 mt-1">Buat jadwal latihan baru beserta radius toleransi GPS.</p>
              </div>
              <span className="text-xs font-bold text-primary mt-4 inline-flex items-center">Buka Agenda <ChevronRight className="h-3.5 w-3.5 ml-1" /></span>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="flex flex-col">
            <Link
              to="/pembina/pengurus"
              className="p-5 border border-slate-100 rounded-2xl hover:border-primary/40 bg-slate-50/50 transition-all flex flex-col justify-between h-full"
            >
              <div>
                <Users2 className="h-6 w-6 text-slate-500 mb-2" />
                <h4 className="font-bold text-slate-800 text-sm">Struktur Pengurus</h4>
                <p className="text-xs text-slate-400 mt-1">Lihat dan perbarui susunan pengurus Dewan Penggalang.</p>
              </div>
              <span className="text-xs font-bold text-primary mt-4 inline-flex items-center">Buka Pengurus <ChevronRight className="h-3.5 w-3.5 ml-1" /></span>
            </Link>
          </motion.div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
