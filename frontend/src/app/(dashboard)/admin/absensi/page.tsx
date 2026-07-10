import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { MapPin, Trash2 } from 'lucide-react';
import { deleteAgendaAction } from '@/app/actions/absensi';
import AgendaForm from '@/components/absensi/agenda-form';

export default async function AdminAbsensiPage() {
  const session = await getSession();
  if (!session || session.role !== 'pembina') {
    redirect('/login');
  }

  // Fetch all agendas
  const { data: agendaList } = await supabase
    .from('agenda_absensi')
    .select('*')
    .order('tanggal', { ascending: false });

  // Fetch all logs to see the attendance list
  const { data: checkInLogs } = await supabase
    .from('absensi')
    .select(`
      id,
      jarak,
      created_at,
      foto_absen,
      siswa (
        users (
          nama
        )
      ),
      agenda_absensi (
        judul
      )
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-mono tracking-widest text-[#5C3D2E] uppercase font-bold">[ PENGATURAN PARAMETER GPS ]</span>
          <h1 className="text-4xl font-serif font-bold text-primary mt-2">Kelola Geofence Absensi</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ADD AGENDA FORM */}
        <div className="lg:col-span-5">
          <AgendaForm />
        </div>

        {/* LIST TABLE */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-[#D1C9BC] rounded-3xl p-8 shadow-sm space-y-6 text-left">
            <h3 className="font-serif font-bold text-xl text-primary border-b border-[#D1C9BC]/45 pb-3">Agenda Absensi Aktif</h3>

            <div className="divide-y divide-[#D1C9BC]/35">
              {!agendaList || agendaList.length === 0 ? (
                <div className="text-center py-6 text-gray-400">Belum ada agenda absensi aktif terdaftar.</div>
              ) : (
                agendaList.map((item: any, idx: number) => (
                  <div key={item.id || idx} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-secondary text-primary rounded-xl shrink-0">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-serif font-bold text-sm text-primary">{item.judul}</h4>
                        <p className="text-[10px] font-mono text-gray-500 mt-1">
                          Tgl: {item.tanggal} • Radius: {item.radius}m • Waktu: {item.jam_mulai} - {item.jam_selesai} WIB
                        </p>
                      </div>
                    </div>
                    
                    <form action={async () => {
                      'use server';
                      await deleteAgendaAction(item.id);
                    }}>
                      <button type="submit" className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </form>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white border border-[#D1C9BC] rounded-3xl p-8 shadow-sm space-y-6 text-left">
            <h3 className="font-serif font-bold text-xl text-primary border-b border-[#D1C9BC]/45 pb-3">Log Riwayat Absensi & Izin Masuk</h3>

            <div className="divide-y divide-[#D1C9BC]/35 max-h-96 overflow-y-auto pr-2">
              {!checkInLogs || checkInLogs.length === 0 ? (
                <div className="text-center py-6 text-gray-400">Belum ada riwayat check-in masuk.</div>
              ) : (
                checkInLogs.map((log: any, idx: number) => {
                  const statusLabel = log.foto_absen || 'hadir';
                  const isLate = statusLabel === 'telat';
                  const isPermit = statusLabel === 'izin';
                  const isSick = statusLabel === 'sakit';
                  
                  let badgeColor = 'text-green-700 bg-green-50 border-green-200';
                  if (isLate) badgeColor = 'text-amber-700 bg-amber-50 border-amber-200';
                  if (isPermit) badgeColor = 'text-blue-700 bg-blue-50 border-blue-200';
                  if (isSick) badgeColor = 'text-red-700 bg-red-50 border-red-200';

                  return (
                    <div key={log.id || idx} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                      <div className="text-left">
                        <p className="font-serif font-bold text-sm text-primary">{(log.siswa?.users as any)?.nama || 'Anggota Tanpa Nama'}</p>
                        <p className="text-[10px] font-mono text-gray-500 mt-0.5">
                          Agenda: {log.agenda_absensi?.judul || 'Latihan'} • Waktu: {new Date(log.created_at).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-mono font-bold border px-2.5 py-1 rounded-full uppercase ${badgeColor}`}>
                          {statusLabel} ({log.jarak < 0 ? 'Izin Jarak' : `${Math.round(log.jarak)}m`})
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
