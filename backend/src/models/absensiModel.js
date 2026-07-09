const supabase = require('../config/supabase');

const findAll = async () => {
  const { data, error } = await supabase
    .from('absensi')
    .select('*, siswa(*, users(nama)), agenda_absensi(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

const findById = async (id) => {
  const { data, error } = await supabase
    .from('absensi')
    .select('*, siswa(*, users(nama)), agenda_absensi(*)')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const findBySiswaId = async (siswaId) => {
  const { data, error } = await supabase
    .from('absensi')
    .select('*, agenda_absensi(*)')
    .eq('siswa_id', siswaId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

const findByAgendaId = async (agendaId) => {
  const { data, error } = await supabase
    .from('absensi')
    .select('*, siswa(*, users(nama))')
    .eq('agenda_id', agendaId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

const findSpecificAbsensi = async (siswaId, agendaId) => {
  const { data, error } = await supabase
    .from('absensi')
    .select('id, created_at, status, keterangan')
    .eq('siswa_id', siswaId)
    .eq('agenda_id', agendaId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const findLastBySiswaId = async (siswaId) => {
  const { data, error } = await supabase
    .from('absensi')
    .select('latitude, longitude, created_at')
    .eq('siswa_id', siswaId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const create = async (absensiData, selectFields = '*') => {
  const { data, error } = await supabase
    .from('absensi')
    .insert([absensiData])
    .select(selectFields)
    .single();

  if (error) throw error;
  return data;
};

const update = async (id, updates, selectFields = '*') => {
  const { data, error } = await supabase
    .from('absensi')
    .update(updates)
    .eq('id', id)
    .select(selectFields)
    .single();

  if (error) throw error;
  return data;
};

const findTodayBySiswaId = async (siswaId, todayStr) => {
  const { data, error } = await supabase
    .from('absensi')
    .select('*, agenda_absensi(*)')
    .eq('siswa_id', siswaId)
    .gte('created_at', `${todayStr}T00:00:00.000Z`)
    .lte('created_at', `${todayStr}T23:59:59.999Z`);

  if (error) throw error;
  return data;
};

const findAndroidLogs = async () => {
  const { data, error } = await supabase
    .from('absensi')
    .select(`
      id,
      siswa_id,
      agenda_id,
      latitude,
      longitude,
      jarak,
      foto_absen,
      created_at,
      siswa:siswa_id (
        nis,
        kelas,
        users(nama)
      ),
      agenda_absensi:agenda_id (
        judul,
        tanggal,
        jam_mulai
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

module.exports = {
  findAll,
  findById,
  findBySiswaId,
  findByAgendaId,
  findSpecificAbsensi,
  findLastBySiswaId,
  create,
  update,
  findTodayBySiswaId,
  findAndroidLogs
};
