const supabase = require('../config/supabase');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// Ambil semua data nilai siswa
const getNilai = async (req, res, next) => {
  try {
    // Ambil data nilai mentah
    const { data: rawGrades, error: gradesError } = await supabase
      .from('nilai')
      .select('id, siswa_id, kategori_nilai_id, nilai')
      .order('id', { ascending: true });

    if (gradesError) throw gradesError;

    // Ambil jumlah seluruh agenda kegiatan
    const { count: totalAgenda, error: agendaError } = await supabase
      .from('agenda_absensi')
      .select('id', { count: 'exact', head: true });

    if (agendaError) throw agendaError;

    // Ambil data riwayat absensi (hanya siswa_id)
    const { data: absensiLogs, error: absensiError } = await supabase
      .from('absensi')
      .select('siswa_id');

    if (absensiError) throw absensiError;

    // Kelompokkan nilai per siswa
    const gradesBySiswa = {};
    rawGrades.forEach((row) => {
      const sId = row.siswa_id;
      if (!gradesBySiswa[sId]) {
        gradesBySiswa[sId] = {
          id: row.id,
          siswa_id: sId,
          keaktifan: 0,
          kedisiplinan: 0,
          kerjasama: 0,
          tanggung_jawab: 0,
          kehadiran: 0,
          catatan: "Sangat baik dalam mengikuti kegiatan pramuka. Tingkatkan terus kedisiplinan dan keterampilan kepramukaan Anda!"
        };
      }

      if (row.kategori_nilai_id === 1) gradesBySiswa[sId].keaktifan = row.nilai;
      else if (row.kategori_nilai_id === 2) gradesBySiswa[sId].kedisiplinan = row.nilai;
      else if (row.kategori_nilai_id === 3) gradesBySiswa[sId].kerjasama = row.nilai;
      else if (row.kategori_nilai_id === 4) gradesBySiswa[sId].tanggung_jawab = row.nilai;
    });

    // Hitung persentase kehadiran masing-masing siswa
    Object.keys(gradesBySiswa).forEach((sId) => {
      const studentAbsenCount = absensiLogs.filter(a => a.siswa_id === Number(sId)).length;
      const kehadiranScore = totalAgenda > 0 ? Math.round((studentAbsenCount / totalAgenda) * 100) : 0;
      gradesBySiswa[sId].kehadiran = kehadiranScore;
    });

    return sendSuccess(res, 'Data nilai berhasil diambil.', Object.values(gradesBySiswa));
  } catch (error) {
    next(error);
  }
};

// Ambil data nilai berdasarkan ID siswa
const getNilaiBySiswa = async (req, res, next) => {
  try {
    const { siswaId } = req.params;

    const { data: nilaiList, error } = await supabase
      .from('nilai')
      .select('*, kategori_nilai(*)')
      .eq('siswa_id', siswaId)
      .order('id', { ascending: true });

    if (error) throw error;

    return sendSuccess(res, 'Data nilai siswa berhasil diambil.', nilaiList);
  } catch (error) {
    next(error);
  }
};

// Buat atau update nilai siswa
const createNilai = async (req, res, next) => {
  try {
    const { siswa_id, kategori_nilai_id, nilai } = req.body;

    // Periksa apakah nilai untuk kategori ini sudah ada
    const { data: existingNilai, error: checkError } = await supabase
      .from('nilai')
      .select('id')
      .eq('siswa_id', siswa_id)
      .eq('kategori_nilai_id', kategori_nilai_id)
      .maybeSingle();

    if (checkError) throw checkError;

    let result;
    if (existingNilai) {
      // Update nilai jika sudah ada
      const { data, error } = await supabase
        .from('nilai')
        .update({ nilai: parseInt(nilai) })
        .eq('id', existingNilai.id)
        .select('*, siswa(*, users(nama)), kategori_nilai(*)')
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Tambah nilai baru
      const { data, error } = await supabase
        .from('nilai')
        .insert([{
          siswa_id: parseInt(siswa_id),
          kategori_nilai_id: parseInt(kategori_nilai_id),
          nilai: parseInt(nilai)
        }])
        .select('*, siswa(*, users(nama)), kategori_nilai(*)')
        .single();

      if (error) throw error;
      result = data;
    }

    return sendSuccess(res, 'Nilai berhasil disimpan.', result, existingNilai ? 200 : 201);
  } catch (error) {
    next(error);
  }
};

// Update data nilai berdasarkan ID
const updateNilai = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nilai } = req.body;

    const { data: updatedNilai, error } = await supabase
      .from('nilai')
      .update({ nilai: parseInt(nilai) })
      .eq('id', id)
      .select('*, siswa(*, users(nama)), kategori_nilai(*)')
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Nilai berhasil diperbarui.', updatedNilai);
  } catch (error) {
    next(error);
  }
};

// Hapus data nilai
const deleteNilai = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('nilai')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return sendSuccess(res, 'Nilai berhasil dihapus.', {});
  } catch (error) {
    next(error);
  }
};

// Hitung rapor siswa secara dinamis
const getRaporSiswa = async (req, res, next) => {
  try {
    const { siswaId } = req.params;

    // Pastikan siswa terdaftar
    const { data: siswa, error: siswaErr } = await supabase
      .from('siswa')
      .select('id, user_id, nis, users(nama)')
      .eq('id', siswaId)
      .maybeSingle();

    if (siswaErr || !siswa) {
      return sendError(res, 'Siswa tidak ditemukan.', 404);
    }

    // Hitung kehadiran secara dinamis
    const { count: totalAgenda, error: agendaErr } = await supabase
      .from('agenda_absensi')
      .select('*', { count: 'exact', head: true });

    if (agendaErr) throw agendaErr;

    // Hitung total absen hadir
    const { count: totalHadir, error: hadirErr } = await supabase
      .from('absensi')
      .select('*', { count: 'exact', head: true })
      .eq('siswa_id', siswaId);

    if (hadirErr) throw hadirErr;

    const scoreKehadiran = totalAgenda && totalAgenda > 0
      ? Math.round((totalHadir / totalAgenda) * 100)
      : 0;

    // Ambil kriteria nilai lainnya
    const { data: gradesList, error: gradesErr } = await supabase
      .from('nilai')
      .select('*, kategori_nilai(nama_kategori)')
      .eq('siswa_id', siswaId);

    if (gradesErr) throw gradesErr;

    const rapor = {
      kehadiran: scoreKehadiran,
      keaktifan: 0,
      kedisiplinan: 0,
      kerjasama: 0,
      tanggung_jawab: 0
    };

    // Petakan nilai ke kriteria rapor
    if (gradesList) {
      gradesList.forEach(g => {
        if (g.kategori_nilai && g.kategori_nilai.nama_kategori) {
          const categoryKey = g.kategori_nilai.nama_kategori
            .toLowerCase()
            .replace(' ', '_');
          
          if (rapor.hasOwnProperty(categoryKey)) {
            rapor[categoryKey] = g.nilai;
          }
        }
      });
    }

    // Hitung rata-rata rapor
    const sum =
      rapor.kehadiran +
      rapor.keaktifan +
      rapor.kedisiplinan +
      rapor.kerjasama +
      rapor.tanggung_jawab;

    rapor.rata_rata = Math.round(sum / 5);

    return sendSuccess(res, 'Rapor siswa berhasil dihitung.', rapor);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNilai,
  getNilaiBySiswa,
  createNilai,
  updateNilai,
  deleteNilai,
  getRaporSiswa
};
