const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.ANDROID_SUPABASE_URL;
const supabaseKey = process.env.ANDROID_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('WARNING: ANDROID_SUPABASE_URL or ANDROID_SUPABASE_KEY is missing. Android API integration will not work.');
}

const supabaseAndroid = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');

module.exports = supabaseAndroid;
