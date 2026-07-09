import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { Award, Compass } from 'lucide-react';
import CheckInWidget from '@/components/absensi/check-in-widget';

export default async function SiswaDashboard() {
  const session = await getSession();
  if (!session || session.role !== 'siswa') {
    redirect('/login');
  }

  // Fetch student details from Supabase using correct schema columns
  const { data: siswa, error } = await supabase
    .from('siswa')
    .select(`
      id,
      nis,
      kelas,
      tingkatan,
      regu,
      users (
        nama,
        email
      )
    `)
    .eq('user_id', session.id)
    .maybeSingle();

  if (error || !siswa) {
    console.error('Siswa profile fetch error:', error);
    return (
      <div className="p-8 border border-red-200 bg-red-50 text-red-700 rounded-xl text-left">
        Profil siswa tidak ditemukan. Silakan hubungi admin Gudep untuk menautkan akun siswa Anda.
      </div>
    );
  }

  // Fetch student attendance summary
  const { count: attendanceCount } = await supabase
    .from('absensi')
    .select('*', { count: 'exact', head: true })
    .eq('siswa_id', siswa.id);

  // Fetch active geofence agenda
  const { data: activeAgendas } = await supabase
    .from('agenda_absensi')
    .select('*')
    .eq('status', 'aktif')
    .order('tanggal', { ascending: false });

  // Fetch checked-in logs for active agendas
  const { data: initialLogs } = await supabase
    .from('absensi')
    .select('*')
    .eq('siswa_id', siswa.id);

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div>
        <span className="text-xs font-mono tracking-widest text-[#5C3D2E] uppercase font-bold">[ PORTFOLIO ANGGOTA ]</span>
        <h1 className="text-4xl font-serif font-bold text-primary mt-2">Paspor Ekspedisi Pramuka</h1>
      </div>

      {/* PASSPORT CONTAINER */}
      <div className="bg-[#E6DFD3]/40 border border-[#D1C9BC] rounded-3xl p-8 md:p-12 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-bl-full flex items-center justify-center font-serif text-accent font-bold text-lg select-none">
          G11
        </div>

        {/* PHOTO & BASIC RANK */}
        <div className="md:col-span-4 flex flex-col items-center text-center space-y-4">
          <div className="w-40 h-40 rounded-full border-4 border-primary bg-primary/5 flex items-center justify-center overflow-hidden">
            <Compass className="h-20 w-20 text-primary animate-spin-slow" />
          </div>
          <div>
            <h2 className="font-serif font-black text-xl text-primary">{(siswa.users as any)?.nama}</h2>
            <p className="text-xs font-mono text-[#5C3D2E] font-bold mt-1">NIS: {siswa.nis}</p>
          </div>
        </div>

        {/* EXPEDITION RECORD */}
        <div className="md:col-span-8 space-y-6">
          <div className="grid grid-cols-2 gap-4 border-b border-[#D1C9BC]/60 pb-6">
            <div>
              <span className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Regu Keanggotaan</span>
              <p className="font-serif font-bold text-lg text-primary">{siswa.regu || 'Regu Singa'}</p>
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Tingkatan</span>
              <p className="font-serif font-bold text-lg text-primary">{siswa.tingkatan || 'Penggalang Ramu'}</p>
            </div>
            <div className="mt-4">
              <span className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Kelas</span>
              <p className="font-serif font-bold text-lg text-primary">Kelas {siswa.kelas || 'VIII'}</p>
            </div>
            <div className="mt-4">
              <span className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Total Absensi</span>
              <p className="font-serif font-bold text-lg text-primary">{attendanceCount || 0} Kehadiran</p>
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Pencapaian SKU / SKK</span>
            <div className="flex flex-wrap gap-3">
              <span className={`px-3.5 py-1.5 border text-xs font-bold rounded-lg flex items-center ${
                siswa.tingkatan === 'Penggalang Ramu' || siswa.tingkatan === 'Penggalang Rakit' || siswa.tingkatan === 'Penggalang Terap'
                  ? 'bg-[#1E3F20]/10 border-primary/20 text-primary'
                  : 'bg-[#E6DFD3] border-[#D1C9BC] text-gray-500'
              }`}>
                <Award className="h-3.5 w-3.5 mr-1.5" /> Uji Kelayakan Ramu [Selesai]
              </span>
              <span className={`px-3.5 py-1.5 border text-xs font-bold rounded-lg flex items-center ${
                siswa.tingkatan === 'Penggalang Rakit' || siswa.tingkatan === 'Penggalang Terap'
                  ? 'bg-[#1E3F20]/10 border-primary/20 text-primary'
                  : 'bg-[#E6DFD3] border-[#D1C9BC] text-gray-500'
              }`}>
                <Award className={`h-3.5 w-3.5 mr-1.5 ${
                  siswa.tingkatan === 'Penggalang Rakit' || siswa.tingkatan === 'Penggalang Terap' ? '' : 'opacity-50'
                }`} /> Uji Kelayakan Rakit [{siswa.tingkatan === 'Penggalang Rakit' || siswa.tingkatan === 'Penggalang Terap' ? 'Selesai' : 'Belum'}]
              </span>
              <span className={`px-3.5 py-1.5 border text-xs font-bold rounded-lg flex items-center ${
                siswa.tingkatan === 'Penggalang Terap'
                  ? 'bg-[#1E3F20]/10 border-primary/20 text-primary'
                  : 'bg-[#E6DFD3] border-[#D1C9BC] text-gray-500'
              }`}>
                <Award className={`h-3.5 w-3.5 mr-1.5 ${
                  siswa.tingkatan === 'Penggalang Terap' ? '' : 'opacity-50'
                }`} /> Uji Kelayakan Terap [{siswa.tingkatan === 'Penggalang Terap' ? 'Selesai' : 'Belum'}]
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* GEOLOCATION CHECK-IN WIDGET */}
      <CheckInWidget
        siswaId={siswa.id}
        activeAgendas={activeAgendas || []}
        initialLogs={initialLogs || []}
      />
    </div>
  );
}
