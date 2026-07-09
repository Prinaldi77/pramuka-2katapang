const PiketModel = require('../models/piketModel');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// Ambil semua jadwal piket
const getPiket = async (req, res, next) => {
  try {
    const piketList = await PiketModel.findAll();
    return sendSuccess(res, 'Data jadwal piket berhasil diambil.', piketList);
  } catch (error) {
    next(error);
  }
};

// Update jadwal piket berdasarkan ID
const updatePiket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { regu_putra, regu_putri } = req.body;

    const updatedPiket = await PiketModel.update(id, { regu_putra, regu_putri });

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
