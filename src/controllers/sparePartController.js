const SparePart = require('../models/SparePart');

exports.updateSparePart = async (req, res, next) => {
  try {
    const { partName, type } = req.body;
    const allowedSpareType = ['ordered', 'required'];
    if (type && !allowedSpareType.includes(type)) {
      return res.status(400).json({ success: false, message: `Invalid type. Allowed values are ${allowedSpareType.join(', ')}` });
    }
    const spare = await SparePart.findByIdAndUpdate(
      req.params.id,
      { partName, type },
      { new: true, runValidators: true }
    );
    if (!spare) return res.status(404).json({ success: false, message: 'Spare part not found' });
    res.json({ success: true, data: spare });
  } catch (err) {
    next(err);
  }
};

exports.deleteSparePart = async (req, res, next) => {
  try {
    const spare = await SparePart.findByIdAndDelete(req.params.id);
    if (!spare) return res.status(404).json({ success: false, message: 'Spare part not found' });
    res.json({ success: true, data: spare });
  } catch (err) {
    next(err);
  }
};
