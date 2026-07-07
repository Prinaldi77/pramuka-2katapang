const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function seed() {
  try {
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('123456', salt);

    console.log('Menghubungkan ke Supabase...');
    console.log('Membersihkan data lama (jika ada)...');
    
    // Clear existing test users to prevent unique constraint conflict
    await supabase.from('users').delete().eq('email', 'admin@gmail.com');
    await supabase.from('users').delete().eq('email', 'pembina@gmail.com');
    await supabase.from('users').delete().eq('email', 'siswa@gmail.com');

    console.log('Memulai seeding data default users...');

    // 1. Seed Admin
    const { data: adminUser, error: adminErr } = await supabase
      .from('users')
      .insert([
        {
          nama: 'Administrator Pramuka',
          email: 'admin@gmail.com',
          password: defaultPassword,
          role: 'admin'
        }
      ])
      .select('*')
      .single();

    if (adminErr) {
      console.error('Gagal seeding Admin:', adminErr.message);
    } else {
      console.log('✔ Sukses membuat User Admin (admin@gmail.com)');
    }

    // 2. Seed Pembina User & Profile
    const { data: pembinaUser, error: pembinaErr } = await supabase
      .from('users')
      .insert([
        {
          nama: 'Kak Pembina',
          email: 'pembina@gmail.com',
          password: defaultPassword,
          role: 'pembina'
        }
      ])
      .select('*')
      .single();

    if (pembinaErr) {
      console.error('Gagal seeding User Pembina:', pembinaErr.message);
    } else {
      console.log('✔ Sukses membuat User Pembina (pembina@gmail.com)');
      
      // Seed Pembina Profile
      const { error: pembinaProfileErr } = await supabase
        .from('pembina')
        .insert([
          {
            user_id: pembinaUser.id,
            jabatan: 'Pembina Utama Gudep'
          }
        ]);
      
      if (pembinaProfileErr) {
        console.error('Gagal seeding Profil Pembina:', pembinaProfileErr.message);
      } else {
        console.log('✔ Sukses membuat Profil Pembina Kak Pembina');
      }
    }

    // 3. Seed Siswa User & Profile
    const { data: siswaUser, error: siswaErr } = await supabase
      .from('users')
      .insert([
        {
          nama: 'Budi Santoso',
          email: 'siswa@gmail.com',
          password: defaultPassword,
          role: 'siswa'
        }
      ])
      .select('*')
      .single();

    if (siswaErr) {
      console.error('Gagal seeding User Siswa:', siswaErr.message);
    } else {
      console.log('✔ Sukses membuat User Siswa (siswa@gmail.com)');
      
      // Seed Siswa Profile
      const { error: siswaProfileErr } = await supabase
        .from('siswa')
        .insert([
          {
            user_id: siswaUser.id,
            nis: '1234567890',
            kelas: 'VIII-A',
            jenis_kelamin: 'Laki-laki',
            tempat_lahir: 'Bandung',
            tanggal_lahir: '2012-08-17',
            nama_ortu: 'Slamet Santoso',
            no_hp_ortu: '08123456789'
          }
        ]);
      
      if (siswaProfileErr) {
        console.error('Gagal seeding Profil Siswa:', siswaProfileErr.message);
      } else {
        console.log('✔ Sukses membuat Profil Siswa Budi Santoso');
      }
    }

    // 4. Seed default kegiatan as Sejarah milestones
    console.log('Seeding default milestones into kegiatan table...');
    await supabase.from('kegiatan').delete().neq('id', 0); // Delete all
    const { error: kegiatanErr } = await supabase
      .from('kegiatan')
      .insert([
        {
          nama_kegiatan: 'Pendirian Gugus Depan',
          tanggal: '1998-01-01',
          deskripsi: 'Pangkalan pramuka SMPN 2 Katapang secara resmi didirikan sebagai wadah pendidikan kepanduan berkarakter bagi penggalang.',
          lokasi: 'SMPN 2 Katapang'
        },
        {
          nama_kegiatan: 'Juara Umum Cabang',
          tanggal: '2012-08-17',
          deskripsi: 'Regu penggalang Satria Batara meraih prestasi gemilang sebagai juara umum dalam lomba LKBB dan ketangkasan pionering.',
          lokasi: 'Kabupaten Bandung'
        },
        {
          nama_kegiatan: 'Penerapan Modul Digital',
          tanggal: '2020-10-28',
          deskripsi: 'Memulai digitalisasi administrasi gudep dan pencatatan riwayat penjelajahan anggota secara digital.',
          lokasi: 'SMPN 2 Katapang'
        },
        {
          nama_kegiatan: 'Ekspedisi Modern',
          tanggal: '2026-07-07',
          deskripsi: 'Redesign sistem informasi terintegrasi menggunakan Next.js 15, Geofence GPS mandiri, dan portfolio digital SKU/SKK.',
          lokasi: 'SMPN 2 Katapang'
        }
      ]);

    if (kegiatanErr) {
      console.error('Gagal seeding kegiatan:', kegiatanErr.message);
    } else {
      console.log('✔ Sukses membuat default milestones ke kegiatan');
    }

    console.log('\n=============================================================');
    console.log(' SEEDING SELESAI DENGAN SUKSES!');
    console.log(' Silakan gunakan akun berikut untuk login di website Anda:');
    console.log(' 1. Admin: admin@gmail.com (Password: 123456)');
    console.log(' 2. Pembina: pembina@gmail.com (Password: 123456)');
    console.log(' 3. Siswa: siswa@gmail.com (Password: 123456)');
    console.log('=============================================================');

  } catch (err) {
    console.error('Error saat seeding data:', err.message);
  }
}

seed();
