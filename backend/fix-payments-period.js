const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixPaymentsPeriodType() {
  console.log('🔧 Fixing payments.period column type...');
  
  try {
    // Execute raw SQL to alter column type
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      sql: 'ALTER TABLE payments ALTER COLUMN period TYPE TEXT;'
    });

    if (error) {
      console.log('⚠️  RPC not available. Please run this SQL manually in Supabase Dashboard:');
      console.log('');
      console.log('ALTER TABLE payments ALTER COLUMN period TYPE TEXT;');
      console.log('');
      console.log('Go to: Supabase Dashboard > SQL Editor > New Query');
      return;
    }

    console.log('✅ Successfully changed payments.period to TEXT type');
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.log('');
    console.log('Please run this SQL manually in Supabase Dashboard:');
    console.log('ALTER TABLE payments ALTER COLUMN period TYPE TEXT;');
  }
}

fixPaymentsPeriodType();
