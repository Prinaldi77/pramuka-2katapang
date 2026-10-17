'use server';

import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { calculateDistance } from '@/lib/gps';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

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

// Generate Dynamic Time-based QR Token (rotates every 60 seconds)
export async function getDynamicQRTokenAction(agendaId: number) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'pembina')) {
    return { success: false, error: 'Akses ditolak. Anda tidak memiliki wewenang.' };
  }

  try {
    const { data: agenda, error } = await supabase
      .from('agenda_absensi')
      .select('id, judul, status, jam_mulai, tanggal')
      .eq('id', agendaId)
      .maybeSingle();

    if (error || !agenda) {
      return { success: false, error: 'Agenda absensi tidak ditemukan.' };
    }

    if (agenda.status === 'nonaktif') {
      return { success: false, error: 'Agenda absensi ini sedang dinonaktifkan.' };
    }

    // Window timestamp in 60-second intervals
    const nowMs = Date.now();
    const minuteWindow = Math.floor(nowMs / 60000);
    const secondsRemaining = 60 - Math.floor((nowMs % 60000) / 1000);

    const secret = process.env.JWT_SECRET || 'pramuka_dynamic_qr_salt_key_2026';
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`AGENDA:${agendaId}:TIME:${minuteWindow}`)
      .digest('hex')
      .slice(0, 16);

    const tokenPayload = `PRAMUKA_QR:${agendaId}:${minuteWindow}:${signature}`;

    return {
      success: true,
      token: tokenPayload,
      agendaId,
      judul: agenda.judul,
      minuteWindow,
      secondsRemaining,
    };
  } catch (err: any) {
    console.error('Generate QR token error:', err);
    return { success: false, error: 'Gagal membuat token QR dinamis.' };
  }
}

// Student Check-In with Dynamic QR Code
export async function checkInWithQRAction(qrPayload: string) {
  const session = await getSession();
  if (!session || session.role !== 'siswa') {
    return { success: false, error: 'Hanya akun siswa/anggota yang dapat melakukan scan absensi.' };
  }

  if (!qrPayload || typeof qrPayload !== 'string') {
    return { success: false, error: 'Data QR Code tidak valid.' };
  }

  // Expected format: PRAMUKA_QR:<agendaId>:<minuteWindow>:<signature>
  const parts = qrPayload.trim().split(':');
  if (parts.length !== 4 || parts[0] !== 'PRAMUKA_QR') {
    return { success: false, error: 'Format QR Code tidak dikenali atau bukan QR resmi Pramuka SMPN 2 Katapang.' };
  }

  const agendaId = Number(parts[1]);
  const qrMinuteWindow = Number(parts[2]);
  const signature = parts[3];

  if (!agendaId || isNaN(qrMinuteWindow) || !signature) {
    return { success: false, error: 'Parameter data QR Code rusak.' };
  }

  // 1. Time-window validation: 60-second rotation with 60-second grace window (anti-screenshot)
  const nowMs = Date.now();
  const currentMinuteWindow = Math.floor(nowMs / 60000);

  // If the scanned window is older than 1 minute window ago, reject immediately
  if (qrMinuteWindow < currentMinuteWindow - 1 || qrMinuteWindow > currentMinuteWindow + 1) {
    return {
      success: false,
      isExpired: true,
      error: 'QR Code telah kedaluwarsa! Silakan scan QR Code terbaru yang sedang tampil di layar pembina.'
    };
  }

  // 2. Cryptographic signature check
  const secret = process.env.JWT_SECRET || 'pramuka_dynamic_qr_salt_key_2026';
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(`AGENDA:${agendaId}:TIME:${qrMinuteWindow}`)
    .digest('hex')
    .slice(0, 16);

  if (signature !== expectedSig) {
    return { success: false, error: 'Keamanan QR Code gagal diverifikasi (tanda tangan tidak valid).' };
  }

  try {
    // 3. Find student profile
    const { data: siswa, error: siswaErr } = await supabase
      .from('siswa')
      .select('id, nis, kelas, regu, users(nama)')
      .eq('user_id', session.id)
      .maybeSingle();

    if (siswaErr || !siswa) {
      return { success: false, error: 'Profil siswa Anda tidak ditemukan.' };
    }

    // 4. Verify agenda is active
    const { data: agenda, error: agendaErr } = await supabase
      .from('agenda_absensi')
      .select('*')
      .eq('id', agendaId)
      .maybeSingle();

    if (agendaErr || !agenda) {
      return { success: false, error: 'Agenda absensi tidak ditemukan.' };
    }

    if (agenda.status === 'nonaktif') {
      return { success: false, error: 'Sesi agenda absensi ini sudah dinonaktifkan oleh pembina.' };
    }

    // 5. Check if already checked in
    const { data: existingAbsensi } = await supabase
      .from('absensi')
      .select('id, created_at, foto_absen')
      .eq('siswa_id', siswa.id)
      .eq('agenda_id', agendaId)
      .maybeSingle();

    if (existingAbsensi) {
      return {
        success: false,
        alreadyCheckedIn: true,
        error: `Anda sudah tercatat hadir untuk agenda "${agenda.judul}" sebelumnya.`
      };
    }

    // 6. Calculate punctuality status (toleransi 15 menit dari jam_mulai)
    let finalStatus = 'hadir';
    if (agenda.jam_mulai) {
      const [h, m] = agenda.jam_mulai.split(':').map(Number);
      const startTime = new Date();
      startTime.setHours(h, m, 0, 0);
      const toleranceTime = new Date(startTime.getTime() + 15 * 60 * 1000);
      if (nowMs > toleranceTime.getTime()) {
        finalStatus = 'telat';
      }
    }

    // 7. Save check-in record
    const { data: absensi, error: saveErr } = await supabase
      .from('absensi')
      .insert([
        {
          siswa_id: siswa.id,
          agenda_id: agendaId,
          latitude: 0,
          longitude: 0,
          jarak: 0,
          foto_absen: finalStatus // 'hadir' or 'telat'
        }
      ])
      .select('*')
      .single();

    if (saveErr) throw saveErr;

    revalidatePath('/siswa');
    revalidatePath('/siswa/absensi');
    revalidatePath('/admin/absensi');

    return {
      success: true,
      data: absensi,
      status: finalStatus,
      judulAgenda: agenda.judul,
      namaSiswa: (siswa.users as any)?.nama || 'Anggota',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
  } catch (err: any) {
    console.error('Check in with QR error:', err);
    return { success: false, error: err.message || 'Terjadi kesalahan sistem saat memproses absensi.' };
  }
}

