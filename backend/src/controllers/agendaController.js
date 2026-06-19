const supabase = require('../config/supabase');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * Get all attendance agendas.
 */
const getAgenda = async (req, res, next) => {
  try {
    const { data: agendaList, error } = await supabase
      .from('agenda_absensi')
      .select('*')
      .order('tanggal', { ascending: false })
      .order('jam_mulai', { ascending: false });

    if (error) throw error;

    return sendSuccess(res, 'Data agenda absensi berhasil diambil.', agendaList);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single agenda by ID.
 */
const getAgendaById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: agenda, error } = await supabase
      .from('agenda_absensi')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !agenda) {
      return sendError(res, 'Agenda tidak ditemukan.', 404);
    }

    return sendSuccess(res, 'Data agenda absensi berhasil diambil.', agenda);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new GPS attendance agenda.
 */
const createAgenda = async (req, res, next) => {
  try {
    const {
      judul,
      tanggal,
      jam_mulai,
      jam_selesai,
      latitude,
      longitude,
      radius,
      status
    } = req.body;

    const { data: agenda, error } = await supabase
      .from('agenda_absensi')
      .insert([{
        judul,
        tanggal,
        jam_mulai,
        jam_selesai,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radius: parseFloat(radius),
        status: status || 'aktif'
      }])
      .select('*')
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Agenda berhasil ditambahkan.', agenda, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update GPS attendance agenda details by ID.
 */
const updateAgenda = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      judul,
      tanggal,
      jam_mulai,
      jam_selesai,
      latitude,
      longitude,
      radius,
      status
    } = req.body;

    const updates = {};
    if (judul !== undefined) updates.judul = judul;
    if (tanggal !== undefined) updates.tanggal = tanggal;
    if (jam_mulai !== undefined) updates.jam_mulai = jam_mulai;
    if (jam_selesai !== undefined) updates.jam_selesai = jam_selesai;
    if (latitude !== undefined) updates.latitude = parseFloat(latitude);
    if (longitude !== undefined) updates.longitude = parseFloat(longitude);
    if (radius !== undefined) updates.radius = parseFloat(radius);
    if (status !== undefined) updates.status = status;

    const { data: agenda, error } = await supabase
      .from('agenda_absensi')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Agenda berhasil diperbarui.', agenda);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete attendance agenda by ID.
 */
const deleteAgenda = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('agenda_absensi')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return sendSuccess(res, 'Agenda berhasil dihapus.', {});
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAgenda,
  getAgendaById,
  createAgenda,
  updateAgenda,
  deleteAgenda
};
