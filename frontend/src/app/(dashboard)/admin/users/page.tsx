import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import UsersTabsContainer from '@/components/users/users-tabs-container';

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'pembina')) {
    redirect('/login');
  }

  // 1. Fetch current users list
  const { data: usersList } = await supabase
    .from('users')
    .select('id, nama, email, role, created_at')
    .order('created_at', { ascending: false });

  // 2. Fetch pembina profiles linked to users for dropdown selection
  const { data: pembinaList } = await supabase
    .from('pembina')
    .select(`
      id,
      jabatan,
      users (
        nama,
        email
      )
    `)
    .order('id', { ascending: true });

  // 3. Fetch student profiles linked to users for dropdown selection
  const { data: siswaList } = await supabase
    .from('siswa')
    .select(`
      id,
      nis,
      kelas,
      users (
        nama
      )
    `)
    .order('id', { ascending: true });

  // 4. Fetch dewan pengurus list
  const { data: pengurusList } = await supabase
    .from('pengurus')
    .select(`
      id,
      jabatan,
      periode,
      siswa (
        id,
        users (
          nama
        )
      )
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex justify-between items-center text-left">
        <div>
          <span className="text-xs font-mono tracking-widest text-[#5C3D2E] uppercase font-bold">[ PENGATURAN ANGGOTA & PENGURUS ]</span>
          <h1 className="text-4xl font-serif font-bold text-primary mt-2">Kelola Anggota & Kepengurusan</h1>
        </div>
      </div>

      <UsersTabsContainer
        usersList={usersList || []}
        pembinaList={pembinaList || []}
        siswaList={siswaList || []}
        pengurusList={pengurusList || []}
        currentUserId={session.id}
      />
    </div>
  );
}
