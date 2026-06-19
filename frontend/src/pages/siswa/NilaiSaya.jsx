import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Award, GraduationCap, FileText, CheckCircle } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const NilaiSaya = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [rapor, setRapor] = useState(null);

  useEffect(() => {
    const fetchRapor = async () => {
      try {
        const res = await api.nilai.getRapor(user.siswaId || 101);
        setRapor(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat data nilai rapor Anda.');
      } finally {
        setLoading(false);
      }
    };
    fetchRapor();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-8 bg-slate-200 rounded-md w-1/4"></div>
          <div className="h-4 bg-slate-200 rounded-md w-1/3"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 h-48"></div>
            <div className="bg-white border border-slate-200 rounded-3xl p-6 h-36"></div>
          </div>

          {/* Right Column (7 Cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 h-[450px]"></div>
        </div>
      </div>
    );
  }

  if (!rapor || !rapor.nilai) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-soft">
        <GraduationCap className="h-12 w-12 text-slate-300 mx-auto" />
        <h3 className="font-bold text-slate-700">Rapor Nilai Belum Terbit</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Nilai rapor Anda belum diinput oleh Pembina. Silakan hubungi Kakak Pembina Satuan Anda.
        </p>
      </div>
    );
  }

  const chartData = [
    { subject: 'Kehadiran', A: rapor.nilai.kehadiran, fullMark: 100 },
    { subject: 'Keaktifan', A: rapor.nilai.keaktifan, fullMark: 100 },
    { subject: 'Kedisiplinan', A: rapor.nilai.kedisiplinan, fullMark: 100 },
    { subject: 'Kerjasama', A: rapor.nilai.kerjasama, fullMark: 100 },
    { subject: 'Tanggung Jawab', A: rapor.nilai.tanggung_jawab, fullMark: 100 },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center">
          <GraduationCap className="h-6 w-6 text-primary mr-2" />
          Rapor Hasil Perkembangan
        </h1>
        <p className="text-xs text-slate-500 mt-1">Laporan pencapaian nilai karakter kepramukaan Anda semester ini.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Score Summary cards (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center flex flex-col items-center shadow-soft">
            <Award className="h-10 w-10 text-primary mb-2" />
            <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider">Nilai Rata-Rata Karakter</h4>
            <p className="text-4xl font-extrabold text-emerald-800 mt-1">{rapor.rata_rata}</p>
            <span className="mt-3 text-xs font-semibold px-3 py-1 bg-emerald-800 text-white rounded-full">
              Predikat: {rapor.predikat}
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-soft space-y-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center">
              <FileText className="h-4 w-4 text-primary mr-2" />
              Catatan & Saran Pembina
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm italic leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100 mt-2">
              "{rapor.nilai.catatan || 'Belum ada catatan evaluasi.'}"
            </p>
          </div>
        </div>

        {/* Right Side: Radar performance chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft space-y-6">
          <h3 className="font-bold text-slate-800 text-sm">Visualisasi Karakter</h3>
          
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                <Radar name={user.name || user.nama || 'Siswa'} dataKey="A" stroke="#2a4a29" fill="#2a4a29" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Value Breakdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 border-t border-slate-100 text-center text-xs">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-slate-400 font-semibold text-[10px] uppercase">Hadir</p>
              <p className="font-bold text-slate-800 text-base mt-1">{rapor.nilai.kehadiran}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-slate-400 font-semibold text-[10px] uppercase">Aktif</p>
              <p className="font-bold text-slate-800 text-base mt-1">{rapor.nilai.keaktifan}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-slate-400 font-semibold text-[10px] uppercase">Disiplin</p>
              <p className="font-bold text-slate-800 text-base mt-1">{rapor.nilai.kedisiplinan}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-slate-400 font-semibold text-[10px] uppercase">Kerjasama</p>
              <p className="font-bold text-slate-800 text-base mt-1">{rapor.nilai.kerjasama}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl col-span-2 sm:col-span-1">
              <p className="text-slate-400 font-semibold text-[10px] uppercase">T.Jawab</p>
              <p className="font-bold text-slate-800 text-base mt-1">{rapor.nilai.tanggung_jawab}</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default NilaiSaya;
