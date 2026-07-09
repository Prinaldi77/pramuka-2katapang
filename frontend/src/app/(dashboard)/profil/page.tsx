import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import ProfileForm from '@/components/profile/profile-form';

export default async function ProfilPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  // Fetch the latest user profile details (including photo)
  const { data: user, error } = await supabase
    .from('users')
    .select('id, nama, email, role, foto_profil')
    .eq('id', session.id)
    .single();

  if (error || !user) {
    console.error('Failed to load user profile on page:', error);
    return (
      <div className="p-8 border border-red-200 bg-red-50 text-red-700 rounded-xl text-left">
        Gagal memuat profil pengguna. Silakan coba masuk kembali.
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div>
        <span className="text-xs font-mono tracking-widest text-[#5C3D2E] uppercase font-bold">[ PROFIL ANGGOTA ]</span>
        <h1 className="text-4xl font-serif font-bold text-primary mt-2">Profil & Akun</h1>
      </div>
      <ProfileForm user={user} />
    </div>
  );
}
