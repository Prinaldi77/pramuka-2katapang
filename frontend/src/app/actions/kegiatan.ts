'use server';

import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function createKegiatanAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'pembina')) {
    throw new Error('Akses ditolak. Anda tidak memiliki wewenang.');
  }

  const nama_kegiatan = formData.get('nama_kegiatan') as string;
  const tanggal = formData.get('tanggal') as string;
  const deskripsi = formData.get('deskripsi') as string;
  const lokasi = formData.get('lokasi') as string;

  if (!nama_kegiatan || !tanggal || !deskripsi) {
    throw new Error('Nama, tanggal, dan deskripsi wajib diisi!');
  }

  try {
    const { error } = await supabase
      .from('kegiatan')
      .insert([
        {
          nama_kegiatan,
          tanggal,
          deskripsi,
          lokasi: lokasi || 'SMPN 2 Katapang'
        },
      ]);

    if (error) throw error;
    
    revalidatePath('/');
  } catch (err: any) {
    console.error('Create kegiatan action error:', err);
    throw err;
  }
}

export async function updateKegiatanAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'pembina')) {
    throw new Error('Akses ditolak. Anda tidak memiliki wewenang.');
  }

  const id = Number(formData.get('id'));
  const nama_kegiatan = formData.get('nama_kegiatan') as string;
  const tanggal = formData.get('tanggal') as string;
  const deskripsi = formData.get('deskripsi') as string;
  const lokasi = formData.get('lokasi') as string;

  if (!id || !nama_kegiatan || !tanggal || !deskripsi) {
    throw new Error('Semua input wajib diisi untuk mengubah data!');
  }

  try {
    const { error } = await supabase
      .from('kegiatan')
      .update({
        nama_kegiatan,
        tanggal,
        deskripsi,
        lokasi: lokasi || 'SMPN 2 Katapang'
      })
      .eq('id', id);

    if (error) throw error;
    
    revalidatePath('/');
  } catch (err: any) {
    console.error('Update kegiatan action error:', err);
    throw err;
  }
}

export async function deleteKegiatanAction(id: number) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'pembina')) {
    throw new Error('Akses ditolak. Anda tidak memiliki wewenang.');
  }

  try {
    const { error } = await supabase
      .from('kegiatan')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    revalidatePath('/');
  } catch (err: any) {
    console.error('Delete kegiatan action error:', err);
    throw err;
  }
}
