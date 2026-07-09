import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { Award, Trash2 } from 'lucide-react';
import { upsertNilaiAction, deleteNilaiAction, updateSiswaSkuAction } from '@/app/actions/nilai';

export default async function AdminPenilaianPage() {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'pembina')) {
    redirect('/login');
  }

  // Fetch all students (siswa)
  const { data: siswaList } = await supabase
    .from('siswa')
    .select(`
      id,
      nis,
      users (
        nama
      )
    `);

  // Fetch all categories (kategori_nilai)
  const { data: kategoriList } = await supabase
    .from('kategori_nilai')
    .select('id, nama_kategori');

  // Fetch current score records joined with siswa name and category
  const { data: nilaiList } = await supabase
    .from('nilai')
    .select(`
      id,
      nilai,
      siswa (
        users (
          nama
        )
      ),
      kategori_nilai (
        nama_kategori
      )
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-mono tracking-widest text-[#5C3D2E] uppercase font-bold">[ EVALUASI SKU / SKK ]</span>
          <h1 className="text-4xl font-serif font-bold text-primary mt-2">Penilaian Anggota Penggalang</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: BOTH FORMS */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* INPUT SCORE FORM */}
          <div className="bg-white border border-[#D1C9BC] rounded-3xl p-8 shadow-sm space-y-6">
            <h3 className="font-serif font-bold text-xl text-primary border-b border-[#D1C9BC]/45 pb-3">Input / Perbarui Nilai</h3>
            
            <form action={upsertNilaiAction} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="siswa_id" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Pilih Siswa (Penggalang)</label>
                <select 
                  id="siswa_id"
                  name="siswa_id"
                  required
                  className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">-- Pilih Anggota --</option>
                  {siswaList?.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.users?.nama} ({item.nis})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="kategori_nilai_id" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Kategori Penilaian</label>
                <select 
                  id="kategori_nilai_id"
                  name="kategori_nilai_id"
                  required
                  className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">-- Pilih Kategori --</option>
                  {kategoriList?.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.nama_kategori}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="nilai" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Nilai Evaluasi (0 - 100)</label>
                <input 
                  id="nilai"
                  name="nilai"
                  type="number"
                  min="0"
                  max="100"
                  required
                  placeholder="85"
                  className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 bg-primary text-[#E7E2D8] font-mono font-bold uppercase tracking-wider text-xs rounded-xl shadow-md hover:bg-opacity-95 transition-all cursor-pointer"
              >
                Simpan Penilaian
              </button>
            </form>
          </div>

          {/* UPDATE SKU & REGU FORM */}
          <div className="bg-white border border-[#D1C9BC] rounded-3xl p-8 shadow-sm space-y-6">
            <h3 className="font-serif font-bold text-xl text-primary border-b border-[#D1C9BC]/45 pb-3">Kelola SKU & Regu Siswa</h3>
            
            <form action={updateSiswaSkuAction} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="sku_siswa_id" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Pilih Siswa (Penggalang)</label>
                <select 
                  id="sku_siswa_id"
                  name="siswa_id"
                  required
                  className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">-- Pilih Anggota --</option>
                  {siswaList?.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.users?.nama} ({item.nis})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="tingkatan" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Tingkatan SKU</label>
                <select 
                  id="tingkatan"
                  name="tingkatan"
                  required
                  className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="Penggalang Ramu">Penggalang Ramu</option>
                  <option value="Penggalang Rakit">Penggalang Rakit</option>
                  <option value="Penggalang Terap">Penggalang Terap</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="regu" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Nama Regu</label>
                <input 
                  id="regu"
                  name="regu"
                  type="text"
                  required
                  placeholder="Regu Garuda"
                  className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 bg-primary text-[#E7E2D8] font-mono font-bold uppercase tracking-wider text-xs rounded-xl shadow-md hover:bg-opacity-95 transition-all cursor-pointer"
              >
                Simpan SKU & Regu
              </button>
            </form>
          </div>

        </div>


        {/* LIST TABLE */}
        <div className="lg:col-span-7 bg-white border border-[#D1C9BC] rounded-3xl p-8 shadow-sm space-y-6">
          <h3 className="font-serif font-bold text-xl text-primary border-b border-[#D1C9BC]/45 pb-3">Daftar Nilai Karakter Terinput</h3>

          <div className="divide-y divide-[#D1C9BC]/35">
            {!nilaiList || nilaiList.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Belum ada penilaian anggota terinput.</div>
            ) : (
              nilaiList.map((item: any, idx: number) => (
                <div key={item.id || idx} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-secondary text-primary rounded-xl shrink-0">
                      <Award className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-serif font-bold text-sm text-primary">{(item.siswa?.users as any)?.nama || 'Anggota Tanpa Nama'}</h4>
                      <p className="text-[10px] font-mono text-gray-500 mt-1">
                        Kategori: {item.kategori_nilai?.nama_kategori} • Nilai: <span className="font-bold text-[#5C3D2E]">{item.nilai} / 100</span>
                      </p>
                    </div>
                  </div>
                  
                  <form action={async () => {
                    'use server';
                    await deleteNilaiAction(item.id);
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

      </div>
    </div>
  );
}
