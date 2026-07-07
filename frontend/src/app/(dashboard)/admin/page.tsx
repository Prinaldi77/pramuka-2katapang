import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { Users, Calendar, CheckCircle2, Shield, Layers } from 'lucide-react';

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'pembina')) {
    redirect('/login');
  }

  // 1. Fetch statistics
  const { count: totalSiswa } = await supabase.from('siswa').select('*', { count: 'exact', head: true });
  const { count: totalPembina } = await supabase.from('pembina').select('*', { count: 'exact', head: true });
  const { count: totalAbsensi } = await supabase.from('absensi').select('*', { count: 'exact', head: true });
  const { count: totalAgenda } = await supabase.from('agenda_absensi').select('*', { count: 'exact', head: true });

  // 2. Fetch latest absensi matching correct database columns
  const { data: latestAbsensi } = await supabase
    .from('absensi')
    .select(`
      id,
      jarak,
      created_at,
      siswa (
        users (
          nama
        )
      ),
      agenda_absensi (
        judul
      )
    `)
    .order('created_at', { ascending: false })
    .limit(4);

  // 3. Fetch recent agendas to calculate attendance rates for chart
  const { data: recentAgendas } = await supabase
    .from('agenda_absensi')
    .select('id, judul, tanggal')
    .order('tanggal', { ascending: false })
    .limit(6);

  const chartData = await Promise.all((recentAgendas || []).map(async (agenda: any) => {
    // Count total presence for this agenda
    const { count: hadirCount } = await supabase
      .from('absensi')
      .select('*', { count: 'exact', head: true })
      .eq('agenda_id', agenda.id);

    return {
      judul: agenda.judul,
      tanggal: agenda.tanggal,
      count: hadirCount || 0
    };
  }));

  // Reverse it to display chronologically (left to right)
  chartData.reverse();

  // Find max count to scale the bars
  const maxCount = Math.max(...chartData.map(d => d.count), 5); // default min scale of 5

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <div>
        <span className="text-xs font-mono tracking-widest text-[#5C3D2E] uppercase font-bold">[ RINGKASAN INFORMASI ]</span>
        <h1 className="text-4xl font-serif font-bold text-primary mt-2">Dashboard Administrasi Gudep</h1>
      </div>

      {/* BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* STAT 1: TOTAL SISWA */}
        <div className="bg-white border border-[#D1C9BC] p-8 rounded-3xl flex flex-col justify-between h-48 hover:border-accent transition-colors">
          <div className="flex justify-between items-center">
            <Users className="h-8 w-8 text-primary" />
            <span className="text-[10px] font-mono text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-bold">+12%</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Total Siswa Terdaftar</span>
            <h2 className="text-3xl font-serif font-black text-primary mt-1">{totalSiswa || 0} Anggota</h2>
          </div>
        </div>

        {/* STAT 2: KEHADIRAN */}
        <div className="bg-white border border-[#D1C9BC] p-8 rounded-3xl flex flex-col justify-between h-48 hover:border-accent transition-colors">
          <div className="flex justify-between items-center">
            <CheckCircle2 className="h-8 w-8 text-primary" />
            <span className="text-[10px] font-mono text-[#5C3D2E] font-bold">[ Geofence OK ]</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Log Absensi Sukses</span>
            <h2 className="text-3xl font-serif font-black text-primary mt-1">{totalAbsensi || 0} Presensi</h2>
          </div>
        </div>

        {/* STAT 3: AGENDA AKTIF */}
        <div className="bg-white border border-[#D1C9BC] p-8 rounded-3xl flex flex-col justify-between h-48 hover:border-accent transition-colors">
          <div className="flex justify-between items-center">
            <Calendar className="h-8 w-8 text-primary" />
            <span className="text-[10px] font-mono text-accent bg-amber-100 px-2 py-0.5 rounded-full font-bold">Aktif</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Agenda Absensi</span>
            <h2 className="text-3xl font-serif font-black text-primary mt-1">{totalAgenda || 0} Kegiatan</h2>
          </div>
        </div>

        {/* CHART CARD (FULL WIDTH IN BENTO) */}
        <div className="md:col-span-3 bg-white border border-[#D1C9BC] p-8 rounded-3xl space-y-6">
          <div className="flex justify-between items-center border-b border-[#D1C9BC]/45 pb-3">
            <div>
              <span className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">[ ANALISIS KEHADIRAN ]</span>
              <h3 className="font-serif font-bold text-lg text-primary mt-1">Grafik Tren Kehadiran Latihan</h3>
            </div>
            <span className="text-xs font-mono text-gray-400">6 Agenda Terakhir</span>
          </div>

          <div className="flex justify-between items-end gap-4 h-60 pt-6">
            {chartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-gray-400 font-mono text-xs">
                Belum ada data latihan untuk direkapitulasi.
              </div>
            ) : (
              chartData.map((data, idx) => {
                const heightPercent = (data.count / maxCount) * 100;
                return (
                  <div key={idx} className="flex flex-col items-center flex-1 min-w-0 group">
                    <div className="w-full bg-[#FBF9F6] border border-[#D1C9BC]/45 rounded-2xl h-44 flex items-end overflow-hidden relative">
                      <div 
                        className="w-full bg-primary rounded-t-xl transition-all duration-500 group-hover:bg-accent flex justify-center items-start pt-2 text-[10px] font-mono font-bold text-[#E7E2D8] hover:scale-x-105"
                        style={{ height: `${heightPercent}%` }}
                      >
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1">{data.count}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[#5C3D2E] font-bold mt-2 truncate w-full text-center" title={data.judul}>
                      {data.judul}
                    </span>
                    <span className="text-[8px] font-mono text-gray-400">
                      {new Date(data.tanggal).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* LARGE CARD: RECENT LOGS */}
        <div className="md:col-span-2 bg-white border border-[#D1C9BC] p-8 rounded-3xl space-y-6">
          <h3 className="font-serif font-bold text-lg text-primary">Log Absensi Siswa Terbaru</h3>
          <div className="divide-y divide-[#D1C9BC]/35">
            {latestAbsensi?.map((log: any, idx: number) => (
              <div key={log.id || idx} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                <div className="text-left">
                  <p className="font-serif font-bold text-sm text-primary">{(log.siswa?.users as any)?.nama || 'Anggota Tanpa Nama'}</p>
                  <p className="text-[10px] font-mono text-gray-500 mt-0.5">
                    Regu: {(log.siswa as any)?.regu || 'Singa'} • Agenda: {log.agenda_absensi?.judul || 'Latihan'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#5C3D2E]">Jarak: {Math.round(log.jarak)}m</span>
                  <p className="text-[9px] text-gray-400 mt-0.5">
                    {new Date(log.created_at).toLocaleTimeString('id-ID')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SMALL CARD: INFO/GUIDE */}
        <div className="bg-primary text-secondary p-8 rounded-3xl flex flex-col justify-between h-auto">
          <div className="p-3 bg-secondary text-primary rounded-xl w-fit">
            <Shield className="h-6 w-6" />
          </div>
          <div className="space-y-2 mt-6 text-left">
            <h4 className="font-serif font-bold text-white">Panduan Pembina</h4>
            <p className="text-xs text-secondary/60 leading-relaxed">
              Gunakan panel kiri untuk mengakses basis data anggota, memverifikasi syarat kecakapan umum (SKU/SKK), dan memantau status peta geofence secara berkala.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
