'use server';

import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

// Update Pembina Position Title (e.g. Mabigus, Pembina Putra/Putri)
export async function updatePembinaJabatanAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'pembina')) {
    return { success: false, error: 'Akses ditolak. Anda tidak memiliki wewenang.' };
  }

  const pembinaId = formData.get('pembinaId') as string;
  const jabatan = formData.get('jabatan') as string;

  if (!pembinaId || !jabatan || jabatan.trim() === '') {
    return { success: false, error: 'Semua input wajib diisi!' };
  }

  try {
    const { error } = await supabase
      .from('pembina')
      .update({ jabatan: jabatan.trim() })
      .eq('id', parseInt(pembinaId));

    if (error) throw error;

    revalidatePath('/admin/users');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Update pembina jabatan error:', err);
    return { success: false, error: err.message || 'Gagal memperbarui jabatan Pembina.' };
  }
}

// Assign Student to Dewan Pengurus
export async function addDewanPengurusAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'pembina')) {
    return { success: false, error: 'Akses ditolak. Anda tidak memiliki wewenang.' };
  }

  const siswaId = formData.get('siswaId') as string;
  const jabatan = formData.get('jabatan') as string;
  const periode = formData.get('periode') as string;

  if (!siswaId || !jabatan || !periode || jabatan.trim() === '' || periode.trim() === '') {
    return { success: false, error: 'Semua input wajib diisi!' };
  }

  try {
    // Check if student is already assigned to this position in the same period
    const { data: existing } = await supabase
      .from('pengurus')
      .select('id')
      .eq('siswa_id', parseInt(siswaId))
      .eq('jabatan', jabatan.trim())
      .maybeSingle();

    if (existing) {
      return { success: false, error: 'Siswa ini sudah menjabat posisi tersebut di database!' };
    }

    const { error } = await supabase
      .from('pengurus')
      .insert([
        {
          siswa_id: parseInt(siswaId),
          jabatan: jabatan.trim(),
          periode: periode.trim(),
        },
      ]);

    if (error) throw error;

    revalidatePath('/admin/users');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Add dewan pengurus error:', err);
    return { success: false, error: err.message || 'Gagal menambahkan dewan pengurus.' };
  }
}

// Remove Student from Dewan Pengurus
export async function deleteDewanPengurusAction(id: number) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'pembina')) {
    return { success: false, error: 'Akses ditolak. Anda tidak memiliki wewenang.' };
  }

  try {
    const { error } = await supabase
      .from('pengurus')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/users');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Delete dewan pengurus error:', err);
    return { success: false, error: err.message || 'Gagal menghapus dewan pengurus.' };
  }
}
