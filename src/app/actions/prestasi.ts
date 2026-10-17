'use server';

import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

import heicConvert from 'heic-convert';

export async function createPrestasiAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'pembina')) {
    throw new Error('Akses ditolak. Anda tidak memiliki wewenang.');
  }

  const nama_prestasi = formData.get('nama_prestasi') as string;
  const deskripsi = formData.get('deskripsi') as string;
  const tingkat = formData.get('tingkat') as string;
  const tanggal = formData.get('tanggal') as string;
  const file = formData.get('gambar') as File;

  if (!nama_prestasi || !tanggal || !deskripsi) {
    throw new Error('Nama, tanggal, dan deskripsi prestasi wajib diisi!');
  }

  if (!file || typeof file === 'string' || file.size === 0) {
    throw new Error('File foto dokumentasi prestasi wajib diisi!');
  }

  let gambarUrl = '';

  try {
    let buffer = Buffer.from(await file.arrayBuffer());
    let fileExt = file.name ? file.name.split('.').pop() || 'jpg' : 'jpg';
    let fileType = file.type;

    const isHEIC = 
      fileExt.toLowerCase() === 'heic' || 
      fileExt.toLowerCase() === 'heif' || 
      fileType === 'image/heic' || 
      fileType === 'image/heif';

    if (isHEIC) {
      console.log('Converting HEIC file to JPEG...');
      try {
        const converted = await heicConvert({
          buffer: buffer,
          format: 'JPEG',
          quality: 0.8
        });
        buffer = Buffer.from(converted);
        fileExt = 'jpg';
        fileType = 'image/jpeg';
      } catch (conversionError) {
        console.error('Failed to convert HEIC to JPEG:', conversionError);
      }
    }

    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('prestasi')
      .upload(fileName, buffer, {
        contentType: fileType,
        upsert: true,
      });

    if (uploadError) {
      console.warn('Bucket upload error, falling back to base64 encoding:', uploadError.message);
      const base64Data = buffer.toString('base64');
      gambarUrl = `data:${fileType};base64,${base64Data}`;
    } else {
      const { data: publicUrlData } = supabase.storage
        .from('prestasi')
        .getPublicUrl(fileName);
      gambarUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase
      .from('prestasi')
      .insert([
        {
          nama_prestasi,
          deskripsi,
          tingkat,
          tanggal,
          gambar: gambarUrl,
        },
      ]);

    if (error) throw error;
    
    revalidatePath('/');
  } catch (err: any) {
    console.error('Create prestasi action error:', err);
    throw err;
  }
}

export async function deletePrestasiAction(id: number) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'pembina')) {
    throw new Error('Akses ditolak. Anda tidak memiliki wewenang.');
  }

  try {
    const { error } = await supabase
      .from('prestasi')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    revalidatePath('/');
  } catch (err: any) {
    console.error('Delete prestasi action error:', err);
    throw err;
  }
}
