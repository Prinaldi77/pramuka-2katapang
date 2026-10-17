import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import QRScannerWidget from '@/components/absensi/qr-scanner-widget';

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
      foto_absen,
      created_at,
      agenda_absensi (
        judul,
        tanggal
      )
    `)
    .eq('siswa_id', siswa.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="text-left">
        <span className="text-xs font-mono tracking-widest text-[#5C3D2E] uppercase font-bold">[ PRESENSI KEHADIRAN ]</span>
        <h1 className="text-4xl font-serif font-bold text-primary mt-2">Scan Absensi & Riwayat Latihan</h1>
      </div>

      {/* WEBCAM QR SCANNER WIDGET */}
      <QRScannerWidget
        siswaId={siswa.id}
        initialLogs={logs || []}
      />

      {/* ATTENDANCE HISTORY */}
      <div className="bg-white border border-[#D1C9BC] rounded-3xl p-8 shadow-sm space-y-6 text-left">
        <h3 className="font-serif font-bold text-xl text-primary border-b border-[#D1C9BC]/45 pb-3">Riwayat Absensi Latihan</h3>
        
        <div className="divide-y divide-[#D1C9BC]/35">
          {!logs || logs.length === 0 ? (
            <div className="text-center py-12 text-gray-400 font-mono text-sm">Belum ada riwayat kehadiran yang tercatat.</div>
          ) : (
            logs.map((item: any, idx: number) => {
              const status = item.foto_absen || 'hadir';
              const isLate = status === 'telat';
              const isPermit = status === 'izin' || status === 'sakit';

              return (
                <div key={item.id || idx} className="py-6 flex flex-col sm:flex-row sm:items-center justify-between first:pt-0 last:pb-0 gap-3">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-secondary text-primary rounded-xl shrink-0">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-serif font-bold text-sm text-primary">
                        {item.agenda_absensi?.judul || 'Latihan Rutin'}
                      </h4>
                      <p className="text-[10px] font-mono text-gray-500 mt-1">
                        Tanggal: {item.agenda_absensi?.tanggal || '-'} • Dicatat: {new Date(item.created_at).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full inline-flex items-center ${
                      isLate
                        ? 'text-amber-800 bg-amber-50 border border-amber-200'
                        : isPermit
                        ? 'text-blue-800 bg-blue-50 border border-blue-200'
                        : 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                    }`}>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      {isLate ? 'Hadir (Terlambat)' : isPermit ? status.toUpperCase() : 'Hadir Tepat Waktu'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
