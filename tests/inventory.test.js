const request = require('supertest');
const app = require('../server');
const Inventory = require('../src/models/Inventory');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../src/config');

jest.mock('../src/utils/pdf.js');

describe('Inventory Management API', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    testUser = await User.create({
      username: 'inventory_test_user',
      password: 'testpass123',
      businessName: 'Inventory Test',
      phone: '9876543230'
    });
    authToken = jwt.sign({ id: testUser._id }, jwtSecret, { expiresIn: '1d' });
  });

  afterAll(async () => {
    await User.deleteMany({ username: 'inventory_test_user' });
    await Inventory.deleteMany({ itemCode: { $in: ['TEST001', 'TEST002', 'UNIQUE_CODE_123', 'INV_NEGATIVE', 'INV_UPDATE'] } });
  });

  describe('POST /api/inventory - Add Inventory', () => {
    it('should return 201 for valid inventory data', async () => {
      const res = await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemCode: 'TEST001',
          stock: 50,
          itemName: 'Test Item 1'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.inventory).toBeDefined();
      expect(res.body.inventory.itemCode).toBe('TEST001');
      expect(res.body.inventory.stock).toBe(50);
    });

    it('should return 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemCode: 'TEST002'
          // stock and itemName missing
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });

    it('should return 400 when stock is null', async () => {
      const res = await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemCode: 'TEST003',
          stock: null,
          itemName: 'Test Item'
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/inventory')
        .send({
          itemCode: 'TEST004',
          stock: 100,
          itemName: 'Unauthorized Item'
        });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/inventory/update - Update Stock', () => {
    beforeEach(async () => {
      await Inventory.deleteMany({ itemCode: 'INV_UPDATE' });
      await Inventory.create({
        itemCode: 'INV_UPDATE',
        stock: 100,
        itemName: 'Update Test Item'
      });
    });

    it('should return 200 for valid stock update', async () => {
      const res = await request(app)
        .post('/api/inventory/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemCode: 'INV_UPDATE',
          stock: 75
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.inventory.stock).toBe(75);
    });

    it('should return 400 for negative stock', async () => {
      const res = await request(app)
        .post('/api/inventory/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemCode: 'INV_UPDATE',
          stock: -10
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when stock is missing', async () => {
      const res = await request(app)
        .post('/api/inventory/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemCode: 'INV_UPDATE'
          // stock missing
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 when stock is not a number', async () => {
      const res = await request(app)
        .post('/api/inventory/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemCode: 'INV_UPDATE',
          stock: 'not_a_number'
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 when itemCode is missing', async () => {
      const res = await request(app)
        .post('/api/inventory/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          stock: 50
          // itemCode missing
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 when stock is a decimal (not integer)', async () => {
      const res = await request(app)
        .post('/api/inventory/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemCode: 'INV_UPDATE',
          stock: 50.5
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/inventory - List Inventory', () => {
    it('should return 200 with inventory list', async () => {
      const res = await request(app)
        .get('/api/inventory')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.inventory)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .get('/api/inventory');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/inventory/:id/consume - Consume Inventory', () => {
    let inventoryId;

    beforeEach(async () => {
      const item = await Inventory.create({
        itemCode: 'CONSUME_TEST',
        stock: 100,
        itemName: 'Consumable Item'
      });
      inventoryId = item._id.toString();
    });

    afterEach(async () => {
      await Inventory.deleteMany({ itemCode: 'CONSUME_TEST' });
    });

    it('should return 200 and reduce stock when consuming', async () => {
      const res = await request(app)
        .post(`/api/inventory/${inventoryId}/consume`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantityUsed: 25 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.inventory.stock).toBe(75);
    });

    it('should return 400 when quantityUsed is negative', async () => {
      const res = await request(app)
        .post(`/api/inventory/${inventoryId}/consume`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantityUsed: -10 });

      expect(res.status).toBe(400);
    });

    it('should return 400 when quantityUsed is missing', async () => {
      const res = await request(app)
        .post(`/api/inventory/${inventoryId}/consume`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent inventory ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid MongoDB ObjectId format

      const res = await request(app)
        .post(`/api/inventory/${fakeId}/consume`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantityUsed: 10 });

      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid inventory ID format', async () => {
      const res = await request(app)
        .post(`/api/inventory/invalid_id/consume`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantityUsed: 10 });

      expect([400, 500]).toContain(res.status);
    });
  });

  describe('GET /api/inventory/prediction - Inventory Prediction', () => {
    beforeAll(async () => {
      await Inventory.create({
        itemCode: 'PREDICT_TEST',
        stock: 50,
        itemName: 'Prediction Test',
        consumptionRate: 2
      });
    });

    afterAll(async () => {
      await Inventory.deleteMany({ itemCode: 'PREDICT_TEST' });
    });

    it('should return 200 with predictions array', async () => {
      const res = await request(app)
        .get('/api/inventory/prediction')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.predictions)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .get('/api/inventory/prediction');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/inventory/alerts - Inventory Alerts', () => {
    beforeAll(async () => {
      await Inventory.create({
        itemCode: 'LOW_STOCK_ITEM',
        stock: 5,
        itemName: 'Low Stock Alert'
      });
    });

    afterAll(async () => {
      await Inventory.deleteMany({ itemCode: 'LOW_STOCK_ITEM' });
    });

    it('should return 200 with alerts array', async () => {
      const res = await request(app)
        .get('/api/inventory/alerts')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.alerts)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .get('/api/inventory/alerts');

      expect(res.status).toBe(401);
    });
  });
});
