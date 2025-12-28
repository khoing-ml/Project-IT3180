const residentService = require('../repositories/residentService');

exports.list = async (req, res) => {
  try {
    const { apt_id } = req.params;
    if (!apt_id) throw new Error('Missing apt_id');
    const data = await residentService.listByApartment(apt_id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// List all residents (no filter)
exports.listAll = async (req, res) => {
  try {
    const data = await residentService.listAll();
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = req.body;
    const data = await residentService.createResident(payload);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_owner_id } = req.body || {};
    if (!id) throw new Error('Missing resident id');
    await residentService.deleteResident(id, { new_owner_id });
    res.status(200).json({ success: true, message: 'Resident deleted' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
