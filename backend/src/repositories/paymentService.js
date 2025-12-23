const { supabase } = require('../config/supabase.js');

/**
 * Thống kê tổng đã thu của từng căn hộ (phân trang, sắp xếp giảm dần theo tiền thu)
 */
exports.getIncomeByApartmentPaginated = async (offset = 0, limit = 20) => {
  const { data: payments, error: payError } = await supabase
    .from('payments')
    .select('apt_id, amount');

  if (payError) throw payError;

  const incomeMap = (payments || []).reduce((acc, p) => {
    acc[p.apt_id] = (acc[p.apt_id] || 0) + Number(p.amount);
    return acc;
  }, {});

  const { data: apartments, error: aptError, count } = await supabase
    .from('apartments')
    .select('apt_id, owner_name, floor', { count: 'exact' })
    .order('apt_id')
    .range(offset, offset + limit - 1);

  if (aptError) throw aptError;

  const resultData = (apartments || [])
    .map(apt => ({
      apt_id: apt.apt_id,
      owner_name: apt.owner_name,
      floor: apt.floor,
      total_paid: incomeMap[apt.apt_id] || 0
    }))
    .sort((a, b) => b.total_paid - a.total_paid);

  return { data: resultData, total: count || 0 };
};

/**
 * Thống kê tổng đã thu theo tầng
 */
exports.getIncomeByFloor = async () => {
  const { data: payments, error } = await supabase
    .from('payments')
    .select('apartments!inner(floor), amount');

  if (error) throw error;

  if (!payments || payments.length === 0) return [];

  const floorMap = payments.reduce((acc, p) => {
    const floor = p.apartments.floor ?? 'Không xác định';
    acc[floor] = (acc[floor] || 0) + Number(p.amount || 0);
    return acc;
  }, {});

  return Object.entries(floorMap)
    .map(([key, value]) => ({
      floor: isNaN(key) ? null : parseInt(key),
      display: `Tầng ${key}`,
      total_income: value
    }))
    .sort((a, b) => (a.floor ?? -1) - (b.floor ?? -1));
};

/**
 * Thống kê tài chính chi tiết theo tầng (dựa trên hóa đơn hiện tại trong bảng bills)
 */
exports.getFinancialByFloor = async () => {
  const { data: payments, error: payError } = await supabase
    .from('payments')
    .select('amount, apartments!inner(floor)');

  if (payError) throw payError;

  const paidMap = (payments || []).reduce((acc, p) => {
    const floor = p.apartments.floor ?? 'Không xác định';
    acc[floor] = (acc[floor] || 0) + Number(p.amount || 0);
    return acc;
  }, {});

  const { data: bills, error: billError } = await supabase
    .from('bills')
    .select('electric, water, service, vehicles, pre_debt, apartments!inner(floor)');

  if (billError) throw billError;

  const billedMap = {}; 
  const debtMap = {};  

  (bills || []).forEach(b => {
    const floor = b.apartments.floor ?? 'Không xác định';
    const currentNew = Number(b.electric || 0) + Number(b.water || 0) + Number(b.service || 0) + Number(b.vehicles || 0);
    const totalDue = currentNew + Number(b.pre_debt || 0);

    billedMap[floor] = (billedMap[floor] || 0) + totalDue;
    debtMap[floor] = (debtMap[floor] || 0) + Number(b.pre_debt || 0);
  });

  const floors = new Set([...Object.keys(paidMap), ...Object.keys(billedMap), ...Object.keys(debtMap)]);

  return Array.from(floors)
    .map(key => ({
      floor: isNaN(key) ? null : parseInt(key),
      display: `Tầng ${key}`,
      total_paid: paidMap[key] || 0,
      total_due_current: billedMap[key] || 0,     
      current_pre_debt: debtMap[key] || 0,        
      collection_rate: billedMap[key] > 0
        ? ((paidMap[key] / billedMap[key]) * 100).toFixed(2) + '%'
        : '0%'
    }))
    .sort((a, b) => (a.floor ?? -1) - (b.floor ?? -1));
};

/**
 * Danh sách các căn hộ đang nợ (pre_debt > 0 trong bảng bills hiện tại)
 */
exports.getApartmentsInDebt = async (offset = 0, limit = 20) => {
  const { data: bills, error } = await supabase
    .from('bills')
    .select(`
      apt_id,
      pre_debt,
      apartments (
        owner_name,
        floor
      )
    `)
    .gt('pre_debt', 0);

  if (error) throw error;

  const debtList = (bills || [])
    .map(b => ({
      apt_id: b.apt_id,
      owner_name: b.apartments.owner_name,
      floor: b.apartments.floor,
      debt: Number(b.pre_debt)
    }))
    .sort((a, b) => b.debt - a.debt);

  return {
    data: debtList.slice(offset, offset + limit),
    total: debtList.length
  };
};

/**
 * Chi tiết tài chính một căn hộ cụ thể (dựa trên hóa đơn hiện tại + lịch sử thanh toán)
 */
exports.getApartmentFinancialSummary = async (apt_id) => {
  const { data: bill, error: billError } = await supabase
    .from('bills')
    .select('electric, water, service, vehicles, pre_debt')
    .eq('apt_id', apt_id)
    .single();

  if (billError && billError.code !== 'PGRST116') throw billError; 

  const newCharges = bill
    ? Number(bill.electric || 0) + Number(bill.water || 0) + Number(bill.service || 0) + Number(bill.vehicles || 0)
    : 0;

  const preDebt = Number(bill?.pre_debt || 0);
  const totalDueCurrent = newCharges + preDebt;

  const { data: payments, error: payError } = await supabase
    .from('payments')
    .select('period, amount, paid_at, method, note')
    .eq('apt_id', apt_id)
    .order('paid_at', { ascending: false });

  if (payError) throw payError;

  const totalPaidAllTime = (payments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const currentRemainingDebt = totalDueCurrent - totalPaidAllTime > 0 ? totalDueCurrent - totalPaidAllTime : 0;

  return {
    apt_id,
    new_charges_current: newCharges,          
    pre_debt: preDebt,                         
    total_due_current: totalDueCurrent,        
    total_paid_all_time: totalPaidAllTime,     
    current_remaining_debt: currentRemainingDebt,
    payments: payments || []
  };
};

/**
 * Thống kê tài chính tổng quan toàn tòa nhà
 */
exports.getBuildingFinancialSummary = async () => {
  const { data: allPayments, error: payError } = await supabase
    .from('payments')
    .select('amount');

  if (payError) throw payError;

  const totalIncome = (allPayments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const { data: bills, error: billError } = await supabase
    .from('bills')
    .select('electric, water, service, vehicles, pre_debt');

  if (billError) throw billError;

  let totalDueCurrent = 0;
  let totalPreDebt = 0;
  let apartmentsInDebt = 0;

  (bills || []).forEach(b => {
    const newCharges = Number(b.electric || 0) + Number(b.water || 0) + Number(b.service || 0) + Number(b.vehicles || 0);
    const due = newCharges + Number(b.pre_debt || 0);
    totalDueCurrent += due;
    totalPreDebt += Number(b.pre_debt || 0);
    if (Number(b.pre_debt || 0) > 0) apartmentsInDebt++;
  });

  const { count: totalApartments } = await supabase
    .from('apartments')
    .select('*', { count: 'exact', head: true });

  return {
    total_income: totalIncome,
    total_due_current: totalDueCurrent,         
    total_pre_debt: totalPreDebt,               
    apartments_in_debt: apartmentsInDebt,
    total_apartments: totalApartments || 0,
    debt_ratio: totalApartments > 0
      ? ((apartmentsInDebt / totalApartments) * 100).toFixed(2) + '%'
      : '0%'
  };
};