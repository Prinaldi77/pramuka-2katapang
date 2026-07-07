import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { Calendar, CheckCircle } from 'lucide-react';

export default async function SiswaAbsensiPage() {
  const session = await getSession();
  if (!session || session.role !== 'siswa') {
    redirect('/login');
  }

  // Fetch student ID
  const { data: siswa } = await supabase
    .from('siswa')
    .select('id')
    .eq('user_id', session.id)
    .maybeSingle();

  if (!siswa) {
    redirect('/siswa');
  }

  // Fetch attendance list for this student
  const { data: logs } = await supabase
    .from('absensi')
    .select(`
      id,
      jarak,
      created_at,
      agenda_absensi (
        judul,
        tanggal
      )
    `)
    .eq('siswa_id', siswa.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div>
        <span className="text-xs font-mono tracking-widest text-[#5C3D2E] uppercase font-bold">[ RIWAYAT KEHADIRAN ]</span>
        <h1 className="text-4xl font-serif font-bold text-primary mt-2">Log Kehadiran GPS</h1>
      </div>

      <div className="bg-white border border-[#D1C9BC] rounded-3xl p-8 shadow-sm space-y-6">
        <h3 className="font-serif font-bold text-xl text-primary border-b border-[#D1C9BC]/45 pb-3">Riwayat Absensi Latihan</h3>
        
        <div className="divide-y divide-[#D1C9BC]/35">
          {!logs || logs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">Belum ada riwayat kehadiran GPS yang tercatat.</div>
          ) : (
            logs.map((item: any, idx: number) => (
              <div key={item.id || idx} className="py-6 flex justify-between items-center first:pt-0 last:pb-0">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-secondary text-primary rounded-xl shrink-0">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-serif font-bold text-sm text-primary">
                      {item.agenda_absensi?.judul || 'Latihan Rutin'}
                    </h4>
                    <p className="text-[10px] font-mono text-gray-500 mt-1">
                      Tanggal Agenda: {item.agenda_absensi?.tanggal || '-'} • Presensi: {new Date(item.created_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full flex items-center">
                    <CheckCircle className="h-3.5 w-3.5 mr-1" /> Jarak: {Math.round(item.jarak)}m
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
