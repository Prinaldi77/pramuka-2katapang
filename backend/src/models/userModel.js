const supabase = require('../config/supabase');

const findAll = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('id, nama, email, role, foto_profil, created_at')
    .order('id', { ascending: true });

  if (error) throw error;
  return data;
};

const findById = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, nama, email, role, foto_profil, created_at')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const findByEmail = async (email) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const create = async (userData) => {
  const { nama, email, password, role } = userData;
  const { data, error } = await supabase
    .from('users')
    .insert([{ nama, email, password, role }])
    .select('id, nama, email, role, foto_profil, created_at')
    .single();

  if (error) throw error;
  return data;
};

const update = async (id, updates) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select('id, nama, email, role, foto_profil, created_at')
    .single();

  if (error) throw error;
  return data;
};

const destroy = async (id) => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

module.exports = {
  findAll,
  findById,
  findByEmail,
  create,
  update,
  destroy
};
