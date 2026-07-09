const supabase = require('../config/supabase');

const findAll = async () => {
  const { data, error } = await supabase
    .from('jadwal_piket')
    .select('*')
    .order('id', { ascending: true });

  if (error) throw error;
  return data;
};

const update = async (id, updates) => {
  const { regu_putra, regu_putri } = updates;
  const { data: updatedPiket, error } = await supabase
    .from('jadwal_piket')
    .update({
      regu_putra,
      regu_putri
    })
    .eq('id', id)
    .select('*')
    .maybeSingle();

  if (error) throw error;
  return updatedPiket;
};

module.exports = {
  findAll,
  update
};
