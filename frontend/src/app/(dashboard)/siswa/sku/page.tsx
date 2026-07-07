import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { Award } from 'lucide-react';

export default async function SiswaSkuPage() {
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

  // Fetch student scores joined with kategori_nilai
  const { data: scores } = await supabase
    .from('nilai')
    .select(`
      id,
      nilai,
      kategori_nilai (
        nama_kategori
      )
    `)
    .eq('siswa_id', siswa.id);

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div>
        <span className="text-xs font-mono tracking-widest text-[#5C3D2E] uppercase font-bold">[ EVALUASI KARAKTER ]</span>
        <h1 className="text-4xl font-serif font-bold text-primary mt-2">Nilai Karakter & SKU</h1>
      </div>

      <div className="bg-white border border-[#D1C9BC] rounded-3xl p-8 shadow-sm space-y-6">
        <h3 className="font-serif font-bold text-xl text-primary border-b border-[#D1C9BC]/45 pb-3">Rapor Nilai Penggalang</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {!scores || scores.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400">Belum ada penilaian karakter yang dicatat oleh Pembina.</div>
          ) : (
            scores.map((item: any, idx: number) => (
              <div key={item.id || idx} className="p-6 border border-[#D1C9BC]/40 rounded-2xl bg-[#FBF9F6] flex flex-col justify-between h-36">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-secondary text-primary rounded-xl shrink-0">
                    <Award className="h-5 w-5" />
                  </div>
                  <span className="text-2xl font-serif font-bold text-primary">{item.nilai} / 100</span>
                </div>
                <div className="text-left mt-4">
                  <h4 className="font-serif font-bold text-sm text-primary">
                    {item.kategori_nilai?.nama_kategori || 'Kategori Penilaian'}
                  </h4>
                  <p className="text-[10px] font-mono text-gray-500 mt-1 uppercase">
                    Status: {item.nilai >= 75 ? 'LULUS KKM' : 'PERLU PENINGKATAN'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
