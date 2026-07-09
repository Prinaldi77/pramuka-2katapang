const supabase = require('../config/supabase');

const findAll = async () => {
  const { data, error } = await supabase
    .from('pembina')
    .select('*, users(nama, email, role)')
    .order('id', { ascending: true });

  if (error) throw error;
  return data;
};

const findById = async (id) => {
  const { data, error } = await supabase
    .from('pembina')
    .select('*, users(nama, email, role)')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const findByUserId = async (userId) => {
  const { data, error } = await supabase
    .from('pembina')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const create = async (pembinaData) => {
  const { data, error } = await supabase
    .from('pembina')
    .insert([pembinaData])
    .select('*, users(nama, email, role)')
    .single();

  if (error) throw error;
  return data;
};

const update = async (id, updates) => {
  const { data, error } = await supabase
    .from('pembina')
    .update(updates)
    .eq('id', id)
    .select('*, users(nama, email, role)')
    .single();

  if (error) throw error;
  return data;
};

const destroy = async (id) => {
  const { error } = await supabase
    .from('pembina')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

const count = async () => {
  const { count, error } = await supabase
    .from('pembina')
    .select('*', { count: 'exact', head: true });

  if (error) throw error;
  return count || 0;
};

module.exports = {
  findAll,
  findById,
  findByUserId,
  create,
  update,
  destroy,
  count
};
