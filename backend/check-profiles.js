const { supabaseAdmin } = require('./src/config/supabase');

async function checkProfiles() {
  console.log('🔍 Checking profiles table...\n');
  
  try {
    // Get all profiles
    const { data: profiles, error, count } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' });

    if (error) {
      console.error('❌ Error fetching profiles:', error.message);
      console.error('Details:', JSON.stringify(error, null, 2));
      return;
    }

    console.log(`✅ Found ${count || 0} profiles in the database\n`);

    if (profiles && profiles.length > 0) {
      console.log('📋 Profiles:');
      profiles.forEach((profile, index) => {
        console.log(`\n${index + 1}. ${profile.full_name} (@${profile.username})`);
        console.log(`   Email: ${profile.email}`);
        console.log(`   Role: ${profile.role}`);
        console.log(`   ID: ${profile.id}`);
        console.log(`   Apartment: ${profile.apartment_number || 'N/A'}`);
      });
    } else {
      console.log('⚠️  No profiles found!');
      console.log('\nTo create an admin user:');
      console.log('1. Sign up through the frontend app');
      console.log('2. Run: node setup-admin.js');
      console.log('3. Enter your email address');
    }

    // Also check auth users
    console.log('\n🔍 Checking auth users...\n');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError.message);
      return;
    }

    console.log(`✅ Found ${authData.users.length} auth users\n`);
    
    if (authData.users.length > 0) {
      console.log('👥 Auth users:');
      authData.users.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.email}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Created: ${user.created_at}`);
        console.log(`   Metadata:`, user.user_metadata);
        
        // Check if this user has a profile
        const hasProfile = profiles?.find(p => p.id === user.id);
        console.log(`   Has Profile: ${hasProfile ? '✅ Yes' : '❌ No'}`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkProfiles().then(() => process.exit(0));
