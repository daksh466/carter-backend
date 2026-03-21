const Machine = require('../models/Machine');

exports.updateMachine = async (req, res, next) => {
  try {
    const { machineName, machineId, warrantyStatus, purchaseDate } = req.body;
    const allowedWarranty = ['active', 'expired'];
    if (warrantyStatus && !allowedWarranty.includes(warrantyStatus)) {
      return res.status(400).json({ success: false, message: `Invalid warrantyStatus. Allowed values are ${allowedWarranty.join(', ')}` });
    }
    const machine = await Machine.findByIdAndUpdate(
      req.params.id,
      { machineName, machineId, warrantyStatus, purchaseDate },
      { new: true, runValidators: true }
    );
    if (!machine) return res.status(404).json({ success: false, message: 'Machine not found' });
    res.json({ success: true, data: machine });
  } catch (err) {
    next(err);
  }
};

exports.deleteMachine = async (req, res, next) => {
  try {
    const machine = await Machine.findByIdAndDelete(req.params.id);
    if (!machine) return res.status(404).json({ success: false, message: 'Machine not found' });
    res.json({ success: true, data: machine });
  } catch (err) {
    next(err);
  }
};
