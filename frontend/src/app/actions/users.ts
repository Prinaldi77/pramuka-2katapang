'use server';

import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function createUserAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'pembina')) {
    throw new Error('Akses ditolak. Anda tidak memiliki wewenang.');
  }

  const nama = formData.get('nama') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  if (!nama || !email || !password || !role) {
    throw new Error('Semua input pendaftaran anggota wajib diisi!');
  }

  if (password.length < 8) {
    throw new Error('Kata sandi minimal 8 karakter!');
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    throw new Error('Kata sandi harus mengandung minimal satu huruf besar, satu huruf kecil, satu angka, dan satu karakter khusus/simbol!');
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

    if (userError) throw userError;

    // 3. If role is siswa, seed basic profile matching database schema
    if (role === 'siswa' && newUser) {
      const { error: profileError } = await supabase
        .from('siswa')
        .insert([
          {
            user_id: newUser.id,
            nis: `NIS-${Date.now().toString().slice(-6)}`,
            kelas: 'VIII-A',
            jenis_kelamin: 'Laki-laki',
          },
        ]);
      if (profileError) console.error('Error seeding siswa profile:', profileError.message);
    }

    revalidatePath('/admin/users');
  } catch (err: any) {
    console.error('Create user action error:', err);
    throw err;
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
