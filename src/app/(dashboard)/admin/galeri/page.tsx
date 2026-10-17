import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { createGaleriAction, deleteGaleriAction } from '@/app/actions/galeri';

export default async function AdminGaleriPage() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    redirect('/login');
  }

  // Fetch current galeri list
  const { data: galeriList } = await supabase
    .from('galeri')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-mono tracking-widest text-[#5C3D2E] uppercase font-bold">[ PENGATURAN KONTEN ]</span>
          <h1 className="text-4xl font-serif font-bold text-primary mt-2">Kelola Galeri Kegiatan</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ADD FORM */}
        <div className="lg:col-span-5 bg-white border border-[#D1C9BC] rounded-3xl p-8 shadow-sm space-y-6">
          <h3 className="font-serif font-bold text-xl text-primary border-b border-[#D1C9BC]/45 pb-3">Unggah Dokumentasi Baru</h3>
          
          {/* Server Action Form */}
          <form action={createGaleriAction} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="judul" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Judul Kegiatan / Keterangan Foto</label>
              <input 
                id="judul"
                name="judul"
                type="text" 
                required
                placeholder="Latihan Tali-Temali Pionering"
                className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="gambar" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">File Foto Dokumentasi</label>
              <input 
                id="gambar"
                name="gambar"
                type="file" 
                accept="image/*"
                required
                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border border-[#D1C9BC] file:text-xs file:font-semibold file:bg-secondary file:text-primary file:hover:bg-opacity-95"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 bg-primary text-[#E7E2D8] font-mono font-bold uppercase tracking-wider text-xs rounded-xl shadow-md hover:bg-opacity-95 transition-all cursor-pointer"
            >
              Unggah Foto
            </button>
          </form>
        </div>

        {/* LIST TABLE */}
        <div className="lg:col-span-7 bg-white border border-[#D1C9BC] rounded-3xl p-8 shadow-sm space-y-6">
          <h3 className="font-serif font-bold text-xl text-primary border-b border-[#D1C9BC]/45 pb-3">Daftar Galeri Terunggah</h3>

          <div className="divide-y divide-[#D1C9BC]/35">
            {galeriList?.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Belum ada foto galeri terunggah.</div>
            ) : (
              galeriList?.map((item: any, idx: number) => (
                <div key={item.id || idx} className="py-6 flex justify-between items-center first:pt-0 last:pb-0">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-16 rounded-lg overflow-hidden border border-[#D1C9BC]/40 bg-slate-50 shrink-0">
                      {item.gambar ? (
                        <img src={item.gambar} alt="Gallery" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-accent bg-amber-50">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-primary">{item.judul}</h4>
                      <p className="text-[10px] font-mono text-gray-500 mt-1">
                        Diupload pada: {new Date(item.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                  
                  {/* Delete button Action */}
                  <form action={async () => {
                    'use server';
                    await deleteGaleriAction(item.id);
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
