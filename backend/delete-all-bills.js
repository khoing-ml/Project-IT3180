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

async function deleteAllBills() {
  console.log('🗑️  Xóa tất cả bills và payments...\n');

  // 1. Xóa tất cả payments trước
  console.log('💳 Xóa tất cả payments...');
  const { error: paymentError } = await supabaseAdmin
    .from('payments')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (paymentError) {
    console.error('❌ Lỗi khi xóa payments:', paymentError.message);
  } else {
    console.log('✅ Đã xóa tất cả payments');
  }

  // 2. Xóa tất cả bills
  console.log('\n📄 Xóa tất cả bills...');
  const { error: billError } = await supabaseAdmin
    .from('bills')
    .delete()
    .neq('apt_id', ''); // Delete all

  if (billError) {
    console.error('❌ Lỗi khi xóa bills:', billError.message);
  } else {
    console.log('✅ Đã xóa tất cả bills');
  }

  console.log('\n🎉 Hoàn thành! Đã xóa sạch tất cả bills và payments.');
  console.log('💡 Giờ có thể chạy: node create-test-bills.js để tạo lại dữ liệu mới');
}

deleteAllBills()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  });
