import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import ProfileForm from '@/components/profile/profile-form';

export default async function ProfilPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  // Fetch the latest user profile details (including photo and student relation)
  const { data: user, error } = await supabase
    .from('users')
    .select(`
      id,
      nama,
      email,
      role,
      foto_profil,
      siswa (
        nis,
        kelas,
        jenis_kelamin,
        no_hp_ortu
      )
    `)
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

  // Format the user object to map flat student attributes to the form
  const studentData = (user.siswa && Array.isArray(user.siswa) ? user.siswa[0] : user.siswa) as any;
  const formattedUser = {
    id: user.id,
    nama: user.nama,
    email: user.email,
    role: user.role,
    foto_profil: user.foto_profil,
    nis: studentData?.nis || '',
    kelas: studentData?.kelas || '',
    jenis_kelamin: studentData?.jenis_kelamin || 'Laki-laki',
    phone: studentData?.no_hp_ortu || ''
  };

  return (
    <div className="space-y-12">
      <div>
        <span className="text-xs font-mono tracking-widest text-[#5C3D2E] uppercase font-bold">[ PROFIL ANGGOTA ]</span>
        <h1 className="text-4xl font-serif font-bold text-primary mt-2">Profil & Akun</h1>
      </div>
      <ProfileForm user={formattedUser} />
    </div>
  );
}
