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

// Danh sách tên mẫu
const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Phan', 'Vũ', 'Đặng', 'Bùi', 'Đỗ'];
const middleNames = ['Văn', 'Thị', 'Minh', 'Hoàng', 'Thu', 'Anh', 'Đức', 'Hải', 'Mai', 'Kim'];
const lastNames = ['An', 'Bình', 'Cường', 'Dũng', 'Hà', 'Hương', 'Linh', 'Long', 'Nam', 'Phương', 'Quân', 'Tâm', 'Tùng', 'Vy', 'Yến'];

const genders = ['male', 'female'];
const hometowns = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Nam Định', 'Nghệ An', 'Thanh Hóa', 'Quảng Ninh', 'Thái Bình'];

function generateRandomName() {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const middleName = middleNames[Math.floor(Math.random() * middleNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${middleName} ${lastName}`;
}

function generateRandomPhone() {
  const prefixes = ['090', '091', '093', '094', '097', '098', '084', '085', '086', '088'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return prefix + suffix;
}

function generateRandomEmail(name) {
  const normalized = name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, '.');
  const random = Math.floor(Math.random() * 1000);
  return `${normalized}${random}@example.com`;
}

function generateRandomDateOfBirth() {
  const year = Math.floor(Math.random() * (2005 - 1950 + 1)) + 1950;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1; // Safe for all months
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

function generateRandomIdNumber() {
  return Math.floor(Math.random() * 900000000000) + 100000000000; // 12 digits
}

async function createResidentsForApartments() {
  console.log('👥 Tạo cư dân cho các căn hộ trống...\n');

  // Lấy danh sách căn hộ trống (vacant)
  const { data: apartments, error: aptError } = await supabaseAdmin
    .from('apartments')
    .select('apt_id, floor, area')
    .eq('status', 'vacant')
    .order('apt_id');

  if (aptError) {
    console.error('❌ Lỗi khi lấy danh sách căn hộ:', aptError.message);
    return;
  }

  if (!apartments || apartments.length === 0) {
    console.log('⚠️  Không có căn hộ trống nào để thêm cư dân');
    return;
  }

  console.log(`📋 Tìm thấy ${apartments.length} căn hộ trống\n`);

  let totalResidents = 0;
  let apartmentsUpdated = 0;

  for (const apartment of apartments) {
    const apt_id = apartment.apt_id;
    
    // Mỗi căn hộ có từ 1-4 cư dân
    const numResidents = Math.floor(Math.random() * 4) + 1;
    
    console.log(`🏠 ${apt_id} - Tạo ${numResidents} cư dân...`);
    
    const residents = [];
    
    for (let i = 0; i < numResidents; i++) {
      const name = generateRandomName();
      const gender = genders[Math.floor(Math.random() * genders.length)];
      
      const residentData = {
        apt_id: apt_id,
        full_name: name,
        phone: generateRandomPhone(),
        email: generateRandomEmail(name),
        id_number: generateRandomIdNumber().toString(),
        cccd: generateRandomIdNumber().toString(),
        date_of_birth: generateRandomDateOfBirth(),
        hometown: hometowns[Math.floor(Math.random() * hometowns.length)],
        gender: gender,
        is_owner: i === 0, // Người đầu tiên là chủ hộ
        created_at: new Date().toISOString()
      };
      
      residents.push(residentData);
    }

    // Insert residents
    const { data: insertedResidents, error: insertError } = await supabaseAdmin
      .from('residents')
      .insert(residents)
      .select();

    if (insertError) {
      console.error(`   ❌ Lỗi: ${insertError.message}`);
      continue;
    }

    // Lấy thông tin chủ hộ (người đầu tiên)
    const owner = residents[0];

    // Cập nhật apartment với thông tin chủ hộ và trạng thái
    const { error: updateError } = await supabaseAdmin
      .from('apartments')
      .update({
        owner_name: owner.full_name,
        owner_phone: owner.phone,
        owner_email: owner.email,
        resident_count: numResidents,
        status: 'occupied'
      })
      .eq('apt_id', apt_id);

    if (updateError) {
      console.error(`   ❌ Lỗi cập nhật căn hộ: ${updateError.message}`);
    } else {
      console.log(`   ✅ Đã tạo ${numResidents} cư dân (Chủ hộ: ${owner.full_name})`);
      totalResidents += numResidents;
      apartmentsUpdated++;
    }
  }

  console.log('\n📊 Tổng kết:');
  console.log(`   ✅ Số căn hộ đã cập nhật: ${apartmentsUpdated}`);
  console.log(`   👥 Tổng số cư dân đã tạo: ${totalResidents}`);
  console.log(`   📦 Căn hộ xử lý: ${apartments.length}`);
  
  console.log('\n🎉 Hoàn thành! Bạn có thể kiểm tra danh sách cư dân trên giao diện.');
}

createResidentsForApartments()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  });
