const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env');
  console.error('File .env phải nằm trong thư mục backend/');
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
  const day = Math.floor(Math.random() * 28) + 1;
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

function generateRandomIdNumber() {
  return Math.floor(Math.random() * 900000000000) + 100000000000; // 12 digits
}

async function resetTestData() {
  console.log('🔄 Reset dữ liệu test và tạo lại từ đầu...\n');

  // Danh sách căn hộ test (không bao gồm A101 - căn hộ admin)
  const testApartments = [
    'A201', 'A202', 'A203',
    'A301', 'A302', 'A303',
    'B201', 'B202', 'B203',
    'B301', 'B302', 'B303',
    'C201', 'C202', 'C203'
  ];

  // Bước 1: Xóa cư dân của các căn hộ test
  console.log('🗑️  Bước 1: Xóa cư dân cũ...');
  const { error: deleteResidentsError } = await supabaseAdmin
    .from('residents')
    .delete()
    .in('apt_id', testApartments);

  if (deleteResidentsError) {
    console.error('❌ Lỗi khi xóa cư dân:', deleteResidentsError.message);
  } else {
    console.log('✅ Đã xóa cư dân cũ\n');
  }

  // Bước 2: Xóa các căn hộ test
  console.log('🗑️  Bước 2: Xóa căn hộ test cũ...');
  const { error: deleteApartmentsError } = await supabaseAdmin
    .from('apartments')
    .delete()
    .in('apt_id', testApartments);

  if (deleteApartmentsError) {
    console.error('❌ Lỗi khi xóa căn hộ:', deleteApartmentsError.message);
  } else {
    console.log('✅ Đã xóa căn hộ test cũ\n');
  }

  // Bước 3: Tạo lại 15 căn hộ trống
  console.log('🏢 Bước 3: Tạo 15 căn hộ mới...');
  const apartmentsToCreate = [
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

  const apartmentDataList = apartmentsToCreate.map(apt => ({
    apt_id: apt.apt_id,
    floor: apt.floor,
    area: apt.area,
    status: 'vacant',
    resident_count: 0,
    owner_name: '',
    owner_phone: '',
    owner_email: '',
    created_at: new Date().toISOString()
  }));

  const { error: insertAptError } = await supabaseAdmin
    .from('apartments')
    .insert(apartmentDataList);

  if (insertAptError) {
    console.error('❌ Lỗi khi tạo căn hộ:', insertAptError.message);
    return;
  }
  console.log('✅ Đã tạo 15 căn hộ mới\n');

  // Bước 4: Tạo cư dân cho mỗi căn hộ
  console.log('👥 Bước 4: Tạo cư dân cho các căn hộ...\n');

  let totalResidents = 0;
  let apartmentsProcessed = 0;

  for (const apartment of apartmentsToCreate) {
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

    // Lấy thông tin chủ hộ
    const owner = residents[0];

    // Cập nhật apartment với thông tin chủ hộ
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
      console.log(`   ✅ ${numResidents} cư dân (Chủ hộ: ${owner.full_name})`);
      totalResidents += numResidents;
      apartmentsProcessed++;
    }
  }

  console.log('\n📊 Tổng kết:');
  console.log(`   🏢 Căn hộ đã tạo: ${apartmentsToCreate.length}`);
  console.log(`   👥 Tổng số cư dân: ${totalResidents}`);
  console.log(`   ✅ Căn hộ đã cập nhật: ${apartmentsProcessed}`);
  
  console.log('\n🎉 Hoàn thành! Dữ liệu test đã được reset và tạo lại.');
  console.log('📋 Mỗi căn hộ có 1-4 cư dân với 1 chủ hộ');
  console.log('📝 Tất cả cư dân đều có đầy đủ thông tin: CCCD, ngày sinh, giới tính, quê quán');
}

resetTestData()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  });
