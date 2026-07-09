const supabase = require('../config/supabase');

const create = async (pesanData) => {
  const { data, error } = await supabase
    .from('pesan')
    .insert([pesanData])
    .select('*')
    .single();

  if (error) throw error;
  return data;
};

const findAll = async () => {
  const { data, error } = await supabase
    .from('pesan')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

const findById = async (id) => {
  const { data, error } = await supabase
    .from('pesan')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const update = async (id, updates) => {
  const { data, error } = await supabase
    .from('pesan')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
};

const destroy = async (id) => {
  const { error } = await supabase
    .from('pesan')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

module.exports = {
  create,
  findAll,
  findById,
  update,
  destroy
};
