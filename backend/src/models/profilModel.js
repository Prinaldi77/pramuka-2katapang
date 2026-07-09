const supabase = require('../config/supabase');

const findFirst = async () => {
  const { data, error } = await supabase
    .from('profil')
    .select('*')
    .order('id', { ascending: true });

  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
};

const create = async (profilData) => {
  const { data, error } = await supabase
    .from('profil')
    .insert([profilData])
    .select('*')
    .single();

  if (error) throw error;
  return data;
};

const update = async (id, updates) => {
  const { data, error } = await supabase
    .from('profil')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
};

module.exports = {
  findFirst,
  create,
  update
};
