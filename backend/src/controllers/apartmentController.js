const apartmentService = require('../repositories/apartmentService');
const { getPaginationParams, buildPaginatedResponse } = require('../utils/helper');

exports.getAll = async (req, res) => {
  try {
    const { page, page_size, offset, limit } = getPaginationParams(req.query);

    const { data, total } = await apartmentService.getAllApartmentsPaginated(offset, limit);

    const result = buildPaginatedResponse(data, total, page, page_size);

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách hộ dân thành công',
      result,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.search = async (req, res) => {
  try {
    const { q } = req.query;
    const { page, page_size, offset, limit } = getPaginationParams(req.query);

    const { data, total } = await apartmentService.searchApartmentsPaginated(q, offset, limit);

    const result = buildPaginatedResponse(data, total, page, page_size);

    res.status(200).json({
      success: true,
      message: q ? `Tìm thấy kết quả cho "${q}"` : 'Lấy danh sách hộ dân thành công',
      result,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { apt_id } = req.params;
    const data = await apartmentService.getApartmentById(apt_id);

    res.status(200).json({
      success: true,
      message: 'Lấy thông tin căn hộ thành công',
      data,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await apartmentService.createApartment(req.body);
    res.status(201).json({
      success: true,
      message: 'Thêm hộ dân thành công',
      data,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { apt_id } = req.params;
    const data = await apartmentService.updateApartment(apt_id, req.body);
    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin hộ dân thành công',
      data,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { apt_id } = req.params;
    await apartmentService.deleteApartment(apt_id);
    res.status(200).json({
      success: true,
      message: 'Xóa hộ dân thành công',
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};