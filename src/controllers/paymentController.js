const Payment = require('../models/Payment');

exports.updatePayment = async (req, res, next) => {
  try {
    const { amount, paymentDate, paymentBy, supervisedBy } = req.body;
    const allowedPaymentBy = ['cash', 'online', 'dealer'];
    if (paymentBy && !allowedPaymentBy.includes(paymentBy)) {
      return res.status(400).json({ success: false, message: `Invalid paymentBy. Allowed values are ${allowedPaymentBy.join(', ')}` });
    }
    if (amount !== undefined && amount < 0) {
      return res.status(400).json({ success: false, message: 'Amount cannot be negative' });
    }
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { amount, paymentDate, paymentBy, supervisedBy },
      { new: true, runValidators: true }
    );
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    res.json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

exports.deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    res.json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};
