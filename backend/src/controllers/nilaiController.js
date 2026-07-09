const NilaiModel = require('../models/nilaiModel');
const AgendaModel = require('../models/agendaModel');
const AbsensiModel = require('../models/absensiModel');
const SiswaModel = require('../models/siswaModel');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// Ambil semua data nilai siswa
const getNilai = async (req, res, next) => {
  try {
    // Ambil data nilai mentah
    const rawGrades = await NilaiModel.findAllRaw();

    // Ambil jumlah seluruh agenda kegiatan
    const totalAgenda = await AgendaModel.count();

    // Ambil data riwayat absensi
    const absensiLogs = await AbsensiModel.findAll();

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
    const nilaiList = await NilaiModel.findBySiswaId(siswaId);

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
    const existingNilai = await NilaiModel.findSpecific(siswa_id, kategori_nilai_id);

    let result;
    if (existingNilai) {
      // Update nilai jika sudah ada
      result = await NilaiModel.update(existingNilai.id, { nilai: parseInt(nilai) });
    } else {
      // Tambah nilai baru
      result = await NilaiModel.create({
        siswa_id: parseInt(siswa_id),
        kategori_nilai_id: parseInt(kategori_nilai_id),
        nilai: parseInt(nilai)
      });
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

    const updatedNilai = await NilaiModel.update(id, { nilai: parseInt(nilai) });

    return sendSuccess(res, 'Nilai berhasil diperbarui.', updatedNilai);
  } catch (error) {
    next(error);
  }
};

// Hapus data nilai
const deleteNilai = async (req, res, next) => {
  try {
    const { id } = req.params;
    await NilaiModel.destroy(id);

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
    const siswa = await SiswaModel.findById(siswaId);

    if (!siswa) {
      return sendError(res, 'Siswa tidak ditemukan.', 404);
    }

    // Hitung kehadiran secara dinamis
    const totalAgenda = await AgendaModel.count();

    // Hitung total absen hadir
    const totalHadir = await NilaiModel.countSiswaAttendance(siswaId);

    const scoreKehadiran = totalAgenda && totalAgenda > 0
      ? Math.round((totalHadir / totalAgenda) * 100)
      : 0;

    // Ambil kriteria nilai lainnya
    const gradesList = await NilaiModel.findWithCategoryName(siswaId);

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
