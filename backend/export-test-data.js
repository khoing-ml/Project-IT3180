const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function exportTestData() {
  try {
    console.log('📊 Đang lấy dữ liệu test...');

    // Fetch apartments
    const { data: apartments, error: aptError } = await supabase
      .from('apartments')
      .select('*')
      .order('apt_id');
    
    if (aptError) throw aptError;

    // Fetch residents
    const { data: residents, error: resError } = await supabase
      .from('residents')
      .select('*')
      .order('apt_id');
    
    if (resError) throw resError;

    // Fetch bills
    const { data: bills, error: billError } = await supabase
      .from('bills')
      .select('*')
      .order('apt_id, period');
    
    if (billError) throw billError;

    console.log(`✅ Đã lấy ${apartments.length} căn hộ`);
    console.log(`✅ Đã lấy ${residents.length} cư dân`);
    console.log(`✅ Đã lấy ${bills.length} hóa đơn`);

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Sheet 1: Apartments
    const aptData = apartments.map(apt => ({
      'Mã căn hộ': apt.apt_id,
      'Tầng': apt.floor,
      'Diện tích (m²)': apt.area,
      'Chủ hộ': apt.owner_name,
      'SĐT chủ hộ': apt.owner_phone,
      'Email chủ hộ': apt.owner_email,
      'Trạng thái': apt.status === 'occupied' ? 'Đã có người' : 'Trống',
      'Số cư dân': apt.resident_count,
    }));
    const wsApt = XLSX.utils.json_to_sheet(aptData);
    wsApt['!cols'] = [
      { wch: 12 },
      { wch: 8 },
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(wb, wsApt, 'Căn hộ');

    // Sheet 2: Residents
    const resData = residents.map(res => ({
      'Căn hộ': res.apt_id,
      'Họ tên': res.full_name,
      'CCCD': res.cccd,
      'Ngày sinh': res.date_of_birth,
      'Giới tính': res.gender === 'male' ? 'Nam' : 'Nữ',
      'SĐT': res.phone,
      'Email': res.email,
      'Quê quán': res.hometown,
      'Vai trò': res.is_owner ? 'Chủ hộ' : 'Thành viên',
    }));
    const wsRes = XLSX.utils.json_to_sheet(resData);
    wsRes['!cols'] = [
      { wch: 10 },
      { wch: 25 },
      { wch: 14 },
      { wch: 12 },
      { wch: 10 },
      { wch: 15 },
      { wch: 25 },
      { wch: 20 },
      { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(wb, wsRes, 'Cư dân');

    // Sheet 3: Bills
    const billData = bills.map(bill => ({
      'Căn hộ': bill.apt_id,
      'Chủ hộ': bill.owner,
      'Kỳ': bill.period,
      'Tiền điện (VNĐ)': Number(bill.electric || 0).toLocaleString('vi-VN'),
      'Tiền nước (VNĐ)': Number(bill.water || 0).toLocaleString('vi-VN'),
      'Phí dịch vụ (VNĐ)': Number(bill.service || 0).toLocaleString('vi-VN'),
      'Phí xe (VNĐ)': Number(bill.vehicles || 0).toLocaleString('vi-VN'),
      'Nợ cũ (VNĐ)': Number(bill.pre_debt || 0).toLocaleString('vi-VN'),
      'Tổng cộng (VNĐ)': Number(bill.total || 0).toLocaleString('vi-VN'),
      'Trạng thái': bill.paid ? 'Đã thu' : 'Chưa thu',
      'Ngày thu': bill.paid_at || '',
    }));
    const wsBill = XLSX.utils.json_to_sheet(billData);
    wsBill['!cols'] = [
      { wch: 10 },
      { wch: 25 },
      { wch: 10 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 15 },
      { wch: 15 },
      { wch: 18 },
      { wch: 12 },
      { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(wb, wsBill, 'Hóa đơn');

    // Sheet 4: Summary
    const totalPaid = bills.filter(b => b.paid).reduce((sum, b) => sum + Number(b.total || 0), 0);
    const totalUnpaid = bills.filter(b => !b.paid).reduce((sum, b) => sum + Number(b.total || 0), 0);
    
    const summaryData = [
      { 'Chỉ tiêu': 'Tổng số căn hộ', 'Giá trị': apartments.length },
      { 'Chỉ tiêu': 'Căn hộ đã cho thuê', 'Giá trị': apartments.filter(a => a.status === 'occupied').length },
      { 'Chỉ tiêu': 'Căn hộ trống', 'Giá trị': apartments.filter(a => a.status === 'vacant').length },
      { 'Chỉ tiêu': '', 'Giá trị': '' },
      { 'Chỉ tiêu': 'Tổng số cư dân', 'Giá trị': residents.length },
      { 'Chỉ tiêu': 'Số chủ hộ', 'Giá trị': residents.filter(r => r.is_owner).length },
      { 'Chỉ tiêu': 'Số thành viên', 'Giá trị': residents.filter(r => !r.is_owner).length },
      { 'Chỉ tiêu': '', 'Giá trị': '' },
      { 'Chỉ tiêu': 'Tổng số hóa đơn', 'Giá trị': bills.length },
      { 'Chỉ tiêu': 'Đã thu', 'Giá trị': bills.filter(b => b.paid).length },
      { 'Chỉ tiêu': 'Chưa thu', 'Giá trị': bills.filter(b => !b.paid).length },
      { 'Chỉ tiêu': '', 'Giá trị': '' },
      { 'Chỉ tiêu': 'Tổng tiền đã thu (VNĐ)', 'Giá trị': totalPaid.toLocaleString('vi-VN') },
      { 'Chỉ tiêu': 'Tổng tiền cần thu (VNĐ)', 'Giá trị': totalUnpaid.toLocaleString('vi-VN') },
      { 'Chỉ tiêu': 'Tổng doanh thu (VNĐ)', 'Giá trị': (totalPaid + totalUnpaid).toLocaleString('vi-VN') },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Tổng hợp');

    // Export file
    const filename = `test_data_bluemoon_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);

    console.log(`\n✅ Đã xuất file: ${filename}`);
    console.log('\n📋 Tổng hợp:');
    console.log(`   - ${apartments.length} căn hộ (${apartments.filter(a => a.status === 'occupied').length} đã thuê, ${apartments.filter(a => a.status === 'vacant').length} trống)`);
    console.log(`   - ${residents.length} cư dân (${residents.filter(r => r.is_owner).length} chủ hộ, ${residents.filter(r => !r.is_owner).length} thành viên)`);
    console.log(`   - ${bills.length} hóa đơn (${bills.filter(b => b.paid).length} đã thu, ${bills.filter(b => !b.paid).length} chưa thu)`);
    console.log(`   - Tổng tiền: ${(totalPaid + totalUnpaid).toLocaleString('vi-VN')} VNĐ`);

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

exportTestData();
