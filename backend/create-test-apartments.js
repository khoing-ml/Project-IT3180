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

async function createTestApartments() {
  console.log('🏢 Tạo 15 căn hộ trống để kiểm tra...\n');

  // Định nghĩa 15 căn hộ test với nhiều tầng khác nhau
  const apartments = [
    { apt_id: 'A201', floor: 2, area: 75 },
    { apt_id: 'A202', floor: 2, area: 80 },
    { apt_id: 'A203', floor: 2, area: 85 },
    { apt_id: 'A301', floor: 3, area: 75 },
    { apt_id: 'A302', floor: 3, area: 80 },
    { apt_id: 'A303', floor: 3, area: 90 },
    { apt_id: 'B201', floor: 2, area: 70 },
    { apt_id: 'B202', floor: 2, area: 75 },
    { apt_id: 'B203', floor: 2, area: 85 },
    { apt_id: 'B301', floor: 3, area: 70 },
    { apt_id: 'B302', floor: 3, area: 80 },
    { apt_id: 'B303', floor: 3, area: 90 },
    { apt_id: 'C201', floor: 2, area: 65 },
    { apt_id: 'C202', floor: 2, area: 72 },
    { apt_id: 'C203', floor: 2, area: 88 }
  ];

  let created = 0;
  let skipped = 0;

  for (const apt of apartments) {
    // Kiểm tra xem căn hộ đã tồn tại chưa
    const { data: existing } = await supabaseAdmin
      .from('apartments')
      .select('apt_id')
      .eq('apt_id', apt.apt_id)
      .single();

    if (existing) {
      console.log(`⏭️  ${apt.apt_id} - Đã tồn tại, bỏ qua`);
      skipped++;
      continue;
    }

    // Tạo căn hộ mới với trạng thái vacant
    const apartmentData = {
      apt_id: apt.apt_id,
      floor: apt.floor,
      area: apt.area,
      status: 'vacant',
      resident_count: 0,
      owner_name: '',  // Chưa có chủ hộ
      owner_phone: '',
      owner_email: '',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('apartments')
      .insert([apartmentData])
      .select()
      .single();

    if (error) {
      console.error(`❌ ${apt.apt_id} - Lỗi: ${error.message}`);
    } else {
      console.log(`✅ ${apt.apt_id} - Tạo thành công (Tầng ${apt.floor}, ${apt.area}m²)`);
      created++;
    }
  }

  console.log('\n📊 Tổng kết:');
  console.log(`   ✅ Đã tạo: ${created} căn hộ`);
  console.log(`   ⏭️  Đã tồn tại: ${skipped} căn hộ`);
  console.log(`   📦 Tổng cộng: ${apartments.length} căn hộ`);
  
  console.log('\n🎉 Hoàn thành! Bạn có thể kiểm tra danh sách căn hộ trên giao diện.');
}

createTestApartments()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  });
