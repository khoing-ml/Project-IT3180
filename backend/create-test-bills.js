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

// Tạo bills cho kỳ hiện tại và 2 kỳ trước
function getCurrentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getPreviousPeriod(monthsAgo) {
  const now = new Date();
  now.setMonth(now.getMonth() - monthsAgo);
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

async function createTestBills() {
  console.log('💰 Tạo dữ liệu test cho Bills...\n');

  // Lấy danh sách căn hộ có cư dân
  const { data: apartments, error: aptError } = await supabaseAdmin
    .from('apartments')
    .select('apt_id, owner_name')
    .eq('status', 'occupied')
    .order('apt_id');

  if (aptError) {
    console.error('❌ Lỗi khi lấy danh sách căn hộ:', aptError.message);
    return;
  }

  if (!apartments || apartments.length === 0) {
    console.log('⚠️  Không có căn hộ nào có người ở');
    return;
  }

  console.log(`📋 Tìm thấy ${apartments.length} căn hộ có người ở\n`);

  const periods = [
    getPreviousPeriod(2), // 2 tháng trước
    getPreviousPeriod(1), // 1 tháng trước
    getCurrentPeriod()     // Tháng hiện tại
  ];

  console.log(`📅 Tạo bills cho ${periods.length} kỳ: ${periods.join(', ')}\n`);

  const bills = [];
  let totalBills = 0;

  for (const period of periods) {
    console.log(`\n🗓️  Kỳ ${period}:`);
    
    for (const apartment of apartments) {
      // Tạo số tiền ngẫu nhiên cho các dịch vụ
      const electric = Math.floor(Math.random() * 300000) + 200000; // 200k-500k
      const water = Math.floor(Math.random() * 100000) + 50000;     // 50k-150k
      const service = Math.floor(Math.random() * 200000) + 150000;  // 150k-350k
      const vehicles = Math.floor(Math.random() * 3) * 100000;      // 0, 100k, 200k
      
      // Công nợ cũ (chỉ có ở kỳ đầu, sau đó tích lũy)
      let pre_debt = 0;
      if (period === periods[0]) {
        // Một số căn có công nợ cũ
        pre_debt = Math.random() > 0.7 ? Math.floor(Math.random() * 500000) : 0;
      }
      
      const total = electric + water + service + vehicles + pre_debt;
      
      // Một số bills đã thanh toán, một số chưa
      const isPaid = Math.random() > 0.3; // 70% đã thanh toán
      
      const bill = {
        apt_id: apartment.apt_id,
        owner: apartment.owner_name || 'Chưa có chủ hộ',
        period: period,
        electric: electric,
        water: water,
        service: service,
        vehicles: vehicles,
        pre_debt: pre_debt,
        total: total,
        paid: isPaid,
        paid_at: isPaid ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null,
        status: isPaid ? 'paid' : 'unpaid'
      };
      
      bills.push(bill);
      totalBills++;
    }
    
    console.log(`   ✅ Tạo ${apartments.length} bills`);
  }

  // Insert bills vào database
  console.log(`\n💾 Đang lưu ${totalBills} bills vào database...`);
  
  // Chia nhỏ để tránh request quá lớn
  const batchSize = 50;
  let inserted = 0;
  
  for (let i = 0; i < bills.length; i += batchSize) {
    const batch = bills.slice(i, i + batchSize);
    
    const { error: insertError } = await supabaseAdmin
      .from('bills')
      .upsert(batch, { onConflict: ['apt_id', 'period'] });
    
    if (insertError) {
      console.error(`❌ Lỗi khi insert batch ${i / batchSize + 1}:`, insertError.message);
    } else {
      inserted += batch.length;
      console.log(`   ✅ Đã lưu ${inserted}/${totalBills} bills`);
    }
  }

  // Tạo payments cho các bill đã thanh toán
  console.log('\n💳 Tạo payments cho các bills đã thanh toán...');
  
  const paidBills = bills.filter(b => b.paid);
  const payments = paidBills.map(bill => ({
    apt_id: bill.apt_id,
    period: bill.period,
    amount: bill.total,
    paid_at: bill.paid_at,
    method: ['cash', 'bank_transfer', 'momo', 'zalopay'][Math.floor(Math.random() * 4)]
  }));

  if (payments.length > 0) {
    for (let i = 0; i < payments.length; i += batchSize) {
      const batch = payments.slice(i, i + batchSize);
      
      const { error: paymentError } = await supabaseAdmin
        .from('payments')
        .insert(batch);
      
      if (paymentError) {
        console.error(`❌ Lỗi khi tạo payments:`, paymentError.message);
      }
    }
    console.log(`   ✅ Đã tạo ${payments.length} payments`);
  }

  // Thống kê
  const paidCount = bills.filter(b => b.paid).length;
  const unpaidCount = bills.filter(b => !b.paid).length;
  const totalAmount = bills.reduce((sum, b) => sum + b.total, 0);
  const paidAmount = bills.filter(b => b.paid).reduce((sum, b) => sum + b.total, 0);
  const unpaidAmount = bills.filter(b => !b.paid).reduce((sum, b) => sum + b.total, 0);

  console.log('\n📊 Tổng kết:');
  console.log(`   📅 Số kỳ: ${periods.length}`);
  console.log(`   🏢 Số căn hộ: ${apartments.length}`);
  console.log(`   📝 Tổng bills: ${totalBills}`);
  console.log(`   ✅ Đã thanh toán: ${paidCount} bills (${(paidAmount / 1000000).toFixed(1)}M VNĐ)`);
  console.log(`   ⏳ Chưa thanh toán: ${unpaidCount} bills (${(unpaidAmount / 1000000).toFixed(1)}M VNĐ)`);
  console.log(`   💰 Tổng tiền: ${(totalAmount / 1000000).toFixed(1)}M VNĐ`);
  
  console.log('\n🎉 Hoàn thành! Có thể test chức năng Bills trên giao diện.');
}

createTestBills()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  });
