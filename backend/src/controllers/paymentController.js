const paymentService = require('../repositories/paymentService');
const { getPaginationParams, buildPaginatedResponse } = require('../utils/helper');

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

// Thống kê tài chính chi tiết theo tầng
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

// Danh sách căn hộ đang nợ
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

// Chi tiết tài chính một căn hộ
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

// Tổng quan tài chính toàn tòa
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