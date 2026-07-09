const supabase = require('../config/supabase');

const findAll = async () => {
  const { data, error } = await supabase
    .from('agenda_absensi')
    .select('*')
    .order('tanggal', { ascending: false })
    .order('jam_mulai', { ascending: false });

  if (error) throw error;
  return data;
};

const findById = async (id) => {
  const { data, error } = await supabase
    .from('agenda_absensi')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const create = async (agendaData) => {
  const { data, error } = await supabase
    .from('agenda_absensi')
    .insert([agendaData])
    .select('*')
    .single();

  if (error) throw error;
  return data;
};

const update = async (id, updates) => {
  const { data, error } = await supabase
    .from('agenda_absensi')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
};

const destroy = async (id) => {
  const { error } = await supabase
    .from('agenda_absensi')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

const findFirstActive = async () => {
  const { data, error } = await supabase
    .from('agenda_absensi')
    .select('*')
    .eq('status', 'aktif')
    .order('tanggal', { ascending: false })
    .order('jam_mulai', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const count = async () => {
  const { count, error } = await supabase
    .from('agenda_absensi')
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
  findFirstActive,
  count
};
