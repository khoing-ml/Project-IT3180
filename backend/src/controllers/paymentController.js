const paymentService = require('../repositories/paymentService');
const { getPaginationParams, buildPaginatedResponse } = require('../utils/helper');
const { supabaseAdmin } = require('../config/supabase');

// Helper function to create notifications
const createNotification = async (userId, type, title, message, link = null, metadata = null) => {
  try {
    await supabaseAdmin.from('notifications').insert({
      user_id: userId,
      type,
      title,
      message,
      link,
      metadata,
      read: false,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    // Don't throw error - notifications shouldn't break main functionality
  }
};

// Helper function to get apartment owner's user ID
const getApartmentOwnerUserId = async (apt_id) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('apartments')
      .select('owner_id')
      .eq('id', apt_id)
      .single();

    if (error) throw error;
    return data?.owner_id;
  } catch (error) {
    console.error('Error fetching apartment owner:', error);
    return null;
  }
};

// Lập hóa đơn tháng 
exports.createBill = async (req, res) => {
  try {
    const data = await paymentService.createMonthlyBill(req.body);
    
    // Create notifications for apartment owner about new bill
    if (data?.apt_id) {
      const ownerId = await getApartmentOwnerUserId(data.apt_id);
      if (ownerId) {
        await createNotification(
          ownerId,
          'warning',
          'Hóa đơn mới',
          `Hóa đơn tháng ${data.period || 'này'} của căn hộ ${data.apt_id} đã được tạo`,
          '/payments',
          { apt_id: data.apt_id, period: data.period, total: data.total }
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'Lập hóa đơn thành công',
      data,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Thống kê tổng đã thu của từng căn hộ (phân trang)
exports.getIncomeByApartment = async (req, res) => {
  try {
    const { page, page_size, offset, limit } = getPaginationParams(req.query);

    const { data, total } = await paymentService.getIncomeByApartmentPaginated(offset, limit);

    const result = buildPaginatedResponse(data, total, page, page_size);

    res.status(200).json({
      success: true,
      message: 'Thống kê tổng đã thu theo căn hộ',
      result,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Thống kê đã thu theo tầng
exports.getIncomeByFloor = async (req, res) => {
  try {
    const data = await paymentService.getIncomeByFloor();
    res.status(200).json({
      success: true,
      message: 'Thống kê tổng đã thu theo tầng',
      data,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Thống kê tài chính đầy đủ theo tầng (đã thu + phải thu + nợ hiện tại + tỷ lệ thu)
exports.getFinancialByFloor = async (req, res) => {
  try {
    const data = await paymentService.getFinancialByFloor();
    res.status(200).json({
      success: true,
      message: 'Thống kê tài chính chi tiết theo tầng',
      data,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Danh sách các căn hộ đang nợ (phân trang)
exports.getApartmentsInDebt = async (req, res) => {
  try {
    const { page, page_size, offset, limit } = getPaginationParams(req.query);

    const { data, total } = await paymentService.getApartmentsInDebt(offset, limit);

    const result = buildPaginatedResponse(data, total, page, page_size);

    res.status(200).json({
      success: true,
      message: 'Danh sách các căn hộ đang nợ',
      result,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Chi tiết tài chính một căn hộ cụ thể
exports.getApartmentFinancialSummary = async (req, res) => {
  try {
    const { apt_id } = req.params;
    const data = await paymentService.getApartmentFinancialSummary(apt_id);

    res.status(200).json({
      success: true,
      message: 'Thống kê tài chính chi tiết của căn hộ',
      data,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Tổng quan tài chính toàn tòa nhà
exports.getBuildingFinancialSummary = async (req, res) => {
  try {
    const data = await paymentService.getBuildingFinancialSummary();

    res.status(200).json({
      success: true,
      message: 'Thống kê tài chính tổng quan tòa nhà',
      data,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};