const Service = require('../models/Service');

exports.updateService = async (req, res, next) => {
  try {
    const { machineId, workDetails, engineerName, date } = req.body;
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { machineId, workDetails, engineerName, date },
      { new: true, runValidators: true }
    );
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};
