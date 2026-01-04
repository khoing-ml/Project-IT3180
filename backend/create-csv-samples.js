const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createCSVSamples() {
  try {
    console.log('📊 Đang lấy danh sách căn hộ...');

    // Fetch occupied apartments
    const { data: apartments, error } = await supabase
      .from('apartments')
      .select('apt_id, owner_name')
      .eq('status', 'occupied')
      .order('apt_id')
      .limit(10);
    
    if (error) throw error;

    console.log(`✅ Đã lấy ${apartments.length} căn hộ\n`);

    // Generate random consumption values
    const getRandomValue = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    // ===== Format 1: Wide Format =====
    const wideHeader = 'apt_id,Điện,Nước,Xe\n';
    let wideData = wideHeader;
    
    apartments.forEach(apt => {
      const electric = getRandomValue(80, 200);  // 80-200 kWh
      const water = getRandomValue(8, 25);       // 8-25 m³
      const vehicles = getRandomValue(0, 2);     // 0-2 xe
      wideData += `${apt.apt_id},${electric},${water},${vehicles}\n`;
    });

    fs.writeFileSync('sample_bills_wide.csv', wideData);
    console.log('✅ Đã tạo file: sample_bills_wide.csv');
    console.log('   Format: apt_id, Điện, Nước, Xe');
    console.log('   Số hàng:', apartments.length);
    console.log('\nNội dung:\n' + wideData);

    // ===== Format 2: Long Format =====
    const longHeader = 'apt_id,service,units\n';
    let longData = longHeader;
    
    apartments.forEach(apt => {
      const electric = getRandomValue(80, 200);
      const water = getRandomValue(8, 25);
      const vehicles = getRandomValue(0, 2);
      
      longData += `${apt.apt_id},Điện,${electric}\n`;
      longData += `${apt.apt_id},Nước,${water}\n`;
      if (vehicles > 0) {
        longData += `${apt.apt_id},Xe,${vehicles}\n`;
      }
    });

    fs.writeFileSync('sample_bills_long.csv', longData);
    console.log('\n✅ Đã tạo file: sample_bills_long.csv');
    console.log('   Format: apt_id, service, units');
    console.log('   Số hàng:', longData.split('\n').length - 2);
    console.log('\nNội dung (10 dòng đầu):');
    console.log(longData.split('\n').slice(0, 11).join('\n'));

    // ===== Format 3: Wide với nhiều dịch vụ =====
    const wideFullHeader = 'apt_id,Điện,Nước,Dịch vụ,Xe,Gửi xe máy,Gửi ô tô\n';
    let wideFullData = wideFullHeader;
    
    apartments.forEach(apt => {
      const electric = getRandomValue(80, 200);
      const water = getRandomValue(8, 25);
      const service = 500000;  // Cố định 500k
      const vehicles = getRandomValue(0, 2);
      const motorbikes = getRandomValue(0, 3);
      const cars = getRandomValue(0, 1);
      
      wideFullData += `${apt.apt_id},${electric},${water},${service},${vehicles},${motorbikes},${cars}\n`;
    });

    fs.writeFileSync('sample_bills_wide_full.csv', wideFullData);
    console.log('\n✅ Đã tạo file: sample_bills_wide_full.csv');
    console.log('   Format: apt_id, Điện, Nước, Dịch vụ, Xe, Gửi xe máy, Gửi ô tô');
    console.log('   Số hàng:', apartments.length);

    console.log('\n📝 Hướng dẫn sử dụng:');
    console.log('   1. Vào trang /bills (admin)');
    console.log('   2. Click "🚰 Gửi số liệu"');
    console.log('   3. Chọn kỳ thanh toán (VD: 2026-01)');
    console.log('   4. Upload một trong 3 file CSV vừa tạo');
    console.log('   5. Preview và xác nhận gửi hàng loạt');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

createCSVSamples();
