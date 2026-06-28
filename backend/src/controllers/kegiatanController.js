const supabase = require('../config/supabase');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { uploadFile, deleteFile } = require('../services/storageService');

/**
 * Get all activities list.
 */
const getKegiatan = async (req, res, next) => {
  try {
    const { data: kegiatanList, error: kegError } = await supabase
      .from('kegiatan')
      .select('*')
      .order('tanggal', { ascending: false });

    if (kegError) throw kegError;

    // Fetch agenda_absensi to merge into kegiatan list
    const { data: agendaList, error: agendaError } = await supabase
      .from('agenda_absensi')
      .select('*')
      .order('tanggal', { ascending: false });

    if (agendaError) throw agendaError;

    const formattedAgendas = (agendaList || []).map(agenda => ({
      id: agenda.id,
      nama_kegiatan: agenda.judul,
      deskripsi: `Latihan Absensi GPS. Radius: ${agenda.radius}m. Jam: ${agenda.jam_mulai} - ${agenda.jam_selesai}`,
      tanggal: agenda.tanggal,
      lokasi: 'Pangkalan SMPN 2 Katapang',
      gambar: null,
      kategori: 'Absensi',
      latitude: agenda.latitude,
      longitude: agenda.longitude,
      radius: agenda.radius,
      waktu_mulai: agenda.jam_mulai
    }));

    const combined = [...(kegiatanList || []), ...formattedAgendas];
    combined.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    return sendSuccess(res, 'Data kegiatan berhasil diambil.', combined);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single activity by ID.
 */
const getKegiatanById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: kegiatan, error } = await supabase
      .from('kegiatan')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !kegiatan) {
      return sendError(res, 'Kegiatan tidak ditemukan.', 404);
    }

    return sendSuccess(res, 'Data kegiatan berhasil diambil.', kegiatan);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new activity.
 */
const createKegiatan = async (req, res, next) => {
  try {
    const { nama_kegiatan, deskripsi, tanggal, lokasi } = req.body;
    let gambarUrl = null;

    if (req.file) {
      gambarUrl = await uploadFile(req.file, 'kegiatan');
    }

    const { data: kegiatan, error } = await supabase
      .from('kegiatan')
      .insert([{
        nama_kegiatan,
        deskripsi,
        tanggal,
        lokasi,
        gambar: gambarUrl
      }])
      .select('*')
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Kegiatan berhasil ditambahkan.', kegiatan, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update activity details by ID.
 */
const updateKegiatan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nama_kegiatan, deskripsi, tanggal, lokasi } = req.body;

    const { data: existingKegiatan, error: fetchError } = await supabase
      .from('kegiatan')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !existingKegiatan) {
      return sendError(res, 'Kegiatan tidak ditemukan.', 404);
    }

    const updates = {};
    if (nama_kegiatan !== undefined) updates.nama_kegiatan = nama_kegiatan;
    if (deskripsi !== undefined) updates.deskripsi = deskripsi;
    if (tanggal !== undefined) updates.tanggal = tanggal;
    if (lokasi !== undefined) updates.lokasi = lokasi;

    if (req.file) {
      const gambarUrl = await uploadFile(req.file, 'kegiatan');
      updates.gambar = gambarUrl;

      // Delete the old image
      if (existingKegiatan.gambar) {
        await deleteFile(existingKegiatan.gambar, 'kegiatan');
      }
    }

    const { data: kegiatan, error } = await supabase
      .from('kegiatan')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Kegiatan berhasil diperbarui.', kegiatan);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete activity by ID.
 */
const deleteKegiatan = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: kegiatan, error: fetchError } = await supabase
      .from('kegiatan')
      .select('gambar')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !kegiatan) {
      return sendError(res, 'Kegiatan tidak ditemukan.', 404);
    }

    // Delete image from storage
    if (kegiatan.gambar) {
      await deleteFile(kegiatan.gambar, 'kegiatan');
    }

    const { error } = await supabase
      .from('kegiatan')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return sendSuccess(res, 'Kegiatan berhasil dihapus.', {});
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getKegiatan,
  getKegiatanById,
  createKegiatan,
  updateKegiatan,
  deleteKegiatan
};
