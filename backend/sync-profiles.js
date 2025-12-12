const { supabaseAdmin } = require('./src/config/supabase');

async function syncProfiles() {
  console.log('🔄 Syncing auth users with profiles...\n');
  
  try {
    // Get all auth users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError.message);
      return;
    }

    console.log(`Found ${authData.users.length} auth users\n`);

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id');

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError.message);
      return;
    }

    const profileIds = new Set(profiles?.map(p => p.id) || []);
    let created = 0;

    for (const user of authData.users) {
      if (!profileIds.has(user.id)) {
        console.log(`📝 Creating profile for ${user.email}...`);
        
        const username = user.user_metadata?.username || 
                        user.email?.split('@')[0] || 
                        `user_${user.id.substring(0, 8)}`;
        
        const full_name = user.user_metadata?.full_name || 
                         user.email?.split('@')[0] || 
                         'User';
        
        const role = user.user_metadata?.role || 'user';

        const { error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: user.id,
            username,
            full_name,
            email: user.email,
            role,
            apartment_number: user.user_metadata?.apartment_number || null
          });

        if (insertError) {
          console.error(`Failed to create profile for ${user.email}:`, insertError.message);
        } else {
          console.log(`Profile created for ${user.email} (role: ${role})`);
          created++;
        }
      }
    }

    console.log(`Sync complete! Created ${created} new profile(s).`);
    
    // Show final count
    const { count } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    console.log(`Total profiles in database: ${count}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

syncProfiles().then(() => process.exit(0));
