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
