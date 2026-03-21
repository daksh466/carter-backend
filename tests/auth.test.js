const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../src/config');

jest.mock('../src/utils/pdf.js');

describe('Authentication & Authorization', () => {
  describe('User Login API', () => {
    let testUser;

    beforeAll(async () => {
      // Create a test user for login tests
      testUser = await User.create({
        username: 'authtest_user',
        password: 'correctpassword',
        businessName: 'Auth Test Business',
        phone: '9876543210'
      });
    });

    afterAll(async () => {
      await User.deleteMany({ username: 'authtest_user' });
    });

    // Valid Login
    it('POST /api/users/login - should return 200 with token for valid credentials', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ username: 'authtest_user', password: 'correctpassword' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(typeof res.body.token).toBe('string');
    });

    // Invalid Password
    it('POST /api/users/login - should return 401 for wrong password', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ username: 'authtest_user', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid credentials');
    });

    // Non-existent User
    it('POST /api/users/login - should return 401 for non-existent user', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ username: 'nonexistent_user', password: 'anypassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    // Missing Username
    it('POST /api/users/login - should return 400 when username is missing', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ password: 'somepassword' });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });

    // Missing Password
    it('POST /api/users/login - should return 400 when password is missing', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ username: 'authtest_user' });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });

    // Empty Body
    it('POST /api/users/login - should return 400 for empty body', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({});

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });
  });

  describe('Protected Routes - Authentication Middleware', () => {
    let validToken;
    let testUser;

    beforeAll(async () => {
      testUser = await User.create({
        username: 'protected_route_user',
        password: 'password123',
        businessName: 'Protected Test',
        phone: '9876543211'
      });

      validToken = jwt.sign({ id: testUser._id }, jwtSecret, { expiresIn: '1d' });
    });

    afterAll(async () => {
      await User.deleteMany({ username: 'protected_route_user' });
    });

    // Valid Token
    it('GET /api/inventory - should return 200 with valid token', async () => {
      const res = await request(app)
        .get('/api/inventory')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
    });

    // No Token
    it('GET /api/inventory - should return 401 without token', async () => {
      const res = await request(app)
        .get('/api/inventory');

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('No token');
    });

    // Invalid Token
    it('GET /api/inventory - should return 403 with invalid token', async () => {
      const res = await request(app)
        .get('/api/inventory')
        .set('Authorization', 'Bearer invalid_token_12345');

      expect(res.status).toBe(403);
    });

    // Malformed Authorization Header
    it('GET /api/inventory - should return 401 with malformed auth header', async () => {
      const res = await request(app)
        .get('/api/inventory')
        .set('Authorization', 'InvalidHeader');

      expect(res.status).toBe(401);
    });

    // Expired Token (simulated)
    it('GET /api/inventory - should handle token-related errors gracefully', async () => {
      const expiredToken = jwt.sign({ id: testUser._id }, jwtSecret, { expiresIn: '0s' });
      
      // Wait a moment to ensure token is expired
      await new Promise(resolve => setTimeout(resolve, 100));

      const res = await request(app)
        .get('/api/inventory')
        .set('Authorization', `Bearer ${expiredToken}`);

      // Should either be 403 (forbidden) or 401 (unauthorized)
      expect([401, 403]).toContain(res.status);
    });
  });

  describe('User Registration API', () => {
    afterEach(async () => {
      await User.deleteMany({ username: { $in: ['newuser123', 'testuser_reg'] } });
    });

    // Valid Registration
    it('POST /api/users/register - should return 200 with new user for valid data', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          username: 'newuser123',
          password: 'securepass123',
          businessName: 'New Business',
          phone: '9876543222'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
    });

    // Duplicate Username
    it('POST /api/users/register - should return error for duplicate username', async () => {
      await User.create({
        username: 'testuser_reg',
        password: 'password123',
        businessName: 'Existing',
        phone: '1234567890'
      });

      const res = await request(app)
        .post('/api/users/register')
        .send({
          username: 'testuser_reg',
          password: 'anotherpass',
          businessName: 'Duplicate',
          phone: '1111111111'
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    // Missing Username
    it('POST /api/users/register - should return 400 when username is missing', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          password: 'securepass123',
          businessName: 'Business',
          phone: '9876543223'
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    // Missing Password
    it('POST /api/users/register - should return 400 when password is missing', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          username: 'newuser456',
          businessName: 'Business',
          phone: '9876543224'
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });
});
