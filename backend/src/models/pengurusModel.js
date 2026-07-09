const supabase = require('../config/supabase');

const findAll = async () => {
  const { data, error } = await supabase
    .from('pengurus')
    .select('*, siswa(*, users(nama, email))')
    .order('id', { ascending: true });

  if (error) throw error;
  return data;
};

const findById = async (id) => {
  const { data, error } = await supabase
    .from('pengurus')
    .select('*, siswa(*, users(nama, email))')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const create = async (data) => {
  const { siswa_id, jabatan, periode } = data;
  const { data: newPengurus, error } = await supabase
    .from('pengurus')
    .insert([{
      siswa_id,
      jabatan,
      periode
    }])
    .select('*, siswa(*, users(nama, email))')
    .single();

  if (error) throw error;
  return newPengurus;
};

const update = async (id, updates) => {
  const { data: updatedPengurus, error } = await supabase
    .from('pengurus')
    .update(updates)
    .eq('id', id)
    .select('*, siswa(*, users(nama, email))')
    .single();

  if (error) throw error;
  return updatedPengurus;
};

const destroy = async (id) => {
  const { error } = await supabase
    .from('pengurus')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

const count = async () => {
  const { count, error } = await supabase
    .from('pengurus')
    .select('*', { count: 'exact', head: true });

  if (error) throw error;
  return count || 0;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  destroy,
  count
};
