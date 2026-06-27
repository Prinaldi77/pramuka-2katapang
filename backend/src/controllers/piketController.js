const supabase = require('../config/supabase');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * Get all duty schedules (Senin - Jumat)
 */
const getPiket = async (req, res, next) => {
  try {
    const { data: piketList, error } = await supabase
      .from('jadwal_piket')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    return sendSuccess(res, 'Data jadwal piket berhasil diambil.', piketList);
  } catch (error) {
    next(error);
  }
};

/**
 * Update duty schedule by ID
 */
const updatePiket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { regu_putra, regu_putri } = req.body;

    const { data: updatedPiket, error } = await supabase
      .from('jadwal_piket')
      .update({
        regu_putra,
        regu_putri
      })
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    if (!updatedPiket) {
      return sendError(res, 'Jadwal piket tidak ditemukan.', 404);
    }

    return sendSuccess(res, 'Jadwal piket berhasil diperbarui.', updatedPiket);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPiket,
  updatePiket
};
