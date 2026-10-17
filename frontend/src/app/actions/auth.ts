'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '@/lib/supabase';

const JWT_SECRET = process.env.JWT_SECRET;

export async function loginAction(state: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Email dan kata sandi wajib diisi!' };
  }

  try {
    // 1. Fetch user from Supabase
    const { data: user, error: fetchErr } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (fetchErr || !user) {
      return { success: false, error: 'Email atau kata sandi salah.' };
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { success: false, error: 'Email atau kata sandi salah.' };
    }

    // 3. Check for JWT_SECRET
    if (!JWT_SECRET) {
      console.error('FATAL SECURITY ERROR: JWT_SECRET environment variable is missing on server!');
      return { success: false, error: 'Kesalahan internal sistem konfigurasi keamanan.' };
    }

    // 4. Sign JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 5. Store in secure HttpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    // 6. Return mapped user profile metadata (no password)
    return {
      success: true,
      error: null,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error: any) {
    console.error('Login action error:', error);
    return { success: false, error: 'Terjadi kesalahan pada server. Silakan coba lagi.' };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/login');
}

