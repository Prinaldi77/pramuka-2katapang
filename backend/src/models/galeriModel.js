const supabase = require('../config/supabase');

const findAll = async () => {
  const { data, error } = await supabase
    .from('galeri')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

const findById = async (id) => {
  const { data, error } = await supabase
    .from('galeri')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const create = async (galeriData) => {
  const { data, error } = await supabase
    .from('galeri')
    .insert([galeriData])
    .select('*')
    .single();

  if (error) throw error;
  return data;
};

const destroy = async (id) => {
  const { error } = await supabase
    .from('galeri')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

module.exports = {
  findAll,
  findById,
  create,
  destroy
};
