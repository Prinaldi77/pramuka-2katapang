const supabase = require('../config/supabase');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * Get all student grades records.
 */
const getNilai = async (req, res, next) => {
  try {
    const { data: nilaiList, error } = await supabase
      .from('nilai')
      .select('*, siswa(*, users(nama)), kategori_nilai(*)')
      .order('id', { ascending: true });

    if (error) throw error;

    return sendSuccess(res, 'Data nilai berhasil diambil.', nilaiList);
  } catch (error) {
    next(error);
  }
};

/**
 * Get grades list for a specific student.
 */
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

/**
 * Insert or update a student grade.
 */
const createNilai = async (req, res, next) => {
  try {
    const { siswa_id, kategori_nilai_id, nilai } = req.body;

    // Check if grade for this category and student already exists
    const { data: existingNilai, error: checkError } = await supabase
      .from('nilai')
      .select('id')
      .eq('siswa_id', siswa_id)
      .eq('kategori_nilai_id', kategori_nilai_id)
      .maybeSingle();

    if (checkError) throw checkError;

    let result;
    if (existingNilai) {
      // Update existing record
      const { data, error } = await supabase
        .from('nilai')
        .update({ nilai: parseInt(nilai) })
        .eq('id', existingNilai.id)
        .select('*, siswa(*, users(nama)), kategori_nilai(*)')
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Insert new record
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

/**
 * Update single grade record by ID.
 */
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

/**
 * Delete a grade record.
 */
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

/**
 * Calculate dynamic student report card (Rapor).
 */
const getRaporSiswa = async (req, res, next) => {
  try {
    const { siswaId } = req.params;

    // Verify student exists
    const { data: siswa, error: siswaErr } = await supabase
      .from('siswa')
      .select('id, user_id, nis, users(nama)')
      .eq('id', siswaId)
      .maybeSingle();

    if (siswaErr || !siswa) {
      return sendError(res, 'Siswa tidak ditemukan.', 404);
    }

    // 1. Calculate Kehadiran dynamically
    // Count total agenda events
    const { count: totalAgenda, error: agendaErr } = await supabase
      .from('agenda_absensi')
      .select('*', { count: 'exact', head: true });

    if (agendaErr) throw agendaErr;

    // Count student check-in records
    const { count: totalHadir, error: hadirErr } = await supabase
      .from('absensi')
      .select('*', { count: 'exact', head: true })
      .eq('siswa_id', siswaId);

    if (hadirErr) throw hadirErr;

    const scoreKehadiran = totalAgenda && totalAgenda > 0
      ? Math.round((totalHadir / totalAgenda) * 100)
      : 0;

    // 2. Fetch other grade criteria (Keaktifan, Kedisiplinan, Kerjasama, Tanggung Jawab)
    const { data: gradesList, error: gradesErr } = await supabase
      .from('nilai')
      .select('*, kategori_nilai(nama_kategori)')
      .eq('siswa_id', siswaId);

    if (gradesErr) throw gradesErr;

    // Initialize default rapor criteria values
    const rapor = {
      kehadiran: scoreKehadiran,
      keaktifan: 0,
      kedisiplinan: 0,
      kerjasama: 0,
      tanggung_jawab: 0
    };

    // Map database grades to criteria keys
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

    // 3. Compute overall average (rata_rata)
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
