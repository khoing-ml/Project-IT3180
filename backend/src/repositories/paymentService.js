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

/**
 * Thống kê thu chi theo thời gian (tháng)
 * Trả về dữ liệu cho chart
 */
exports.getIncomeByPeriod = async (startPeriod, endPeriod) => {
  const { data: payments, error } = await supabase
    .from('payments')
    .select('period, amount, paid_at')
    .gte('period', startPeriod)
    .lte('period', endPeriod)
    .order('period');

  if (error) throw error;

  // Group by period
  const periodMap = {};
  (payments || []).forEach(p => {
    const period = p.period;
    if (!periodMap[period]) {
      periodMap[period] = {
        period,
        total_income: 0,
        payment_count: 0
      };
    }
    periodMap[period].total_income += Number(p.amount || 0);
    periodMap[period].payment_count += 1;
  });

  // Get bills for the same periods
  const { data: bills, error: billError } = await supabase
    .from('bills')
    .select('period, electric, water, service, vehicles, pre_debt')
    .gte('period', startPeriod)
    .lte('period', endPeriod);

  if (billError) throw billError;

  // Group bills by period
  (bills || []).forEach(b => {
    const period = b.period;
    if (!periodMap[period]) {
      periodMap[period] = {
        period,
        total_income: 0,
        payment_count: 0
      };
    }
    
    const charges = Number(b.electric || 0) + Number(b.water || 0) + 
                   Number(b.service || 0) + Number(b.vehicles || 0);
    
    if (!periodMap[period].total_charges) {
      periodMap[period].total_charges = 0;
      periodMap[period].total_debt = 0;
      periodMap[period].bill_count = 0;
    }
    
    periodMap[period].total_charges += charges;
    periodMap[period].total_debt += Number(b.pre_debt || 0);
    periodMap[period].bill_count += 1;
  });

  return Object.values(periodMap).sort((a, b) => a.period.localeCompare(b.period));
};

/**
 * Thống kê chi tiết các loại phí
 */
exports.getFeeBreakdown = async (period) => {
  const query = supabase
    .from('bills')
    .select('electric, water, service, vehicles');
  
  if (period) {
    query.eq('period', period);
  }

  const { data: bills, error } = await query;

  if (error) throw error;

  const breakdown = {
    electric: 0,
    water: 0,
    service: 0,
    vehicles: 0,
    total: 0
  };

  (bills || []).forEach(b => {
    breakdown.electric += Number(b.electric || 0);
    breakdown.water += Number(b.water || 0);
    breakdown.service += Number(b.service || 0);
    breakdown.vehicles += Number(b.vehicles || 0);
  });

  breakdown.total = breakdown.electric + breakdown.water + breakdown.service + breakdown.vehicles;

  return breakdown;
};

/**
 * So sánh thu chi giữa các kỳ
 */
exports.comparePeriodsFinancial = async (period1, period2) => {
  const [data1, data2] = await Promise.all([
    exports.getPeriodSummary(period1),
    exports.getPeriodSummary(period2)
  ]);

  return {
    period1: data1,
    period2: data2,
    comparison: {
      income_change: data2.total_income - data1.total_income,
      income_change_percent: data1.total_income > 0 
        ? (((data2.total_income - data1.total_income) / data1.total_income) * 100).toFixed(2) + '%'
        : 'N/A',
      charges_change: data2.total_charges - data1.total_charges,
      debt_change: data2.total_debt - data1.total_debt
    }
  };
};

/**
 * Tổng hợp dữ liệu một kỳ
 */
exports.getPeriodSummary = async (period) => {
  const { data: payments, error: payError } = await supabase
    .from('payments')
    .select('amount')
    .eq('period', period);

  if (payError) throw payError;

  const { data: bills, error: billError } = await supabase
    .from('bills')
    .select('electric, water, service, vehicles, pre_debt')
    .eq('period', period);

  if (billError) throw billError;

  const totalIncome = (payments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
  
  let totalCharges = 0;
  let totalDebt = 0;

  (bills || []).forEach(b => {
    totalCharges += Number(b.electric || 0) + Number(b.water || 0) + 
                   Number(b.service || 0) + Number(b.vehicles || 0);
    totalDebt += Number(b.pre_debt || 0);
  });

  return {
    period,
    total_income: totalIncome,
    total_charges: totalCharges,
    total_debt: totalDebt,
    collection_rate: totalCharges > 0 
      ? ((totalIncome / totalCharges) * 100).toFixed(2) + '%'
      : '0%',
    bill_count: bills?.length || 0,
    payment_count: payments?.length || 0
  };
};

/**
 * Thống kê tỷ lệ thu theo tháng (cho chart)
 */
exports.getCollectionRateByPeriod = async (startPeriod, endPeriod) => {
  const periods = await exports.getIncomeByPeriod(startPeriod, endPeriod);
  
  return periods.map(p => ({
    period: p.period,
    collection_rate: p.total_charges > 0 
      ? ((p.total_income / p.total_charges) * 100).toFixed(2)
      : 0,
    total_income: p.total_income,
    total_charges: p.total_charges || 0
  }));
};