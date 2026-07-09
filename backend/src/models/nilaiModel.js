const supabase = require('../config/supabase');

const findAllRaw = async () => {
  const { data, error } = await supabase
    .from('nilai')
    .select('id, siswa_id, kategori_nilai_id, nilai')
    .order('id', { ascending: true });

  if (error) throw error;
  return data;
};

const findBySiswaId = async (siswaId) => {
  const { data, error } = await supabase
    .from('nilai')
    .select('*, kategori_nilai(*)')
    .eq('siswa_id', siswaId)
    .order('id', { ascending: true });

  if (error) throw error;
  return data;
};

const findSpecific = async (siswaId, kategoriNilaiId) => {
  const { data, error } = await supabase
    .from('nilai')
    .select('id')
    .eq('siswa_id', siswaId)
    .eq('kategori_nilai_id', kategoriNilaiId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const create = async (nilaiData) => {
  const { data, error } = await supabase
    .from('nilai')
    .insert([nilaiData])
    .select('*, siswa(*, users(nama)), kategori_nilai(*)')
    .single();

  if (error) throw error;
  return data;
};

const update = async (id, updates) => {
  const { data, error } = await supabase
    .from('nilai')
    .update(updates)
    .eq('id', id)
    .select('*, siswa(*, users(nama)), kategori_nilai(*)')
    .single();

  if (error) throw error;
  return data;
};

const destroy = async (id) => {
  const { error } = await supabase
    .from('nilai')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

const findWithCategoryName = async (siswaId) => {
  const { data, error } = await supabase
    .from('nilai')
    .select('*, kategori_nilai(nama_kategori)')
    .eq('siswa_id', siswaId);

  if (error) throw error;
  return data;
};

const countSiswaAttendance = async (siswaId) => {
  const { count, error } = await supabase
    .from('absensi')
    .select('*', { count: 'exact', head: true })
    .eq('siswa_id', siswaId);

  if (error) throw error;
  return count || 0;
};

module.exports = {
  findAllRaw,
  findBySiswaId,
  findSpecific,
  create,
  update,
  destroy,
  findWithCategoryName,
  countSiswaAttendance
};
