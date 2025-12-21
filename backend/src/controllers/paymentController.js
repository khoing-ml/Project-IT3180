const paymentService = require('../repositories/paymentService');
const { getPaginationParams, buildPaginatedResponse } = require('../utils/helper');

// Thống kê tổng đã thu của từng căn hộ (phân trang + sắp xếp giảm dần)
exports.getIncomeByApartment = async (req, res) => {
  try {
    const { page, page_size, offset, limit } = getPaginationParams(req.query);

    const { data, total } = await paymentService.getIncomeByApartmentPaginated(offset, limit);

    const result = buildPaginatedResponse(data, total, page, page_size);

    res.status(200).json({
      success: true,
      message: 'Thống kê tổng tiền đã thu theo từng căn hộ',
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
      message: 'Thống kê tổng tiền đã thu theo tầng',
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
      message: 'Thống kê tài chính chi tiết theo tầng (dựa trên hóa đơn hiện tại)',
      data,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Danh sách căn hộ đang nợ (pre_debt > 0)
exports.getApartmentsInDebt = async (req, res) => {
  try {
    const { page, page_size, offset, limit } = getPaginationParams(req.query);

    const { data, total } = await paymentService.getApartmentsInDebt(offset, limit);

    const result = buildPaginatedResponse(data, total, page, page_size);

    res.status(200).json({
      success: true,
      message: 'Danh sách các căn hộ đang có nợ (dựa trên pre_debt hiện tại)',
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
      message: `Thống kê tài chính chi tiết căn hộ ${apt_id}`,
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
      message: 'Thống kê tài chính tổng quan toàn tòa nhà',
      data,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};