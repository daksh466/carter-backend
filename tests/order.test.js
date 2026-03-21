const request = require('supertest');
const app = require('../server');
const Order = require('../src/models/Order');
const Inventory = require('../src/models/Inventory');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../src/config');

jest.mock('../src/utils/pdf.js');
jest.mock('../src/services/pdfService.js', () => ({
  createInvoicePDF: jest.fn().mockResolvedValue('/mock/path/invoice.pdf')
}));

describe('Order Management API', () => {
  let authToken;
  let testUser;
  let testInventory;

  beforeAll(async () => {
    // Create test user
    testUser = await User.create({
      username: 'order_test_user',
      password: 'testpass123',
      businessName: 'Order Test',
      phone: '9876543210'
    });
    authToken = jwt.sign({ id: testUser._id }, jwtSecret, { expiresIn: '1d' });

    // Create test inventory
    testInventory = await Inventory.create({
      itemCode: 'ORDER_ITEM_001',
      stock: 100,
      itemName: 'Order Test Item'
    });
  });

  afterAll(async () => {
    await User.deleteMany({ username: 'order_test_user' });
    await Order.deleteMany({ itemCode: { $in: ['ORDER_ITEM_001', 'ORDER_LOW_STOCK', 'ORDER_NONEXISTENT'] } });
    await Inventory.deleteMany({ itemCode: { $in: ['ORDER_ITEM_001', 'ORDER_LOW_STOCK', 'ORDER_NONEXISTENT'] } });
  });

  describe('POST /api/orders - Create Order', () => {
    beforeEach(async () => {
      // Reset inventory stock
      await Inventory.updateOne(
        { itemCode: 'ORDER_ITEM_001' },
        { stock: 100 }
      );
    });

    it('should return 200 and create order for valid data with sufficient stock', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemCode: 'ORDER_ITEM_001',
          quantity: 10
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.order).toBeDefined();
      expect(res.body.order.itemCode).toBe('ORDER_ITEM_001');
      expect(res.body.order.quantity).toBe(10);
    });

    it('should return 200 and decrement inventory stock', async () => {
      const initialStock = (await Inventory.findOne({ itemCode: 'ORDER_ITEM_001' })).stock;

      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemCode: 'ORDER_ITEM_001',
          quantity: 5
        });

      const updatedInventory = await Inventory.findOne({ itemCode: 'ORDER_ITEM_001' });
      expect(updatedInventory.stock).toBe(initialStock - 5);
    });

    it('should return 400 when itemCode is missing', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quantity: 10
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });

    it('should return 400 when quantity is missing', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemCode: 'ORDER_ITEM_001'
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });

    it('should return 400 for negative quantity', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemCode: 'ORDER_ITEM_001',
          quantity: -5
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });

    it('should return 400 for zero quantity', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemCode: 'ORDER_ITEM_001',
          quantity: 0
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });

    it('should return error for insufficient stock', async () => {
      // Create inventory with low stock
      await Inventory.create({
        itemCode: 'ORDER_LOW_STOCK',
        stock: 5,
        itemName: 'Low Stock Item'
      });

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemCode: 'ORDER_LOW_STOCK',
          quantity: 10
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
      expect(res.body.success).toBe(false);

      await Inventory.deleteMany({ itemCode: 'ORDER_LOW_STOCK' });
    });

    it('should return error for non-existent item', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemCode: 'NONEXISTENT_ITEM',
          quantity: 5
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 without authentication token', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          itemCode: 'ORDER_ITEM_001',
          quantity: 10
        });

      expect(res.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', 'Bearer invalid_token')
        .send({
          itemCode: 'ORDER_ITEM_001',
          quantity: 10
        });

      expect(res.status).toBe(401);
    });

    it('should associate order with authenticated user', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemCode: 'ORDER_ITEM_001',
          quantity: 3
        });

      expect(res.status).toBe(200);
      expect(res.body.order.user).toBeDefined();

      const createdOrder = await Order.findById(res.body.order._id).populate('user');
      expect(createdOrder.user._id.toString()).toBe(testUser._id.toString());
    });

    it('should set default status as pending', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemCode: 'ORDER_ITEM_001',
          quantity: 2
        });

      expect(res.status).toBe(200);
      expect(res.body.order.status).toBe('pending');
    });
  });

  describe('GET /api/orders - List Orders', () => {
    beforeEach(async () => {
      // Create test orders for the user
      await Order.deleteMany({ user: testUser._id });
      await Order.create([
        {
          itemCode: 'ORDER_ITEM_001',
          quantity: 5,
          user: testUser._id,
          status: 'pending'
        },
        {
          itemCode: 'ORDER_ITEM_001',
          quantity: 10,
          user: testUser._id,
          status: 'pending'
        }
      ]);
    });

    it('should return 200 with orders list', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.orders)).toBe(true);
    });

    it('should return user-specific orders only', async () => {
      // Create another user and their order
      const anotherUser = await User.create({
        username: 'another_order_user',
        password: 'testpass123',
        businessName: 'Another Business',
        phone: '9876543211'
      });

      await Order.create({
        itemCode: 'ORDER_ITEM_001',
        quantity: 20,
        user: anotherUser._id,
        status: 'pending'
      });

      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.orders.length).toBe(2); // Only testUser's orders
      res.body.orders.forEach(order => {
        expect(order.user._id).toBe(testUser._id.toString());
      });

      // Cleanup
      await User.deleteMany({ username: 'another_order_user' });
    });

    it('should include user details in orders', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.orders.length).toBeGreaterThan(0);
      res.body.orders.forEach(order => {
        expect(order.user).toBeDefined();
        expect(order.user.username).toBeDefined();
      });
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .get('/api/orders');

      expect(res.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', 'Bearer invalid_token');

      expect(res.status).toBe(401);
    });

    it('should return empty array for user with no orders', async () => {
      // Create a new user with no orders
      const newUser = await User.create({
        username: 'no_orders_user',
        password: 'testpass123',
        businessName: 'No Orders',
        phone: '9876543212'
      });

      const newUserToken = jwt.sign({ id: newUser._id }, jwtSecret, { expiresIn: '1d' });

      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${newUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.orders)).toBe(true);
      expect(res.body.orders.length).toBe(0);

      // Cleanup
      await User.deleteMany({ username: 'no_orders_user' });
    });
  });

  describe('Order Transaction Integrity', () => {
    beforeEach(async () => {
      // Reset inventory stock
      await Inventory.updateOne(
        { itemCode: 'ORDER_ITEM_001' },
        { stock: 50 }
      );
    });

    it('should not create order if transaction fails (no inventory deduction)', async () => {
      // This test validates transaction rollback behavior
      // If stock check fails, order should not be created and stock should not change

      const initialStock = (await Inventory.findOne({ itemCode: 'ORDER_ITEM_001' })).stock;
      const initialOrderCount = await Order.countDocuments();

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemCode: 'ORDER_ITEM_001',
          quantity: 1000 // More than available
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);

      // Stock should remain unchanged
      const updatedStock = (await Inventory.findOne({ itemCode: 'ORDER_ITEM_001' })).stock;
      expect(updatedStock).toBe(initialStock);

      // Order should not be created
      const updatedOrderCount = await Order.countDocuments();
      expect(updatedOrderCount).toBe(initialOrderCount);
    });
  });
});
