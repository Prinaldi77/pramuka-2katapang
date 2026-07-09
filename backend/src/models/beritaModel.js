const supabase = require('../config/supabase');

const findAll = async () => {
  const { data, error } = await supabase
    .from('berita')
    .select('*, users(nama, email)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

const findById = async (id) => {
  const { data, error } = await supabase
    .from('berita')
    .select('*, users(nama, email)')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const create = async (beritaData) => {
  const { data, error } = await supabase
    .from('berita')
    .insert([beritaData])
    .select('*, users(nama, email)')
    .single();

  if (error) throw error;
  return data;
};

const update = async (id, updates) => {
  const { data, error } = await supabase
    .from('berita')
    .update(updates)
    .eq('id', id)
    .select('*, users(nama, email)')
    .single();

  if (error) throw error;
  return data;
};

const destroy = async (id) => {
  const { error } = await supabase
    .from('berita')
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
