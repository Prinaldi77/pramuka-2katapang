import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Users, UserCheck, FileText, Calendar, Compass, ShieldAlert, Users2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import SkeletonLoader from '../../components/common/SkeletonLoader';
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
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    siswa: 0,
    pembina: 0,
    pengurus: 0,
    kegiatan: 0,
    absensiHariIni: 0,
  });

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [siswaRes, pembinaRes, pengurusRes, kegiatanRes, absensiRes] = await Promise.all([
          api.siswa.getAll(),
          api.pembina.getAll(),
          api.pengurus.getAll(),
          api.kegiatan.getAll(),
          api.absensi.getAll(),
        ]);

        const today = new Date().toISOString().split('T')[0];
        const todayAbs = (absensiRes.data || []).filter((a) => {
          const dateStr = a.created_at || a.waktu_absen || '';
          return dateStr.startsWith(today);
        }).length;

        setStats({
          siswa: siswaRes.data.length,
          pembina: pembinaRes.data.length,
          pengurus: pengurusRes.data.length,
          kegiatan: kegiatanRes.data.length,
          absensiHariIni: todayAbs,
        });

        const attendanceCountByDay = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
        (absensiRes.data || []).forEach(item => {
          const date = new Date(item.created_at || item.waktu_absen);
          const dayIndex = date.getDay();
          attendanceCountByDay[dayIndex] = (attendanceCountByDay[dayIndex] || 0) + 1;
        });

        const realChartData = [
          { day: 'Sen', Hadir: attendanceCountByDay[1] },
          { day: 'Sel', Hadir: attendanceCountByDay[2] },
          { day: 'Rab', Hadir: attendanceCountByDay[3] },
          { day: 'Kam', Hadir: attendanceCountByDay[4] },
          { day: 'Jum', Hadir: attendanceCountByDay[5] },
          { day: 'Sab', Hadir: attendanceCountByDay[6] },
          { day: 'Min', Hadir: attendanceCountByDay[0] },
        ];
        setChartData(realChartData);

      } catch (err) {
        console.error('Error loading dashboard stats:', err);
        toast.error('Gagal memuat beberapa data statistik dashboard.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded-md w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl animate-pulse"></div>
          ))}
        </div>
        <div className="h-96 bg-slate-200 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  const statItems = [
    { label: 'Total Siswa', value: stats.siswa, icon: UserCheck, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Total Pembina', value: stats.pembina, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Total Pengurus', value: stats.pengurus, icon: Users2, color: 'text-amber-600 bg-amber-50' },
    { label: 'Total Kegiatan', value: stats.kegiatan, icon: Calendar, color: 'text-purple-600 bg-purple-50' },
    { label: 'Absensi Hari Ini', value: stats.absensiHariIni, icon: Compass, color: 'text-rose-600 bg-rose-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Judul Halaman */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center">
          <ShieldAlert className="h-6 w-6 text-primary mr-2" />
          Dashboard Utama (Admin)
        </h1>
        <p className="text-xs text-slate-500 mt-1">Status dan statistik terkini pengelolaan Sistem Informasi Pramuka.</p>
      </div>

      {/* Kartu Statistik */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
      >
        {statItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' }}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft flex items-center space-x-4 cursor-default transition-shadow duration-200"
            >
              <div className={`p-4 rounded-xl flex-shrink-0 ${item.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-extrabold text-slate-800 truncate">
                  {item.value}
                </p>
                <p className="text-xs text-slate-400 font-semibold truncate uppercase mt-0.5">{item.label}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Grafik Statistik */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft space-y-4">
        <div>
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">Grafik Kehadiran Mingguan</h3>
          <p className="text-[10px] text-slate-400">Statistik jumlah penggalang yang melakukan absen GPS tiap harinya.</p>
        </div>
        
        {/* Container Recharts */}
        <div className="w-full h-80 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2a4a29" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#2a4a29" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.6)" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  borderRadius: '12px', 
                  color: '#fff', 
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)' 
                }}
              />
              <Area 
                type="monotone" 
                dataKey="Hadir" 
                stroke="#2a4a29" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorHadir)" 
                activeDot={{ r: 6, stroke: '#d97706', strokeWidth: 2, fill: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
