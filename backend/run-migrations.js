const { supabaseAdmin } = require('./src/config/supabase');
const fs = require('fs');
const path = require('path');

async function runMigration(fileName) {
  console.log(`\n📦 Running migration: ${fileName}`);
  
  try {
    const sqlPath = path.join(__dirname, 'database', fileName);
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Remove comments and split into individual statements
    const statements = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n')
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of statements) {
      const { error } = await supabaseAdmin.rpc('exec_sql', { sql_query: statement });
      if (error && !error.message.includes('already exists')) {
        console.error('❌ Error:', error.message);
      }
    }
    
    console.log(`✅ Migration completed: ${fileName}`);
  } catch (error) {
    console.error(`❌ Failed to run migration ${fileName}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting database migrations...\n');
  
  // Run migrations in order
  await runMigration('add_cccd_column.sql');
  await runMigration('create_population_movements_table.sql');
  
  console.log('\n✨ All migrations completed!');
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
