import { supabase } from '@/lib/supabase';
import JournalLanding from '@/components/journal/journal-landing';

export const revalidate = 60; // Revalidate every minute

export default async function Page() {
  // 1. Fetch counts
  const { count: siswaCount } = await supabase
    .from('siswa')
    .select('*', { count: 'exact', head: true });

  const { count: pembinaCount } = await supabase
    .from('pembina')
    .select('*', { count: 'exact', head: true });

  const { count: pengurusCount } = await supabase
    .from('pengurus')
    .select('*', { count: 'exact', head: true });

  const { count: kegiatanCount } = await supabase
    .from('kegiatan')
    .select('*', { count: 'exact', head: true });

  // 2. Fetch list data
  const { data: kegiatanList } = await supabase
    .from('kegiatan')
    .select('*')
    .order('tanggal', { ascending: true });

  const { data: prestasiList } = await supabase
    .from('prestasi')
    .select('*')
    .order('tanggal', { ascending: false })
    .limit(6);

  const { data: galeriList } = await supabase
    .from('galeri')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6);

  // Fetch pembina list for kepengurusan
  const { data: pembinaList } = await supabase
    .from('pembina')
    .select(`
      id,
      jabatan,
      users (
        nama,
        foto_profil
      )
    `);

  // Fetch pengurus list for kepengurusan
  const { data: pengurusList } = await supabase
    .from('pengurus')
    .select(`
      id,
      jabatan,
      periode,
      siswa (
        users (
          nama,
          foto_profil
        )
      )
    `);

  // Transform and combine lists
  const mappedPembina = (pembinaList || []).map((p: any) => ({
    id: `pembina-${p.id}`,
    nama: p.users?.nama || 'Pembina',
    jabatan: p.jabatan || 'Pembina',
    foto_profil: p.users?.foto_profil || '',
    type: 'pembina',
    periode: ''
  }));

  const mappedPengurus = (pengurusList || []).map((p: any) => ({
    id: `pengurus-${p.id}`,
    nama: p.siswa?.users?.nama || 'Siswa',
    jabatan: p.jabatan || 'Pengurus',
    foto_profil: p.siswa?.users?.foto_profil || '',
    type: 'siswa',
    periode: p.periode || ''
  }));

  const kepengurusanList = [...mappedPembina, ...mappedPengurus];

  // 3. Set actual counts or 0 if empty
  const stats = {
    siswa: siswaCount || 0,
    pembina: pembinaCount || 0,
    pengurus: pengurusCount || 0,
    kegiatan: kegiatanCount || 0,
  };

  return (
    <JournalLanding
      stats={stats}
      kegiatan={kegiatanList || []}
      prestasi={prestasiList || []}
      galeri={galeriList || []}
      kepengurusan={kepengurusanList}
    />
  );
}
