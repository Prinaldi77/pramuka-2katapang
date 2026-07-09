const supabase = require('../config/supabase');

const findAll = async () => {
  const { data, error } = await supabase
    .from('kegiatan')
    .select('*')
    .order('tanggal', { ascending: false });

  if (error) throw error;
  return data;
};

const findById = async (id) => {
  const { data, error } = await supabase
    .from('kegiatan')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const create = async (kegiatanData) => {
  const { data, error } = await supabase
    .from('kegiatan')
    .insert([kegiatanData])
    .select('*')
    .single();

  if (error) throw error;
  return data;
};

const update = async (id, updates) => {
  const { data, error } = await supabase
    .from('kegiatan')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
};

const destroy = async (id) => {
  const { error } = await supabase
    .from('kegiatan')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

const count = async () => {
  const { count, error } = await supabase
    .from('kegiatan')
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
