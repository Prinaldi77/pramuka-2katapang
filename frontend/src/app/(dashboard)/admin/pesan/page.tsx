import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { Mail, Trash2 } from 'lucide-react';
import { deleteMessageAction } from '@/app/actions/pesan';

export default async function AdminPesanPage() {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'pembina')) {
    redirect('/login');
  }

  // Fetch current contact messages list
  const { data: messagesList } = await supabase
    .from('pesan')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-mono tracking-widest text-[#5C3D2E] uppercase font-bold">[ ARSIP PESAN MASUK ]</span>
          <h1 className="text-4xl font-serif font-bold text-primary mt-2">Daftar Pesan Kontak</h1>
        </div>
      </div>

      <div className="bg-white border border-[#D1C9BC] rounded-3xl p-8 shadow-sm space-y-6">
        <h3 className="font-serif font-bold text-xl text-primary border-b border-[#D1C9BC]/45 pb-3">Pesan Hubungi Kami</h3>

        <div className="divide-y divide-[#D1C9BC]/35">
          {!messagesList || messagesList.length === 0 ? (
            <div className="text-center py-12 text-gray-400">Belum ada pesan masuk dari formulir kontak.</div>
          ) : (
            messagesList.map((item: any, idx: number) => (
              <div key={item.id || idx} className="py-6 flex justify-between items-start first:pt-0 last:pb-0 text-left">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-secondary text-primary rounded-xl shrink-0 mt-1">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-primary">{item.nama}</h4>
                    <p className="text-[10px] font-mono text-gray-500 mt-0.5">
                      Email: <a href={`mailto:${item.email}`} className="underline hover:text-accent">{item.email}</a> • Dikirim: {new Date(item.created_at).toLocaleString('id-ID')}
                    </p>
                    <p className="text-sm text-gray-700 mt-3 leading-relaxed bg-[#FBF9F6] p-4 border border-[#D1C9BC]/35 rounded-xl max-w-2xl">
                      {item.pesan}
                    </p>
                  </div>
                </div>
                
                <form action={async () => {
                  'use server';
                  await deleteMessageAction(item.id);
                }}>
                  <button type="submit" className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer mt-1">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
