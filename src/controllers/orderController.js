const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const mongoose = require('mongoose');
const { createInvoicePDF } = require('../services/pdfService');
const { AppError } = require('../middlewares/errorHandler');

exports.createOrder = async (req, res, next) => {
  // Skip transactions in test mode (MongoDB standalone doesn't support transactions)
  const useTransaction = process.env.NODE_ENV !== 'test';
  
  let session = null;
  if (useTransaction) {
    session = await mongoose.startSession();
    session.startTransaction();
  }
  
  try {
    const { itemCode, quantity } = req.body;
    
    // Validate input
    if (!itemCode || !quantity) {
      if (useTransaction) await session.abortTransaction();
      throw new AppError('Missing required fields', 400);
    }
    
    if (typeof quantity !== 'number' || quantity <= 0) {
      if (useTransaction) await session.abortTransaction();
      throw new AppError('Quantity must be a positive number', 400);
    }
    
    const inventory = await Inventory.findOne({ itemCode }).session(session);
    if (!inventory || inventory.stock < quantity) {
      if (useTransaction) await session.abortTransaction();
      throw new AppError('Insufficient stock', 400);
    }
    
    inventory.stock -= quantity;
    await inventory.save({ session });
    
    const order = new Order({ itemCode, quantity, user: req.user.id });
    await order.save({ session });
    
    // Generate PDF invoice
    const pdfPath = await createInvoicePDF(`Order: ${order._id}\\nItem: ${itemCode}\\nQuantity: ${quantity}`);
    order.invoicePath = pdfPath;
    await order.save();
    
    if (useTransaction) {
      await session.commitTransaction();
    }
    
    res.json({ success: true, message: 'Order created', order });
  } catch (err) {
    if (useTransaction && session) {
      await session.abortTransaction();
    }
    next(err);
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

exports.listOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('user');
    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

