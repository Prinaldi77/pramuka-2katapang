import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { Trash2, Pencil } from 'lucide-react';
import { createKegiatanAction, updateKegiatanAction, deleteKegiatanAction } from '@/app/actions/kegiatan';
import Link from 'next/link';

export default async function AdminSejarahPage({
  searchParams,
}: {
  searchParams: Promise<{ editId?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    redirect('/login');
  }

  const params = await searchParams;
  const editId = params?.editId;

  // Fetch item to edit if editId is provided
  let editItem: any = null;
  if (editId) {
    const { data } = await supabase
      .from('kegiatan')
      .select('*')
      .eq('id', Number(editId))
      .maybeSingle();
    editItem = data;
  }

  // Fetch current kegiatan list (milestones) sorted by date ascending
  const { data: kegiatanList } = await supabase
    .from('kegiatan')
    .select('*')
    .order('tanggal', { ascending: true });

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-mono tracking-widest text-[#5C3D2E] uppercase font-bold">[ PENGATURAN ARSIP ]</span>
          <h1 className="text-4xl font-serif font-bold text-primary mt-2">Kelola Arsip Sejarah Gudep</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* FORM */}
        <div className="lg:col-span-5 bg-white border border-[#D1C9BC] rounded-3xl p-8 shadow-sm space-y-6">
          <h3 className="font-serif font-bold text-xl text-primary border-b border-[#D1C9BC]/45 pb-3">
            {editItem ? 'Ubah Milestone Sejarah' : 'Tambah Milestone Baru'}
          </h3>
          
          <form action={editItem ? updateKegiatanAction : createKegiatanAction} className="space-y-4">
            {editItem && <input type="hidden" name="id" value={editItem.id} />}

            <div className="space-y-2">
              <label htmlFor="nama_kegiatan" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Judul Peristiwa / Pencapaian</label>
              <input 
                id="nama_kegiatan"
                name="nama_kegiatan"
                type="text" 
                required
                defaultValue={editItem?.nama_kegiatan || ''}
                placeholder="Pendirian Pangkalan Gudep"
                className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="tanggal" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Tanggal Terjadi</label>
              <input 
                id="tanggal"
                name="tanggal"
                type="date" 
                required
                defaultValue={editItem?.tanggal || ''}
                className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="lokasi" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Lokasi Peristiwa (Opsional)</label>
              <input 
                id="lokasi"
                name="lokasi"
                type="text" 
                defaultValue={editItem?.lokasi || ''}
                placeholder="SMPN 2 Katapang"
                className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="deskripsi" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Deskripsi Ringkas Peristiwa</label>
              <textarea 
                id="deskripsi"
                name="deskripsi"
                rows={4}
                required
                defaultValue={editItem?.deskripsi || ''}
                placeholder="Deskripsikan sejarah atau prestasi penting yang diraih..."
                className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              ></textarea>
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 bg-primary text-[#E7E2D8] font-mono font-bold uppercase tracking-wider text-xs rounded-xl shadow-md hover:bg-opacity-95 transition-all cursor-pointer"
            >
              {editItem ? 'Simpan Perubahan' : 'Simpan Milestone'}
            </button>

            {editItem && (
              <Link 
                href="/admin/sejarah" 
                className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-mono font-bold uppercase tracking-wider text-xs rounded-xl shadow-sm transition-all text-center block cursor-pointer"
              >
                Batal Edit
              </Link>
            )}
          </form>
        </div>

        {/* LIST TABLE */}
        <div className="lg:col-span-7 bg-white border border-[#D1C9BC] rounded-3xl p-8 shadow-sm space-y-6">
          <h3 className="font-serif font-bold text-xl text-primary border-b border-[#D1C9BC]/45 pb-3">Daftar Urutan Milestone Sejarah</h3>

          <div className="divide-y divide-[#D1C9BC]/35">
            {!kegiatanList || kegiatanList.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Belum ada milestone terdaftar. Silakan tambahkan peristiwa di sebelah kiri.</div>
            ) : (
              kegiatanList.map((item: any, idx: number) => {
                const year = item.tanggal ? new Date(item.tanggal).getFullYear() : '-';
                return (
                  <div key={item.id || idx} className="py-6 flex justify-between items-center first:pt-0 last:pb-0">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-xl flex items-center justify-center border border-[#D1C9BC] bg-secondary text-primary font-serif font-bold shrink-0">
                        {year}
                      </div>
                      <div className="text-left">
                        <h4 className="font-serif font-bold text-sm text-primary">{item.nama_kegiatan}</h4>
                        <p className="text-xs text-gray-600 mt-1 max-w-md line-clamp-2">
                          {item.deskripsi}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Edit Button Link */}
                      <Link 
                        href={`/admin/sejarah?editId=${item.id}`} 
                        className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-secondary/35 transition-colors cursor-pointer"
                      >
                        <Pencil className="h-5 w-5" />
                      </Link>

                      {/* Delete Form Button */}
                      <form action={async () => {
                        'use server';
                        await deleteKegiatanAction(item.id);
                      }}>
                        <button type="submit" className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
