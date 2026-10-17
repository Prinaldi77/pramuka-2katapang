'use server';

import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

import heicConvert from 'heic-convert';

export async function createGaleriAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'pembina')) {
    throw new Error('Akses ditolak. Anda tidak memiliki wewenang.');
  }

  const judul = formData.get('judul') as string;
  const file = formData.get('gambar') as File;

  if (!judul) {
    throw new Error('Judul galeri wajib diisi!');
  }

  if (!file || typeof file === 'string' || file.size === 0) {
    throw new Error('File foto galeri wajib diisi!');
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
      .from('galeri')
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
