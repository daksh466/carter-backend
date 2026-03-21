const Inventory = require('../models/Inventory');
const Joi = require('joi');
const { AppError } = require('../middlewares/errorHandler');

function isValidObjectId(id) {
  return /^[a-fA-F0-9]{24}$/.test(id);
}

// Validation schemas
const updateStockSchema = Joi.object({
  itemCode: Joi.string().required(),
  stock: Joi.number().integer().min(0).required()
});

const addInventorySchema = Joi.object({
  itemName: Joi.string().required(),
  stockQuantity: Joi.number().min(0).required(),
  itemCode: Joi.string().required()
});

const consumeInventorySchema = Joi.object({
  quantityUsed: Joi.number().min(1).required()
});

exports.updateStock = async (req, res, next) => {
  const { error } = updateStockSchema.validate(req.body);
  if (error) {
    throw new AppError(`Validation error: ${error.details[0].message}`, 400);
  }
  try {
    const { itemCode, stock } = req.body;
    const inventory = await Inventory.findOneAndUpdate(
      { itemCode },
      { stock, updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    res.json({ success: true, message: 'Stock updated', inventory });
  } catch (err) {
    next(err);
  }
};

exports.listInventory = async (req, res, next) => {
  try {
    const inventory = await Inventory.find({});
    res.json({ success: true, inventory });
  } catch (err) {
    next(err);
  }
};

exports.addInventory = async (req, res, next) => {
  const { error } = addInventorySchema.validate(req.body);
  if (error) {
    throw new AppError(`Validation error: ${error.details[0].message}`, 400);
  }
  try {
    const { itemCode, stockQuantity, itemName } = req.body;
    const inventory = new Inventory({ itemCode, stock: stockQuantity, itemName });
    await inventory.save();
    res.status(201).json({ success: true, message: 'Inventory added', inventory });
  } catch (err) {
    next(err);
  }
};

exports.consumeInventory = async (req, res, next) => {
  // Validate ObjectId
  if (!isValidObjectId(req.params.id)) {
    throw new AppError('Invalid inventory ID format', 400);
  }
  // Validate body
  const { error } = consumeInventorySchema.validate(req.body);
  if (error) {
    throw new AppError(`Validation error: ${error.details[0].message}`, 400);
  }
  try {
    const { id } = req.params;
    const { quantityUsed } = req.body;
    const inventory = await Inventory.findByIdAndUpdate(
      id,
      { $inc: { stock: -quantityUsed } },
      { new: true }
    );
    if (!inventory) {
      throw new AppError('Inventory not found', 404);
    }
    res.json({ success: true, message: 'Inventory consumed', inventory });
  } catch (err) {
    next(err);
  }
};

exports.predictInventory = async (req, res, next) => {
  try {
    const inventory = await Inventory.find({});
    const predictions = inventory.map(item => ({
      itemCode: item.itemCode,
      daysLeft: Math.ceil(item.stock / (item.consumptionRate || 1))
    }));
    res.json({ success: true, predictions });
  } catch (err) {
    next(err);
  }
};

exports.inventoryAlerts = async (req, res, next) => {
  try {
    const inventory = await Inventory.find({ stock: { $lt: 10 } });
    res.json({ success: true, alerts: inventory });
  } catch (err) {
    next(err);
  }
};

