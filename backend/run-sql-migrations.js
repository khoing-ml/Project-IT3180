const { supabaseAdmin } = require('./src/config/supabase');

async function runSQL() {
  console.log('🚀 Running SQL migrations...\n');

  // 1. Add CCCD column
  console.log('📦 Adding CCCD column to residents table...');
  const { error: cccdError } = await supabaseAdmin.rpc('exec_sql', {
    sql_query: `
      ALTER TABLE public.residents
      ADD COLUMN IF NOT EXISTS cccd TEXT;
      
      CREATE INDEX IF NOT EXISTS idx_residents_cccd ON public.residents(cccd);
    `
  });

  if (cccdError && !cccdError.message.includes('already exists')) {
    console.error('Note:', cccdError.message);
  } else {
    console.log('✅ CCCD column added');
  }

  // 2. Create population_movements table
  console.log('\n📦 Creating population_movements table...');
  const { error: tableError } = await supabaseAdmin.rpc('exec_sql', {
    sql_query: `
      CREATE TABLE IF NOT EXISTS public.population_movements (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        resident_id UUID NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
        apt_id TEXT NOT NULL,
        movement_type TEXT NOT NULL,
        reason TEXT,
        start_date DATE NOT NULL,
        end_date DATE,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        requested_by UUID,
        approved_by UUID,
        approved_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_population_movements_resident_id ON public.population_movements(resident_id);
      CREATE INDEX IF NOT EXISTS idx_population_movements_apt_id ON public.population_movements(apt_id);
      CREATE INDEX IF NOT EXISTS idx_population_movements_status ON public.population_movements(status);
      CREATE INDEX IF NOT EXISTS idx_population_movements_movement_type ON public.population_movements(movement_type);
      CREATE INDEX IF NOT EXISTS idx_population_movements_created_at ON public.population_movements(created_at DESC);
    `
  });

  if (tableError && !tableError.message.includes('already exists')) {
    console.error('Note:', tableError.message);
  } else {
    console.log('✅ population_movements table created');
  }

  console.log('\n✨ Migrations completed!');
  process.exit(0);
}

runSQL().catch(error => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
