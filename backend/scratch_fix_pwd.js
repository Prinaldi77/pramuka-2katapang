require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function fixPassword() {
  const hash = await bcrypt.hash('123456', 10);
  const { data, error } = await supabase
    .from('users')
    .update({ password: hash })
    .eq('email', 'admin@gmail.com');

  if (error) {
    console.error('Error updating:', error);
  } else {
    console.log('Password updated successfully to 123456!');
  }
}

fixPassword();
