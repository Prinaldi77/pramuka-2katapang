import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { Shield, GraduationCap, Award, Trash2 } from 'lucide-react';
import { createUserAction, deleteUserAction } from '@/app/actions/users';

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'pembina')) {
    redirect('/login');
  }

  // Fetch current users list
  const { data: usersList } = await supabase
    .from('users')
    .select('id, nama, email, role, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-mono tracking-widest text-[#5C3D2E] uppercase font-bold">[ PENGATURAN ANGGOTA ]</span>
          <h1 className="text-4xl font-serif font-bold text-primary mt-2">Kelola Anggota Pangkalan</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ADD USER FORM */}
        <div className="lg:col-span-5 bg-white border border-[#D1C9BC] rounded-3xl p-8 shadow-sm space-y-6">
          <h3 className="font-serif font-bold text-xl text-primary border-b border-[#D1C9BC]/45 pb-3">Registrasi Anggota Baru</h3>
          
          <form action={createUserAction} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="nama" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Nama Lengkap</label>
              <input 
                id="nama"
                name="nama"
                type="text" 
                required
                placeholder="Budi Santoso"
                className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Alamat Email</label>
              <input 
                id="email"
                name="email"
                type="email" 
                required
                placeholder="budi@gmail.com"
                className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Kata Sandi Default</label>
              <input 
                id="password"
                name="password"
                type="password" 
                required
                placeholder="••••••"
                className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Peran Anggota</label>
              <select 
                id="role"
                name="role"
                className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="siswa">Siswa (Penggalang)</option>
                <option value="pembina">Pembina Utama</option>
                <option value="admin">Administrator Sistem</option>
              </select>
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 bg-primary text-[#E7E2D8] font-mono font-bold uppercase tracking-wider text-xs rounded-xl shadow-md hover:bg-opacity-95 transition-all cursor-pointer"
            >
              Daftarkan Anggota
            </button>
          </form>
        </div>

        {/* LIST TABLE */}
        <div className="lg:col-span-7 bg-white border border-[#D1C9BC] rounded-3xl p-8 shadow-sm space-y-6">
          <h3 className="font-serif font-bold text-xl text-primary border-b border-[#D1C9BC]/45 pb-3">Daftar Anggota Terdaftar</h3>

          <div className="divide-y divide-[#D1C9BC]/35">
            {!usersList || usersList.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Belum ada anggota terdaftar di database.</div>
            ) : (
              usersList.map((item: any, idx: number) => (
                <div key={item.id || idx} className="py-6 flex justify-between items-center first:pt-0 last:pb-0">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-secondary text-primary rounded-xl shrink-0">
                      {item.role === 'admin' ? (
                        <Shield className="h-5 w-5" />
                      ) : item.role === 'pembina' ? (
                        <Award className="h-5 w-5" />
                      ) : (
                        <GraduationCap className="h-5 w-5" />
                      )}
                    </div>
                    <div className="text-left">
                      <h4 className="font-serif font-bold text-sm text-primary">{item.nama}</h4>
                      <p className="text-[10px] font-mono text-gray-500 mt-1">
                        Email: {item.email} • Peran: <span className="font-bold text-[#5C3D2E] uppercase text-xs">{item.role}</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Prevent self deletion */}
                  {session.id !== item.id ? (
                    <form action={async () => {
                      'use server';
                      await deleteUserAction(item.id);
                    }}>
                      <button type="submit" className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </form>
                  ) : (
                    <span className="text-[9px] font-mono text-gray-400 uppercase">[ Akun Anda ]</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
