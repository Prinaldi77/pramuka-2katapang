'use server';

import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function sendContactMessageAction(formData: FormData) {
  const nama = formData.get('nama') as string;
  const email = formData.get('email') as string;
  const pesan = formData.get('pesan') as string;

  if (!nama || !email || !pesan) {
    return { success: false, error: 'Semua kolom formulir wajib diisi!' };
  }

  try {
    const { error } = await supabase
      .from('pesan')
      .insert([
        {
          nama,
          email,
          subjek: 'Hubungi Kami - Portal Utama',
          pesan,
          is_read: false
        },
      ]);

    if (error) throw error;

    revalidatePath('/admin/pesan');
    return { success: true };
  } catch (err: any) {
    console.error('Send contact message error:', err);
    return { success: false, error: 'Gagal mengirim pesan. Silakan coba kembali.' };
  }
}

export async function deleteMessageAction(id: number) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'pembina')) {
    throw new Error('Akses ditolak. Anda tidak memiliki wewenang.');
  }

  try {
    const { error } = await supabase
      .from('pesan')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/pesan');
  } catch (err: any) {
    console.error('Delete message error:', err);
    throw err;
  }
}
