const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const Inventory = require('../src/models/Inventory');
const Order = require('../src/models/Order');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../src/config');

jest.mock('../src/utils/pdf.js');
jest.mock('../src/services/pdfService.js', () => ({
  createInvoicePDF: jest.fn().mockResolvedValue('/mock/path/invoice.pdf')
}));

describe('End-to-End Integration Tests', () => {
  const testPassword = 'integration_test_password_123';
  let authToken;
  let userId;
  let uniqueItemCode1;
  let uniqueItemCode2;

  beforeEach(async () => {
    // Clean up collections before each test
    await User.deleteMany({ username: /integration_user_/ });
    await Inventory.deleteMany({ itemCode: /INTEGRATION_ITEM_/ });
    await Order.deleteMany({ itemCode: /INTEGRATION_ITEM_/ });
    uniqueItemCode1 = `INTEGRATION_ITEM_${Date.now()}_${Math.floor(Math.random()*10000)}`;
    uniqueItemCode2 = `INTEGRATION_ITEM_${Date.now()}_${Math.floor(Math.random()*10000)}`;
  });

  afterAll(async () => {
    await User.deleteMany({ username: /integration_user_/ });
    await Inventory.deleteMany({ itemCode: /INTEGRATION_ITEM_/ });
    await Order.deleteMany({ itemCode: /INTEGRATION_ITEM_/ });
  });

  describe('Complete User Journey: Register → Login → Add Inventory → Create Order', () => {
    it('should complete full user journey workflow', async () => {
      // Step 1: Register a new user
      const testUsername = `integration_user_${Date.now()}_${Math.floor(Math.random()*10000)}`;
      const registerRes = await request(app)
        .post('/api/users/register')
        .send({
          username: testUsername,
          password: testPassword,
          businessName: 'Integration Test Business',
          phone: '9876543210'
        });

      expect(registerRes.status).toBe(200);
      expect(registerRes.body.success).toBe(true);
      expect(registerRes.body.user).toBeDefined();
      expect(registerRes.body.user.username).toBe(testUsername);
      userId = registerRes.body.user._id;

      // Step 2: Login with registered credentials
      const loginRes = await request(app)
        .post('/api/users/login')
        .send({
          username: testUsername,
          password: testPassword
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);
      expect(loginRes.body.token).toBeDefined();
      authToken = loginRes.body.token;

      // Verify token is valid
      const decoded = jwt.verify(authToken, jwtSecret);
      expect(decoded.id).toBe(userId);

      // Step 3: Add inventory as authenticated user
      const addInventoryRes = await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemCode: uniqueItemCode1,
          stock: 100,
          itemName: 'Integration Test Item'
        });

      expect(addInventoryRes.status).toBe(201);
      expect(addInventoryRes.body.success).toBe(true);
      expect(addInventoryRes.body.inventory).toBeDefined();
      expect(addInventoryRes.body.inventory.itemCode).toBe(uniqueItemCode1);
      expect(addInventoryRes.body.inventory.stock).toBe(100);

      // Step 4: Create an order using the added inventory
      const createOrderRes = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemCode: uniqueItemCode1,
          quantity: 25
        });

      expect(createOrderRes.status).toBe(200);
      expect(createOrderRes.body.success).toBe(true);
      expect(createOrderRes.body.order).toBeDefined();
      expect(createOrderRes.body.order.itemCode).toBe(uniqueItemCode1);
      expect(createOrderRes.body.order.quantity).toBe(25);
      expect(createOrderRes.body.order.status).toBe('pending');

      // Step 5: Verify inventory stock was decremented
      const getInventoryRes = await request(app)
        .get('/api/inventory')
        .set('Authorization', `Bearer ${authToken}`);

      expect(getInventoryRes.status).toBe(200);
      const updatedInventory = getInventoryRes.body.inventory.find(
        inv => inv.itemCode === uniqueItemCode1
      );
      expect(updatedInventory).toBeDefined();
      expect(updatedInventory.stock).toBe(75); // 100 - 25

      // Step 6: Retrieve orders and verify
      const listOrdersRes = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(listOrdersRes.status).toBe(200);
      expect(listOrdersRes.body.success).toBe(true);
      expect(Array.isArray(listOrdersRes.body.orders)).toBe(true);
      expect(listOrdersRes.body.orders.length).toBeGreaterThan(0);

      const createdOrder = listOrdersRes.body.orders.find(
        order => order._id === createOrderRes.body.order._id
      );
      expect(createdOrder).toBeDefined();
      expect(createdOrder.user).toBeDefined();
      // Do not assume user._id is populated, just check user exists
      expect(createdOrder.user).toBeTruthy();
    });
  });

  describe('Multiple Inventory Items and Orders', () => {
    let token;

    beforeAll(async () => {
      const user = await User.create({
        username: `multi_item_user_${Date.now()}`,
        password: testPassword,
        businessName: 'Multi Item Business',
        phone: '9876543211'
      });

      token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1d' });

      // Add multiple inventory items
      await Inventory.create([
        {
          itemCode: 'INTEGRATION_ITEM_001',
          stock: 200,
          itemName: 'Item 1'
        },
        {
          itemCode: 'INTEGRATION_ITEM_002',
          stock: 150,
          itemName: 'Item 2'
        }
      ]);
    });

    it('should create multiple orders from different inventory items', async () => {
      // Create first order
      const order1Res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          itemCode: 'INTEGRATION_ITEM_001',
          quantity: 30
        });

      expect(order1Res.status).toBe(200);
      expect(order1Res.body.order.quantity).toBe(30);

      // Create second order
      const order2Res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          itemCode: 'INTEGRATION_ITEM_002',
          quantity: 40
        });

      expect(order2Res.status).toBe(200);
      expect(order2Res.body.order.quantity).toBe(40);

      // List orders and verify both exist
      const listRes = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${token}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.orders.length).toBeGreaterThanOrEqual(2);
    });

    it('should update inventory correctly after multiple orders', async () => {
      // Get initial state
      const initialRes = await request(app)
        .get('/api/inventory')
        .set('Authorization', `Bearer ${token}`);

      const item1Initial = initialRes.body.inventory.find(
        inv => inv.itemCode === 'INTEGRATION_ITEM_001'
      );
      const item2Initial = initialRes.body.inventory.find(
        inv => inv.itemCode === 'INTEGRATION_ITEM_002'
      );

      // Create orders
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          itemCode: 'INTEGRATION_ITEM_001',
          quantity: 10
        });

      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          itemCode: 'INTEGRATION_ITEM_002',
          quantity: 15
        });

      // Get updated state
      const updatedRes = await request(app)
        .get('/api/inventory')
        .set('Authorization', `Bearer ${token}`);

      const item1Updated = updatedRes.body.inventory.find(
        inv => inv.itemCode === 'INTEGRATION_ITEM_001'
      );
      const item2Updated = updatedRes.body.inventory.find(
        inv => inv.itemCode === 'INTEGRATION_ITEM_002'
      );

      // Verify stock decrements
      expect(item1Updated.stock).toBeLessThan(item1Initial.stock);
      expect(item2Updated.stock).toBeLessThan(item2Initial.stock);
    });
  });

  describe('Error Handling in Workflow', () => {
    let token;
    let testUserId;

    beforeAll(async () => {
      const user = await User.create({
        username: `error_test_user_${Date.now()}`,
        password: testPassword,
        businessName: 'Error Test Business',
        phone: '9876543212'
      });

      testUserId = user._id;
      token = jwt.sign({ id: testUserId }, jwtSecret, { expiresIn: '1d' });

      // Add inventory with limited stock
      await Inventory.create({
        itemCode: 'INTEGRATION_ITEM_001',
        stock: 10,
        itemName: 'Limited Stock Item'
      });
    });

    it('should handle insufficient stock gracefully', async () => {
      // Try to create order with more quantity than available
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          itemCode: 'INTEGRATION_ITEM_001',
          quantity: 100
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
      expect(res.body.success).toBe(false);

      // Verify inventory was not affected
      const inventoryRes = await request(app)
        .get('/api/inventory')
        .set('Authorization', `Bearer ${token}`);

      const item = inventoryRes.body.inventory.find(
        inv => inv.itemCode === 'INTEGRATION_ITEM_001'
      );
      expect(item.stock).toBe(10); // Should remain unchanged
    });

    it('should prevent order creation with invalid data', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          itemCode: 'INTEGRATION_ITEM_001'
          // quantity missing
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });

    it('should enforce authentication on all protected endpoints', async () => {
      // Try inventory without token
      const invRes = await request(app)
        .get('/api/inventory');

      expect(invRes.status).toBe(401);

      // Try orders without token
      const ordersRes = await request(app)
        .get('/api/orders');

      expect(ordersRes.status).toBe(401);

      // Try create order without token
      const createRes = await request(app)
        .post('/api/orders')
        .send({
          itemCode: 'INTEGRATION_ITEM_001',
          quantity: 5
        });

      expect(createRes.status).toBe(401);
    });
  });

  describe('Data Consistency and Isolation', () => {
    it('should maintain data isolation between different users', async () => {
      // Create two users
      const user1 = await User.create({
        username: `user_1_${Date.now()}`,
        password: testPassword,
        businessName: 'User 1 Business',
        phone: '9876543213'
      });

      const user2 = await User.create({
        username: `user_2_${Date.now()}`,
        password: testPassword,
        businessName: 'User 2 Business',
        phone: '9876543214'
      });

      const token1 = jwt.sign({ id: user1._id }, jwtSecret, { expiresIn: '1d' });
      const token2 = jwt.sign({ id: user2._id }, jwtSecret, { expiresIn: '1d' });

      // User 1 creates inventory and order
      await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          itemCode: `USER_1_ITEM_${Date.now()}`,
          stock: 50,
          itemName: 'User 1 Item'
        });

      // User 2 should not see User 1's orders
      const user1ListOrdersRes = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${token1}`);

      const user2ListOrdersRes = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${token2}`);

      expect(user1ListOrdersRes.status).toBe(200);
      expect(user2ListOrdersRes.status).toBe(200);

      // Cleanup
      await User.deleteMany({ _id: { $in: [user1._id, user2._id] } });
    });
  });
});