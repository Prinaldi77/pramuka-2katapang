'use server';

import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import heicConvert from 'heic-convert';

export async function updateProfileAction(formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'Akses ditolak. Anda belum masuk.' };
  }

  const nama = formData.get('nama') as string;
  const password = formData.get('password') as string;
  const file = formData.get('foto') as File | null;

  if (!nama || nama.trim() === '') {
    return { success: false, error: 'Nama lengkap wajib diisi!' };
  }

  const updates: any = {
    nama: nama.trim()
  };

  // 1. Handle Password Update
  if (password && password.trim() !== '') {
    if (password.length < 8) {
      return { success: false, error: 'Kata sandi baru minimal 8 karakter!' };
    }
    const salt = await bcrypt.genSalt(10);
    updates.password = await bcrypt.hash(password, salt);
  }

  // 2. Handle Profile Photo Update
  if (file && file.size > 0 && typeof file !== 'string') {
    try {
      let buffer = Buffer.from(await file.arrayBuffer());
      let fileExt = file.name ? file.name.split('.').pop() || 'jpg' : 'jpg';
      let fileType = file.type;

      // HEIC Conversion if needed
      const isHEIC = 
        fileExt.toLowerCase() === 'heic' || 
        fileExt.toLowerCase() === 'heif' || 
        fileType === 'image/heic' || 
        fileType === 'image/heif';

      if (isHEIC) {
        console.log('Converting HEIC profile picture to JPEG...');
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

      const fileName = `avatar-${session.id}-${Date.now()}.${fileExt}`;
      
      // Upload to 'avatars' storage bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, buffer, {
          contentType: fileType,
          upsert: true,
        });

      if (uploadError) {
        console.warn('Avatars bucket upload error, falling back to base64 encoding:', uploadError.message);
        // Fallback to Base64
        const base64Data = buffer.toString('base64');
        updates.foto_profil = `data:${fileType};base64,${base64Data}`;
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        updates.foto_profil = publicUrlData.publicUrl;
      }
    } catch (err: any) {
      console.error('Failed to process image:', err.message);
      return { success: false, error: 'Gagal memproses unggahan foto profil.' };
    }
  }

  try {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', session.id);

    if (error) {
      console.error('Database update error:', error.message);
      return { success: false, error: 'Gagal memperbarui data profil ke database.' };
    }

    revalidatePath('/profil');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Update profile error:', err);
    return { success: false, error: err.message || 'Terjadi kesalahan sistem.' };
  }
}
