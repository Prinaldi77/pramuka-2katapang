'use server';

import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function createGaleriAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'pembina')) {
    throw new Error('Akses ditolak. Anda tidak memiliki wewenang.');
  }

  const judul = formData.get('judul') as string;
  const file = formData.get('gambar') as File;

  if (!judul || !file || file.size === 0) {
    throw new Error('Judul dan file foto galeri wajib diisi!');
  }

  let gambarUrl = '';

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.name}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('galeri')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.warn('Bucket upload error, falling back to base64 encoding:', uploadError.message);
      const base64Data = buffer.toString('base64');
      gambarUrl = `data:${file.type};base64,${base64Data}`;
    } else {
      const { data: publicUrlData } = supabase.storage
        .from('galeri')
        .getPublicUrl(fileName);
      gambarUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase
      .from('galeri')
      .insert([
        {
          judul,
          gambar: gambarUrl,
        },
      ]);

    if (error) throw error;
    
    revalidatePath('/');
  } catch (err: any) {
    console.error('Create galeri action error:', err);
    throw err;
  }
}

export async function deleteGaleriAction(id: number) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'pembina')) {
    throw new Error('Akses ditolak. Anda tidak memiliki wewenang.');
  }

  try {
    const { error } = await supabase
      .from('galeri')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    revalidatePath('/');
  } catch (err: any) {
    console.error('Delete galeri action error:', err);
    throw err;
  }
}
