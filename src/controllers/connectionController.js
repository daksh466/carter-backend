const Connection = require('../models/Connection');
const Machine = require('../models/Machine');
const Payment = require('../models/Payment');
const SparePart = require('../models/SparePart');
const Service = require('../models/Service');

exports.createConnection = async (req, res, next) => {
  try {
    const { businessName, firstName, lastName, phone, email, state, category } = req.body;
    
    const connection = new Connection({
      businessName,
      firstName,
      lastName,
      phone,
      email,
      state,
      category
    });
    
    await connection.save();
    res.status(201).json({ success: true, message: 'Connection created', connection });
  } catch (error) {
    next(error);
  }
};

exports.listConnections = async (req, res, next) => {
  try {
    const connections = await Connection.find();
    res.json({ success: true, connections });
  } catch (error) {
    next(error);
  }
};

exports.getCustomerDetails = async (req, res, next) => {
  try {
    const customerId = req.params.id;
    const customer = await Connection.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    // Machines
    const machines = await Machine.find({ customerId });
    // Payments
    const payments = await Payment.find({ customerId });
    // Spare Parts
    const spareOrdered = await SparePart.find({ customerId, type: "ordered" });
    const spareRequired = await SparePart.find({ customerId, type: "required" });
    // Service History
    const serviceHistory = await Service.find({ customerId }).populate("machineId", "machineName machineId");

    // Computed fields
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalPending = customer.amountPending || 0;

    return res.status(200).json({
      success: true,
      customer: {
        _id: customer._id,
        businessName: customer.businessName,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        email: customer.email,
        state: customer.state,
        category: customer.category,
        connectedDate: customer.connectedDate,
        amountPending: customer.amountPending,
        amountPaid: customer.amountPaid,
        totalPaid,
        totalPending,
      },
      machines,
      payments,
      spareParts: {
        ordered: spareOrdered,
        required: spareRequired,
      },
      serviceHistory,
    });
  } catch (error) {
    next(error);
  }
};

