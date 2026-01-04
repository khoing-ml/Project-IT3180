#!/usr/bin/env node
/**
 * Script to manage residents
 * Usage:
 *   node manage-residents.js list                    - List all residents
 *   node manage-residents.js info <resident_code>    - Show resident info by code
 *   node manage-residents.js info-cccd <cccd>        - Show resident info by CCCD
 *   node manage-residents.js stats                   - Show statistics
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '.env.local') });
// Fallback to .env if .env.local doesn't exist
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
}
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials in .env or .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * List all residents
 */
async function listResidents() {
  try {
    const { data: residents, error } = await supabase
      .from('residents')
      .select('*')
      .order('resident_code', { ascending: true });

    if (error) {
      console.error('Error fetching residents:', error);
      return;
    }

    console.log('\n=== Danh sách Cư dân ===\n');
    console.log('Mã CD\t\t\tCCCD\t\t\tHọ tên\t\t\t\t\tCăn hộ\t\tSĐT\t\t\tChủ hộ');
    console.log('-'.repeat(150));

    residents.forEach(res => {
      const code = (res.resident_code || '-').padEnd(15);
      const cccd = (res.cccd || '-').padEnd(15);
      const name = res.full_name.padEnd(35);
      const apt = res.apt_id.padEnd(10);
      const phone = (res.phone || '-').padEnd(15);
      const owner = res.is_owner ? '✓ Chủ hộ' : '';
      console.log(`${code}\t${cccd}\t${name}\t${apt}\t${phone}\t${owner}`);
    });

    console.log(`\nTổng: ${residents.length} cư dân`);
    
    // Count by apartment
    const aptCounts = residents.reduce((acc, r) => {
      acc[r.apt_id] = (acc[r.apt_id] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`Số căn hộ có người: ${Object.keys(aptCounts).length}`);
    console.log(`Số chủ hộ: ${residents.filter(r => r.is_owner).length}\n`);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Show resident info by resident code
 */
async function showResidentByCode(residentCode) {
  try {
    const { data: resident, error } = await supabase
      .from('residents')
      .select('*')
      .eq('resident_code', residentCode)
      .single();

    if (error || !resident) {
      console.error(`Không tìm thấy cư dân với mã: ${residentCode}`);
      return;
    }

    displayResidentInfo(resident);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Show resident info by CCCD
 */
async function showResidentByCCCD(cccd) {
  try {
    const { data: resident, error } = await supabase
      .from('residents')
      .select('*')
      .eq('cccd', cccd)
      .single();

    if (error || !resident) {
      console.error(`Không tìm thấy cư dân với CCCD: ${cccd}`);
      return;
    }

    displayResidentInfo(resident);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Display resident information
 */
function displayResidentInfo(resident) {
  console.log('\n=== Thông tin Cư dân ===\n');
  console.log(`Mã cư dân: ${resident.resident_code || 'Chưa có'}`);
  console.log(`CCCD: ${resident.cccd || 'Chưa có'}`);
  console.log(`Họ tên: ${resident.full_name}`);
  console.log(`Căn hộ: ${resident.apt_id}`);
  console.log(`Điện thoại: ${resident.phone || 'Chưa có'}`);
  console.log(`Email: ${resident.email || 'Chưa có'}`);
  console.log(`Năm sinh: ${resident.year_of_birth || 'Chưa có'}`);
  console.log(`Giới tính: ${resident.gender || 'Chưa có'}`);
  console.log(`Quê quán: ${resident.hometown || 'Chưa có'}`);
  console.log(`Chủ hộ: ${resident.is_owner ? 'Có' : 'Không'}`);
  console.log(`Ghi chú: ${resident.notes || 'Không có'}`);
  console.log(`Ngày tạo: ${new Date(resident.created_at).toLocaleString('vi-VN')}`);
  console.log('');
}

/**
 * Show statistics
 */
async function showStats() {
  try {
    const { data: residents, error } = await supabase
      .from('residents')
      .select('*');

    if (error) {
      console.error('Error fetching residents:', error);
      return;
    }

    console.log('\n=== Thống kê Cư dân ===\n');
    
    // Total residents
    console.log(`Tổng số cư dân: ${residents.length}`);
    
    // Owners
    const owners = residents.filter(r => r.is_owner);
    console.log(`Số chủ hộ: ${owners.length}`);
    console.log(`Số người không phải chủ hộ: ${residents.length - owners.length}`);
    
    // By apartment
    const aptCounts = residents.reduce((acc, r) => {
      acc[r.apt_id] = (acc[r.apt_id] || 0) + 1;
      return acc;
    }, {});
    console.log(`\nSố căn hộ có người: ${Object.keys(aptCounts).length}`);
    
    // Gender statistics
    const genderCounts = residents.reduce((acc, r) => {
      const gender = r.gender || 'Không rõ';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});
    console.log('\nThống kê theo giới tính:');
    Object.entries(genderCounts).forEach(([gender, count]) => {
      console.log(`  ${gender}: ${count}`);
    });
    
    // CCCD statistics
    const withCCCD = residents.filter(r => r.cccd).length;
    const withoutCCCD = residents.length - withCCCD;
    console.log('\nThống kê CCCD:');
    console.log(`  Đã có CCCD: ${withCCCD}`);
    console.log(`  Chưa có CCCD: ${withoutCCCD}`);
    
    // Resident code statistics
    const withCode = residents.filter(r => r.resident_code).length;
    const withoutCode = residents.length - withCode;
    console.log('\nThống kê Mã cư dân:');
    console.log(`  Đã có mã: ${withCode}`);
    console.log(`  Chưa có mã: ${withoutCode}`);
    
    console.log('');
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Generate and update resident codes for all residents without codes
 */
async function generateCodes() {
  try {
    const { data: residents, error } = await supabase
      .from('residents')
      .select('id, resident_code, full_name')
      .is('resident_code', null);

    if (error) {
      console.error('Error fetching residents:', error);
      return;
    }

    if (residents.length === 0) {
      console.log('Tất cả cư dân đã có mã cư dân.');
      return;
    }

    console.log(`\nTìm thấy ${residents.length} cư dân chưa có mã. Đang tạo mã...`);

    for (const resident of residents) {
      // Call RPC function to generate code
      const { data: newCode, error: rpcError } = await supabase.rpc('generate_resident_code');
      
      if (rpcError) {
        console.error(`Lỗi tạo mã cho ${resident.full_name}:`, rpcError);
        continue;
      }

      // Update resident with new code
      const { error: updateError } = await supabase
        .from('residents')
        .update({ resident_code: newCode })
        .eq('id', resident.id);

      if (updateError) {
        console.error(`Lỗi cập nhật mã cho ${resident.full_name}:`, updateError);
      } else {
        console.log(`✓ ${resident.full_name}: ${newCode}`);
      }
    }

    console.log('\nHoàn thành!\n');
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help') {
    console.log(`
Usage:
  node manage-residents.js list                    - List all residents
  node manage-residents.js info <resident_code>    - Show resident info by code
  node manage-residents.js info-cccd <cccd>        - Show resident info by CCCD
  node manage-residents.js stats                   - Show statistics
  node manage-residents.js generate-codes          - Generate codes for residents without codes

Resident Code Format: CD-YYYY-XXXX (e.g., CD-2026-0001)
CCCD Format: 12 digits (e.g., 001234567890)

Examples:
  node manage-residents.js list
  node manage-residents.js info CD-2026-0001
  node manage-residents.js info-cccd 001234567890
  node manage-residents.js stats
  node manage-residents.js generate-codes
    `);
    return;
  }

  switch (command) {
    case 'list':
      await listResidents();
      break;
    
    case 'info':
      if (args.length < 2) {
        console.error('Error: Missing resident code');
        console.error('Usage: node manage-residents.js info <resident_code>');
        return;
      }
      await showResidentByCode(args[1]);
      break;
    
    case 'info-cccd':
      if (args.length < 2) {
        console.error('Error: Missing CCCD');
        console.error('Usage: node manage-residents.js info-cccd <cccd>');
        return;
      }
      await showResidentByCCCD(args[1]);
      break;
    
    case 'stats':
      await showStats();
      break;
    
    case 'generate-codes':
      await generateCodes();
      break;
    
    default:
      console.error(`Error: Unknown command "${command}". Use "help" to see available commands.`);
  }
}

main().catch(console.error);
