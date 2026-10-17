'use server';

import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function upsertNilaiAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'pembina')) {
    throw new Error('Akses ditolak. Anda tidak memiliki wewenang.');
  }

  const siswa_id = Number(formData.get('siswa_id'));
  const kategori_nilai_id = Number(formData.get('kategori_nilai_id'));
  const nilai = Number(formData.get('nilai'));

  if (!siswa_id || !kategori_nilai_id || isNaN(nilai) || nilai < 0 || nilai > 100) {
    throw new Error('Pilih siswa, kategori, dan masukkan nilai yang valid (0-100)!');
  }

  try {
    // Check if score already exists for this student and category to prevent duplicates
    const { data: existingNilai } = await supabase
      .from('nilai')
      .select('id')
      .eq('siswa_id', siswa_id)
      .eq('kategori_nilai_id', kategori_nilai_id)
      .maybeSingle();

    if (existingNilai) {
      // Update existing record
      const { error } = await supabase
        .from('nilai')
        .update({ nilai })
        .eq('id', existingNilai.id);
      if (error) throw error;
    } else {
      // Insert new record
      const { error } = await supabase
        .from('nilai')
        .insert([
          {
            siswa_id,
            kategori_nilai_id,
            nilai
          }
        ]);
      if (error) throw error;
    }

    revalidatePath('/siswa/sku');
    revalidatePath('/admin/penilaian');
  } catch (err: any) {
    console.error('Upsert nilai action error:', err);
    throw err;
  }
}

export async function deleteNilaiAction(id: number) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'pembina')) {
    throw new Error('Akses ditolak. Anda tidak memiliki wewenang.');
  }

  try {
    const { error } = await supabase
      .from('nilai')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/siswa/sku');
    revalidatePath('/admin/penilaian');
  } catch (err: any) {
    console.error('Delete nilai action error:', err);
    throw err;
  }
}

export async function updateSiswaSkuAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'pembina')) {
    throw new Error('Akses ditolak. Anda tidak memiliki wewenang.');
  }

  const siswa_id = Number(formData.get('siswa_id'));
  const tingkatan = formData.get('tingkatan') as string;
  const regu = formData.get('regu') as string;

  if (!siswa_id || !tingkatan || !regu) {
    throw new Error('Pilih siswa, masukkan tingkatan SKU, dan masukkan regu yang valid!');
  }

  try {
    const { error } = await supabase
      .from('siswa')
      .update({ tingkatan, regu })
      .eq('id', siswa_id);

    if (error) throw error;

    revalidatePath('/siswa');
    revalidatePath('/siswa/sku');
    revalidatePath('/admin/penilaian');
  } catch (err: any) {
    console.error('Update siswa SKU action error:', err);
    throw err;
  }
}

