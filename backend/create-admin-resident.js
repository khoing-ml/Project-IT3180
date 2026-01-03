const { supabaseAdmin } = require('./src/config/supabase');

async function createAdminResident() {
  console.log('🚀 Creating resident profile for admin user...\n');

  try {
    // 1. Get admin user
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('username', 'admin')
      .single();

    if (adminError || !admin) {
      console.error('❌ Admin user not found');
      return;
    }

    console.log('✅ Found admin user:', admin.username);

    // 2. Check if admin already has a resident profile
    const { data: existingResident } = await supabaseAdmin
      .from('residents')
      .select('*')
      .eq('user_id', admin.id)
      .single();

    if (existingResident) {
      console.log('ℹ️  Admin already has a resident profile');
      console.log('   Resident ID:', existingResident.id);
      console.log('   Apartment:', existingResident.apt_id);
      console.log('   Full name:', existingResident.full_name);
      return;
    }

    // 3. Check if apartment A101 exists, if not create it
    const { data: apartment, error: aptError } = await supabaseAdmin
      .from('apartments')
      .select('*')
      .eq('apt_id', 'A101')
      .single();

    if (!apartment) {
      console.log('📦 Creating apartment A101...');
      const { error: createAptError } = await supabaseAdmin
        .from('apartments')
        .insert([{
          apt_id: 'A101',
          floor: 1,
          area: 80,
          bedrooms: 2,
          bathrooms: 2,
          status: 'occupied',
          resident_count: 0,
          created_at: new Date().toISOString()
        }]);

      if (createAptError) {
        console.error('❌ Failed to create apartment:', createAptError.message);
        return;
      }
      console.log('✅ Apartment A101 created');
    }

    // 4. Create resident profile for admin
    console.log('👤 Creating resident profile...');
    
    // Use only minimal required columns
    const residentData = {
      apt_id: 'A101',
      full_name: admin.full_name || 'Administrator',
      is_owner: true
    };

    const { data: resident, error: residentError } = await supabaseAdmin
      .from('residents')
      .insert([residentData])
      .select()
      .single();

    if (residentError) {
      console.error('❌ Failed to create resident:', residentError.message);
      return;
    }

    console.log('✅ Resident profile created successfully!');
    console.log('\n📋 Resident Details:');
    console.log('   ID:', resident.id);
    console.log('   Full name:', resident.full_name);
    console.log('   Apartment:', resident.apt_id);

    // 5. Update resident with full household registration info
    console.log('\n🔄 Updating resident with household registration info...');
    const fullResidentData = {
      user_id: admin.id,
      phone: '0123456789',
      email: admin.email,
      cccd: '001234567890',
      date_of_birth: '1990-01-01',
      gender: 'Nam',
      hometown: 'Hà Nội',
      place_of_birth: 'Hà Nội',
      ethnicity: 'Kinh',
      religion: 'Không',
      nationality: 'Việt Nam',
      relationship_to_owner: 'Chủ hộ',
      occupation: 'Quản trị viên hệ thống',
      workplace: 'BlueMoon Apartment',
      registration_date: new Date().toISOString().split('T')[0],
      notes: 'Admin test account'
    };

    const { error: updateError } = await supabaseAdmin
      .from('residents')
      .update(fullResidentData)
      .eq('id', resident.id);

    if (updateError) {
      console.log('⚠️  Warning: Could not add optional fields:', updateError.message);
      console.log('   Continuing with basic info only...');
    } else {
      console.log('✅ Additional info updated');
    }

    // 6. Update apartment with owner info
    await supabaseAdmin
      .from('apartments')
      .update({
        owner_id: resident.id,
        owner_name: resident.full_name,
        owner_email: resident.email,
        resident_count: 1,
        status: 'occupied'
      })
      .eq('apt_id', 'A101');

    console.log('✅ Apartment updated with owner info');

    // 7. Update user profile with apartment number
    await supabaseAdmin
      .from('profiles')
      .update({
        apartment_number: 'A101'
      })
      .eq('id', admin.id);

    console.log('✅ User profile updated');
    console.log('\n🎉 Setup completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  }

  process.exit(0);
}

createAdminResident();
