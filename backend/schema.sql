-- DDL DATABASE SCHEMA - SISTEM INFORMASI PRAMUKA SMPN 2 KATAPANG
-- Paste this script into the SQL Editor of your Supabase dashboard to create the tables.

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'pembina', 'siswa')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Siswa Table (Student profiles, links to users)
CREATE TABLE IF NOT EXISTS siswa (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nis VARCHAR(50) UNIQUE NOT NULL,
    kelas VARCHAR(50) NOT NULL,
    jenis_kelamin VARCHAR(20) NOT NULL CHECK (jenis_kelamin IN ('Laki-laki', 'Perempuan')),
    tempat_lahir VARCHAR(100),
    tanggal_lahir DATE,
    nama_ortu VARCHAR(255),
    no_hp_ortu VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Pembina Table (Instructor profiles, links to users)
CREATE TABLE IF NOT EXISTS pembina (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    jabatan VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Profil Gudep Table (Organization details)
CREATE TABLE IF NOT EXISTS profil (
    id SERIAL PRIMARY KEY,
    nama_gudep VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    visi TEXT,
    misi TEXT,
    alamat TEXT,
    email VARCHAR(255),
    telepon VARCHAR(50),
    logo TEXT, -- Public URL of the uploaded image
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Berita Table
CREATE TABLE IF NOT EXISTS berita (
    id SERIAL PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    isi TEXT NOT NULL,
    gambar TEXT,
    author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Kegiatan Table
CREATE TABLE IF NOT EXISTS kegiatan (
    id SERIAL PRIMARY KEY,
    nama_kegiatan VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    tanggal DATE NOT NULL,
    lokasi VARCHAR(255),
    gambar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Prestasi Table
CREATE TABLE IF NOT EXISTS prestasi (
    id SERIAL PRIMARY KEY,
    nama_prestasi VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    tanggal DATE NOT NULL,
    gambar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Galeri Table
CREATE TABLE IF NOT EXISTS galeri (
    id SERIAL PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    gambar TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Pesan Table (Contact messages)
CREATE TABLE IF NOT EXISTS pesan (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subjek VARCHAR(255) NOT NULL,
    pesan TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Agenda Absensi Table (GPS Attendance Events)
CREATE TABLE IF NOT EXISTS agenda_absensi (
    id SERIAL PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    tanggal DATE NOT NULL,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    radius DOUBLE PRECISION NOT NULL, -- Radius in meters
    status VARCHAR(50) DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Absensi Table (Student GPS Check-in)
CREATE TABLE IF NOT EXISTS absensi (
    id SERIAL PRIMARY KEY,
    siswa_id INTEGER REFERENCES siswa(id) ON DELETE CASCADE,
    agenda_id INTEGER REFERENCES agenda_absensi(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    jarak DOUBLE PRECISION NOT NULL, -- Distance in meters
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(siswa_id, agenda_id)
);

-- 12. Kategori Nilai Table (Grading Categories)
CREATE TABLE IF NOT EXISTS kategori_nilai (
    id SERIAL PRIMARY KEY,
    nama_kategori VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Nilai Table (Student Scores, links to Siswa and Kategori Nilai)
CREATE TABLE IF NOT EXISTS nilai (
    id SERIAL PRIMARY KEY,
    siswa_id INTEGER REFERENCES siswa(id) ON DELETE CASCADE,
    kategori_nilai_id INTEGER REFERENCES kategori_nilai(id) ON DELETE CASCADE,
    nilai INTEGER NOT NULL CHECK (nilai >= 0 AND nilai <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(siswa_id, kategori_nilai_id)
);

-- 14. Pengurus Table (Student Scout Board Members)
CREATE TABLE IF NOT EXISTS pengurus (
    id SERIAL PRIMARY KEY,
    siswa_id INTEGER REFERENCES siswa(id) ON DELETE CASCADE,
    jabatan VARCHAR(255) NOT NULL,
    periode VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Pengaturan Table (Website general settings)
CREATE TABLE IF NOT EXISTS pengaturan (
    id SERIAL PRIMARY KEY,
    nama_aplikasi VARCHAR(255) NOT NULL,
    logo TEXT,
    favicon TEXT,
    footer VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- INITIAL SEED DATA
-- =========================================================================

-- Seed Nilai Categories
INSERT INTO kategori_nilai (nama_kategori) VALUES
('Keaktifan'),
('Kedisiplinan'),
('Kerjasama'),
('Tanggung Jawab')
ON CONFLICT (nama_kategori) DO NOTHING;

-- Seed Default Website Settings
INSERT INTO pengaturan (nama_aplikasi, footer) 
VALUES ('Sistem Informasi Pramuka SMPN 2 Katapang', '© 2026 SMPN 2 Katapang. All rights reserved.')
ON CONFLICT DO NOTHING;

-- Seed Default Gudep Profile
INSERT INTO profil (nama_gudep, deskripsi, visi, misi, alamat, email, telepon) 
VALUES (
    'Pramuka SMPN 2 Katapang', 
    'Gugus Depan Pramuka SMPN 2 Katapang merupakan wadah pembinaan karakter, kedisiplinan, dan kepemimpinan bagi peserta didik.',
    'Terwujudnya anggota pramuka yang berkarakter unggul, mandiri, disiplin, berwawasan kebangsaan, dan bertakwa kepada Tuhan Yang Maha Esa.',
    '1. Menyelenggarakan latihan kepramukaan rutin yang menarik dan mendidik. \n2. Menanamkan nilai-nilai Dasa Darma dan Tri Satya dalam kehidupan sehari-hari.\n3. Mengikuti kegiatan kepramukaan di tingkat ranting, cabang, daerah, maupun nasional.',
    'Komplek Gading Junti Asri, Desa Sangkanhurip, Kecamatan Katapang, Kabupaten Bandung, Jawa Barat',
    'pramukasmpn2katapang@gmail.com',
    '+6289520116268'
) ON CONFLICT DO NOTHING;
