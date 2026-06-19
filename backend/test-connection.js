const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('Mencoba menghubungkan ke Supabase...');
console.log('URL Project:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    // Attempt to select from 'users' table
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (error) {
      console.log('\n-------------------------------------------------------------');
      console.log(' [KONEKSI BERHASIL] Terhubung ke server Supabase.');
      console.log(' Detail status database:');
      console.log(` - Pesan: ${error.message}`);
      console.log(' \n Hal ini wajar jika:');
      console.log(' 1. Anda belum menjalankan script DDL di SQL Editor Supabase.');
      console.log(' 2. Aturan Row Level Security (RLS) diaktifkan dan memblokir anon key.');
      console.log('-------------------------------------------------------------');
    } else {
      console.log('\n-------------------------------------------------------------');
      console.log(' [KONEKSI SUKSES] Terhubung ke Supabase dan tabel "users" terbaca!');
      console.log('-------------------------------------------------------------');
    }
  } catch (err) {
    console.error('\n [ERROR] Gagal total menghubungkan ke server:', err.message);
  }
}

test();
