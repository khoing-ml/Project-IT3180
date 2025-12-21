const { supabase, supabaseAdmin } = require('../config/supabase.js');

exports.getIncomeByApartmentPaginated = async (offset = 0, limit = 20) => {
  const { data: payments, error: payError } = await supabase
    .from('payments')
    .select('apt_id, amount');

  if (payError) throw payError;

  const incomeMap = payments.reduce((acc, p) => {
    acc[p.apt_id] = (acc[p.apt_id] || 0) + Number(p.amount);
    return acc;
  }, {});

  const { data: apartments, error: aptError, count } = await supabase
    .from('apartments')
    .select('apt_id, owner_name, floor', { count: 'exact' })  
    .order('apt_id')  // Chỉ order theo apt_id
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

exports.createMonthlyBill = async (billData) => {
  const { data, error } = await supabaseAdmin
    .from('monthly_bills')
    .insert([billData])  
    .select()
    .single();

  if (error) throw error;
  return data;
};


/**
 * Thống kê đã thu theo floor 
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

  return Object.keys(floorMap)
    .map(key => ({
      floor: parseInt(key), 
      display: `Tầng ${key}`,
      total_income: floorMap[key]
    }))
    .sort((a, b) => a.floor - b.floor);  
};


/**
 * Thống kê tài chính đầy đủ theo tầng:
 * - Tổng đã thu (total_paid)
 * - Tổng phải thu (total_billed)
 * - Tổng nợ hiện tại của tầng (dựa trên pre_debt kỳ mới nhất mỗi căn)
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
    .from('monthly_bills')
    .select('total, apartments!inner(floor)');

  if (billError) throw billError;

  const billedMap = (bills || []).reduce((acc, b) => {
    const floor = b.apartments.floor ?? 'Không xác định';
    acc[floor] = (acc[floor] || 0) + Number(b.total || 0);
    return acc;
  }, {});

  const { data: allLatestBills, error: latestError } = await supabase
    .from('monthly_bills')
    .select('apt_id, pre_debt, apartments!inner(floor)')
    .order('period', { ascending: false });

  if (latestError) throw latestError;

  const latestDebtMap = {};
  for (const bill of allLatestBills || []) {
    if (!latestDebtMap[bill.apt_id]) {
      latestDebtMap[bill.apt_id] = bill;
    }
  }

  const debtMap = Object.values(latestDebtMap).reduce((acc, b) => {
    const floor = b.apartments.floor ?? 'Không xác định';
    acc[floor] = (acc[floor] || 0) + Number(b.pre_debt || 0);
    return acc;
  }, {});

  const floors = new Set([
    ...Object.keys(paidMap),
    ...Object.keys(billedMap),
    ...Object.keys(debtMap)
  ]);

  return Array.from(floors)
    .map(key => ({
      floor: parseInt(key) || 0,
      display: `Tầng ${key}`,
      total_paid: paidMap[key] || 0,
      total_billed: billedMap[key] || 0,
      current_debt: debtMap[key] || 0,
      collection_rate: billedMap[key] > 0
        ? ((paidMap[key] / billedMap[key]) * 100).toFixed(2) + '%'
        : '0%'
    }))
    .sort((a, b) => a.floor - b.floor);
};

/**
 * Danh sách các căn hộ còn nợ
 */
exports.getApartmentsInDebt = async (offset = 0, limit = 20) => {
  const { data: bills, error } = await supabase
    .from('monthly_bills')
    .select(`
      apt_id,
      period,
      pre_debt,
      apartments (
        owner_name,
        floor
      )
    `)
    .order('period', { ascending: false });

  if (error) throw error;

  const latestMap = {};
  for (const b of bills) {
    if (!latestMap[b.apt_id]) {
      latestMap[b.apt_id] = b;
    }
  }

  const debtList = Object.values(latestMap)
    .filter(b => Number(b.pre_debt) > 0)
    .map(b => ({
      apt_id: b.apt_id,
      owner_name: b.apartments.owner_name,
      floor: b.apartments.floor,
      debt: Number(b.pre_debt),
      period: b.period
    }))
    .sort((a, b) => b.debt - a.debt);

  return {
    data: debtList.slice(offset, offset + limit),
    total: debtList.length
  };
};

/**
 * Thống kê thu - chi - nợ chi tiết của một căn hộ cụ thể
 * Bao gồm:
 * - Tổng tiền phải thu (tổng hóa đơn tất cả các kỳ)
 * - Tổng tiền đã thanh toán
 * - Nợ hiện tại (pre_debt của kỳ mới nhất)
 * - Danh sách các kỳ hóa đơn kèm trạng thái thanh toán
 */
exports.getApartmentFinancialSummary = async (apt_id) => {
  const { data: bills, error: billError } = await supabase
    .from('monthly_bills')
    .select('id, period, electric, water, service, vehicles, pre_debt, total, created_at')
    .eq('apt_id', apt_id)
    .order('period', { ascending: false });

  if (billError) throw billError;

  const { data: payments, error: payError } = await supabase
    .from('payments')
    .select('period, amount, paid_at, method, note')
    .eq('apt_id', apt_id)
    .order('paid_at', { ascending: false });

  if (payError) throw payError;

  const totalBilled = bills.reduce((sum, b) => sum + Number(b.total || 0), 0);
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const currentDebt = bills.length > 0 ? Number(bills[0].pre_debt || 0) : 0;
  const latestPeriod = bills.length > 0 ? bills[0].period : null;

  const periodsSummary = bills.map(bill => {
    const paidForThisPeriod = payments
      .filter(p => p.period === bill.period)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      period: bill.period,
      total_bill: Number(bill.total),
      paid_amount: paidForThisPeriod,
      remaining_debt_this_period: Number(bill.total) - paidForThisPeriod,
      pre_debt_used: Number(bill.pre_debt), 
      status: paidForThisPeriod >= Number(bill.total) ? 'paid' : paidForThisPeriod > 0 ? 'partial' : 'unpaid'
    };
  });

  return {
    apt_id,
    latest_period: latestPeriod,
    total_billed: totalBilled,        
    total_paid: totalPaid,            
    current_debt: currentDebt,        
    periods: periodsSummary           
  };
};

/**
 * Thống kê tài chính tổng quan của toàn bộ tòa nhà
 * - Tổng thu (đã thanh toán)
 * - Tổng phải thu (tổng hóa đơn tất cả kỳ)
 * - Tổng nợ hiện tại (tổng pre_debt của kỳ mới nhất mỗi căn)
 * - Số căn hộ đang nợ
 */
exports.getBuildingFinancialSummary = async () => {
  const { data: allPayments, error: payError } = await supabase
    .from('payments')
    .select('amount');

  if (payError) throw payError;

  const totalIncome = allPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const { data: allBills, error: billError } = await supabase
    .from('monthly_bills')
    .select('apt_id, period, total, pre_debt')
    .order('apt_id')
    .order('period', { ascending: false });

  if (billError) throw billError;

  if (allBills.length === 0) {
    return {
      total_income: totalIncome,
      total_billed: 0,
      total_current_debt: 0,
      apartments_in_debt: 0,
      total_apartments: 0
    };
  }

  const totalBilled = allBills.reduce((sum, b) => sum + Number(b.total || 0), 0);

  const latestBillPerApt = {};
  for (const bill of allBills) {
    if (!latestBillPerApt[bill.apt_id]) {
      latestBillPerApt[bill.apt_id] = bill;
    }
  }

  const totalCurrentDebt = Object.values(latestBillPerApt)
    .reduce((sum, b) => sum + Number(b.pre_debt || 0), 0);

  const apartmentsInDebt = Object.values(latestBillPerApt)
    .filter(b => Number(b.pre_debt || 0) > 0).length;

  const { count: totalApartments } = await supabase
    .from('apartments')
    .select('*', { count: 'exact', head: true });

  return {
    total_income: totalIncome,
    total_billed: totalBilled,
    total_current_debt: totalCurrentDebt,
    apartments_in_debt: apartmentsInDebt,
    total_apartments: totalApartments || 0,
    debt_ratio: totalApartments > 0 
      ? ((apartmentsInDebt / totalApartments) * 100).toFixed(2) + '%' 
      : '0%'
  };
};