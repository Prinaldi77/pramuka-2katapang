'use server';

import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function createUserAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'pembina')) {
    return { success: false, error: 'Akses ditolak. Anda tidak memiliki wewenang.' };
  }

  const nama = formData.get('nama') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;
  
  // Additional fields for student
  const nis = formData.get('nis') as string;
  const kelas = formData.get('kelas') as string;
  const jenis_kelamin = formData.get('jenis_kelamin') as string;

  if (!nama || !email || !password || !role) {
    return { success: false, error: 'Semua input pendaftaran anggota wajib diisi!' };
  }

  if (password.length < 8) {
    return { success: false, error: 'Kata sandi minimal 8 karakter!' };
  }

  try {
    // 1. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2. Insert into users table
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert([
        {
          nama,
          email,
          password: hashedPassword,
          role,
        },
      ])
      .select('*')
      .single();

    if (userError) {
      if (userError.message.includes('unique') || userError.message.includes('already exists')) {
        return { success: false, error: 'Email sudah terdaftar.' };
      }
      throw userError;
    }

    // 3. If role is siswa, seed basic profile matching database schema
    if (role === 'siswa' && newUser) {
      const { error: profileError } = await supabase
        .from('siswa')
        .insert([
          {
            user_id: newUser.id,
            nis: nis?.trim() || `NIS-${Date.now().toString().slice(-6)}`,
            kelas: kelas?.trim() || 'VIII-A',
            jenis_kelamin: jenis_kelamin || 'Laki-laki',
          },
        ]);
      if (profileError) console.error('Error seeding siswa profile:', profileError.message);
    }

    // 4. If role is pembina, seed basic profile matching database schema
    if (role === 'pembina' && newUser) {
      const { error: pembinaProfileError } = await supabase
        .from('pembina')
        .insert([
          {
            user_id: newUser.id,
            jabatan: 'Pembina Utama'
          },
        ]);
      if (pembinaProfileError) console.error('Error seeding pembina profile:', pembinaProfileError.message);
    }

    revalidatePath('/admin/users');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Create user action error:', err);
    return { success: false, error: err.message || 'Terjadi kesalahan internal.' };
  }
}

export async function deleteUserAction(id: number) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'pembina')) {
    throw new Error('Akses ditolak. Anda tidak memiliki wewenang.');
  }

  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/users');
  } catch (err: any) {
    console.error('Delete user action error:', err);
    throw err;
  }
}
