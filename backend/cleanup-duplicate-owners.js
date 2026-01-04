require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function cleanupDuplicateOwners() {
  console.log('🧹 Dọn dẹp các chủ hộ trùng lặp...\n');

  // Lấy tất cả căn hộ
  const { data: apartments, error: aptError } = await supabaseAdmin
    .from('apartments')
    .select('apt_id')
    .order('apt_id');

  if (aptError) {
    console.error('❌ Lỗi khi lấy danh sách căn hộ:', aptError.message);
    return;
  }

  console.log(`📋 Kiểm tra ${apartments.length} căn hộ...\n`);

  let fixed = 0;
  let noIssue = 0;

  for (const apartment of apartments) {
    const apt_id = apartment.apt_id;

    // Lấy tất cả cư dân là chủ hộ trong căn hộ này
    const { data: owners, error: ownersError } = await supabaseAdmin
      .from('residents')
      .select('id, full_name, created_at')
      .eq('apt_id', apt_id)
      .eq('is_owner', true)
      .order('created_at', { ascending: true });

    if (ownersError) {
      console.error(`❌ ${apt_id} - Lỗi: ${ownersError.message}`);
      continue;
    }

    if (!owners || owners.length === 0) {
      console.log(`⚠️  ${apt_id} - Không có chủ hộ`);
      noIssue++;
      continue;
    }

    if (owners.length === 1) {
      console.log(`✅ ${apt_id} - OK (1 chủ hộ)`);
      noIssue++;
      continue;
    }

    // Có nhiều hơn 1 chủ hộ -> giữ lại người đầu tiên, chuyển các người khác thành thành viên
    console.log(`🔧 ${apt_id} - Tìm thấy ${owners.length} chủ hộ, đang sửa...`);
    
    const keepOwner = owners[0]; // Giữ người tạo đầu tiên
    const removeOwners = owners.slice(1);

    // Chuyển các chủ hộ khác thành thành viên
    for (const owner of removeOwners) {
      const { error: updateError } = await supabaseAdmin
        .from('residents')
        .update({ is_owner: false })
        .eq('id', owner.id);

      if (updateError) {
        console.error(`   ❌ Lỗi khi cập nhật ${owner.full_name}: ${updateError.message}`);
      } else {
        console.log(`   ✅ Chuyển ${owner.full_name} thành thành viên`);
      }
    }

    // Cập nhật thông tin chủ hộ vào bảng apartments
    const { error: aptUpdateError } = await supabaseAdmin
      .from('apartments')
      .update({
        owner_name: keepOwner.full_name,
        owner_id: keepOwner.id
      })
      .eq('apt_id', apt_id);

    if (aptUpdateError) {
      console.error(`   ❌ Lỗi cập nhật apartment: ${aptUpdateError.message}`);
    } else {
      console.log(`   ✅ Giữ ${keepOwner.full_name} làm chủ hộ`);
    }

    fixed++;
  }

  console.log('\n📊 Tổng kết:');
  console.log(`   ✅ Căn hộ OK: ${noIssue}`);
  console.log(`   🔧 Căn hộ đã sửa: ${fixed}`);
  console.log(`   📦 Tổng cộng: ${apartments.length} căn hộ`);
  
  console.log('\n🎉 Hoàn thành! Mỗi căn hộ giờ chỉ có 1 chủ hộ.');
}

cleanupDuplicateOwners()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  });
