const { supabaseAdmin } = require('./src/config/supabase');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function setupAdmin() {
  console.log('🔧 Admin User Setup Tool\n');
  
  rl.question('Enter user email: ', async (email) => {
    try {
      // Find user by email
      const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        console.error('❌ Error listing users:', listError.message);
        rl.close();
        return;
      }

      const user = users.users.find(u => u.email === email);
      
      if (!user) {
        console.error('❌ User not found with email:', email);
        rl.close();
        return;
      }

      console.log('✅ Found user:', user.id);
      
      // Check if profile exists
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('❌ Error checking profile:', profileError.message);
        rl.close();
        return;
      }

      if (!profile) {
        // Create profile with admin role
        console.log('📝 Creating admin profile...');
        const { data: newProfile, error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            username: user.user_metadata?.username || user.email.split('@')[0],
            full_name: user.user_metadata?.full_name || user.email.split('@')[0],
            role: 'admin',
            apartment_number: user.user_metadata?.apartment_number || null
          })
          .select()
          .single();

        if (insertError) {
          console.error('❌ Error creating profile:', insertError.message);
          rl.close();
          return;
        }

        console.log('✅ Admin profile created successfully!');
        console.log('Profile:', newProfile);
      } else {
        // Update existing profile to admin
        console.log('📝 Updating profile to admin role...');
        const { data: updatedProfile, error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', user.id)
          .select()
          .single();

        if (updateError) {
          console.error('❌ Error updating profile:', updateError.message);
          rl.close();
          return;
        }

        console.log('✅ Profile updated to admin successfully!');
        console.log('Profile:', updatedProfile);
      }

      // Also update user metadata
      const { error: metaError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        {
          user_metadata: {
            ...user.user_metadata,
            role: 'admin'
          }
        }
      );

      if (metaError) {
        console.warn('⚠️  Warning: Could not update user metadata:', metaError.message);
      } else {
        console.log('✅ User metadata updated');
      }

      console.log('\n🎉 Setup complete! The user now has admin privileges.');
      rl.close();
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      rl.close();
    }
  });
}

setupAdmin();
