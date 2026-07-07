'use server';

import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { calculateDistance } from '@/lib/gps';
import { revalidatePath } from 'next/cache';

// Student check-in action (within geofence)
export async function checkInAction(payload: {
  siswa_id: number;
  agenda_id: number;
  latitude: number;
  longitude: number;
}) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'Sesi habis. Silakan masuk kembali.' };
  }

  try {
    // 1. Fetch agenda details
    const { data: agenda, error: agendaError } = await supabase
      .from('agenda_absensi')
      .select('*')
      .eq('id', payload.agenda_id)
      .maybeSingle();

    if (agendaError || !agenda) {
      return { success: false, error: 'Agenda absensi tidak ditemukan.' };
    }

    if (agenda.status === 'nonaktif') {
      return { success: false, error: 'Agenda absensi ini sudah tidak aktif.' };
    }

    // 2. Check if student already checked in
    const { data: existingAbsensi, error: checkError } = await supabase
      .from('absensi')
      .select('id')
      .eq('siswa_id', payload.siswa_id)
      .eq('agenda_id', payload.agenda_id)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existingAbsensi) {
      return { success: false, error: 'Anda sudah melakukan absensi untuk agenda ini.' };
    }

    // 3. Calculate Distance
    const distance = calculateDistance(
      payload.latitude,
      payload.longitude,
      agenda.latitude,
      agenda.longitude
    );

    // 4. Geofence radius validation
    if (distance > agenda.radius) {
      return {
        success: false,
        outOfRadius: true,
        error: `Anda berada di luar radius geofence. (Jarak Anda: ${Math.round(distance)}m, Maksimal: ${agenda.radius}m). Silakan ajukan izin/sakit jika berhalangan hadir di lokasi.`,
      };
    }

    // 5. Check late status (toleransi keterlambatan 15 menit)
    let finalStatus = 'hadir';
    const now = new Date();
    
    // Parse jam_mulai (format: HH:MM:SS)
    if (agenda.jam_mulai) {
      const [h, m, s] = agenda.jam_mulai.split(':').map(Number);
      const startTime = new Date(now);
      startTime.setHours(h, m, s, 0);
      
      // Add 15 minutes late tolerance
      const toleranceTime = new Date(startTime.getTime() + 15 * 60 * 1000);
      
      if (now.getTime() > toleranceTime.getTime()) {
        finalStatus = 'telat';
      }
    }

    // 6. Save attendance (store status in foto_absen column)
    const { data: absensi, error: saveError } = await supabase
      .from('absensi')
      .insert([
        {
          siswa_id: payload.siswa_id,
          agenda_id: payload.agenda_id,
          latitude: payload.latitude,
          longitude: payload.longitude,
          jarak: parseFloat(distance.toFixed(2)),
          foto_absen: finalStatus
        },
      ])
      .select('*')
      .single();

    if (saveError) throw saveError;

    revalidatePath('/siswa');
    revalidatePath('/siswa/absensi');
    return { success: true, data: absensi, status: finalStatus };
  } catch (error: any) {
    console.error('Checkin action error:', error);
    return { success: false, error: 'Gagal memproses absensi. Silakan coba lagi.' };
  }
}

// Student submit permission (Izin/Sakit) when out of radius
export async function submitIzinSakitAction(payload: {
  siswa_id: number;
  agenda_id: number;
  tipe: 'izin' | 'sakit';
}) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'Sesi habis. Silakan masuk kembali.' };
  }

  try {
    // Check if student already checked in
    const { data: existingAbsensi } = await supabase
      .from('absensi')
      .select('id')
      .eq('siswa_id', payload.siswa_id)
      .eq('agenda_id', payload.agenda_id)
      .maybeSingle();

    if (existingAbsensi) {
      return { success: false, error: 'Anda sudah mengisi absensi/izin untuk agenda ini.' };
    }

    // Save permit status (use negative distance to identify out-of-radius permit)
    const { data: absensi, error: saveError } = await supabase
      .from('absensi')
      .insert([
        {
          siswa_id: payload.siswa_id,
          agenda_id: payload.agenda_id,
          latitude: 0,
          longitude: 0,
          jarak: payload.tipe === 'izin' ? -1 : -2,
          foto_absen: payload.tipe
        },
      ])
      .select('*')
      .single();

    if (saveError) throw saveError;

    revalidatePath('/siswa');
    revalidatePath('/siswa/absensi');
    return { success: true, data: absensi };
  } catch (error: any) {
    console.error('Submit permit action error:', error);
    return { success: false, error: 'Gagal mengirim formulir izin/sakit.' };
  }
}

// Admin create attendance agenda
export async function createAgendaAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'pembina')) {
    throw new Error('Akses ditolak. Anda tidak memiliki wewenang.');
  }

  const judul = formData.get('judul') as string;
  const tanggal = formData.get('tanggal') as string;
  const jam_mulai = formData.get('jam_mulai') as string;
  const jam_selesai = formData.get('jam_selesai') as string;
  const latitude = parseFloat(formData.get('latitude') as string);
  const longitude = parseFloat(formData.get('longitude') as string);
  const radius = parseFloat(formData.get('radius') as string);

  if (!judul || !tanggal || !jam_mulai || !jam_selesai || isNaN(latitude) || isNaN(longitude) || isNaN(radius)) {
    throw new Error('Semua input parameter absensi wajib diisi dengan benar!');
  }

  try {
    const { error } = await supabase
      .from('agenda_absensi')
      .insert([
        {
          judul,
          tanggal,
          jam_mulai,
          jam_selesai,
          latitude,
          longitude,
          radius,
          status: 'aktif'
        },
      ]);

    if (error) throw error;
    revalidatePath('/admin');
  } catch (err: any) {
    console.error('Create agenda error:', err);
    throw err;
  }
}

// Admin delete attendance agenda
export async function deleteAgendaAction(id: number) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'pembina')) {
    throw new Error('Akses ditolak. Anda tidak memiliki wewenang.');
  }

  try {
    const { error } = await supabase
      .from('agenda_absensi')
      .delete()
      .eq('id', id);

    if (error) throw error;
    revalidatePath('/admin');
  } catch (err: any) {
    console.error('Delete agenda error:', err);
    throw err;
  }
}
