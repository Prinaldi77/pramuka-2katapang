-- HIGH PERFORMANCE INDEXES MIGRATION
-- Paste this script into the Supabase SQL Editor to improve query performance.

-- 1. Index on users foreign key in siswa
CREATE INDEX IF NOT EXISTS idx_siswa_user_id ON siswa(user_id);

-- 2. Index on users foreign key in pembina
CREATE INDEX IF NOT EXISTS idx_pembina_user_id ON pembina(user_id);

-- 3. Index on users foreign key in berita
CREATE INDEX IF NOT EXISTS idx_berita_author_id ON berita(author_id);

-- 4. Indexes on foreign keys in absensi
CREATE INDEX IF NOT EXISTS idx_absensi_siswa_id ON absensi(siswa_id);
CREATE INDEX IF NOT EXISTS idx_absensi_agenda_id ON absensi(agenda_id);

-- 5. Indexes on foreign keys in nilai
CREATE INDEX IF NOT EXISTS idx_nilai_siswa_id ON nilai(siswa_id);
CREATE INDEX IF NOT EXISTS idx_nilai_kategori_id ON nilai(kategori_nilai_id);

-- 6. Index on siswa foreign key in pengurus
CREATE INDEX IF NOT EXISTS idx_pengurus_siswa_id ON pengurus(siswa_id);
