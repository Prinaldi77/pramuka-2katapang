const supabase = require('../config/supabase');

const findAll = async () => {
  const { data, error } = await supabase
    .from('prestasi')
    .select('*')
    .order('tanggal', { ascending: false });

  if (error) throw error;
  return data;
};

const findById = async (id) => {
  const { data, error } = await supabase
    .from('prestasi')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const create = async (prestasiData) => {
  const { data, error } = await supabase
    .from('prestasi')
    .insert([prestasiData])
    .select('*')
    .single();

  if (error) throw error;
  return data;
};

const update = async (id, updates) => {
  const { data, error } = await supabase
    .from('prestasi')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
};

const destroy = async (id) => {
  const { error } = await supabase
    .from('prestasi')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  destroy
};
