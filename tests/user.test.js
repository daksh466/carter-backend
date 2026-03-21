const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../src/config');
const bcrypt = require('bcrypt');

jest.mock('../src/utils/pdf.js');

describe('User Authentication API', () => {
  let testUser;
  let testUserId;

  afterEach(async () => {
    await User.deleteMany({ username: { $in: ['testlogin', 'newuser', 'duplicateuser', 'test_concurrent', 'hashtest', 'protectedtest'] } });
  });

  describe('POST /api/users/register - User Registration', () => {
    it('should return 200 and create user for valid registration data', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          username: 'newuser',
          password: 'securepass123',
          businessName: 'Test Business',
          phone: '9876543210'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.username).toBe('newuser');
      expect(res.body.user.businessName).toBe('Test Business');
    });

    it('should return 400 when username is missing', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          password: 'securepass123',
          businessName: 'Test Business',
          phone: '9876543210'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when password is missing', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          username: 'testuser',
          businessName: 'Test Business',
          phone: '9876543210'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when businessName is missing', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          username: 'testuser',
          password: 'securepass123',
          phone: '9876543210'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when phone is missing', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          username: 'testuser',
          password: 'securepass123',
          businessName: 'Test Business'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for duplicate username', async () => {
      // Create first user
      await User.create({
        username: 'duplicateuser',
        password: 'pass123',
        businessName: 'Business 1',
        phone: '9876543210'
      });

      // Try to create duplicate
      const res = await request(app)
        .post('/api/users/register')
        .send({
          username: 'duplicateuser',
          password: 'pass456',
          businessName: 'Business 2',
          phone: '9876543211'
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });

    it('should return 400 for empty username', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          username: '',
          password: 'securepass123',
          businessName: 'Test Business',
          phone: '9876543210'
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 for null username', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          username: null,
          password: 'securepass123',
          businessName: 'Test Business',
          phone: '9876543210'
        });

      expect(res.status).toBe(400);
    });

    it('should hash password before storing', async () => {
      const plainPassword = 'myplainpassword123';
      const res = await request(app)
        .post('/api/users/register')
        .send({
          username: 'hashtest',
          password: plainPassword,
          businessName: 'Hash Test',
          phone: '9876543210'
        });

      expect(res.status).toBe(200);

      const user = await User.findOne({ username: 'hashtest' });
      expect(user).toBeDefined();
      expect(user.password).not.toBe(plainPassword);
      
      const isPasswordValid = await bcrypt.compare(plainPassword, user.password);
      expect(isPasswordValid).toBe(true);
    });
  });

  describe('POST /api/users/login - User Login', () => {
    beforeEach(async () => {
      // Create test user
      testUser = await User.create({
        username: 'testlogin',
        password: 'password123',
        businessName: 'Login Test',
        phone: '9876543210'
      });
    });

    it('should return 200 and token for valid credentials', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          username: 'testlogin',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(typeof res.body.token).toBe('string');
      expect(res.body.token.length).toBeGreaterThan(0);
    });

    it('should return valid JWT token', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          username: 'testlogin',
          password: 'password123'
        });

      expect(res.status).toBe(200);

      const decoded = jwt.verify(res.body.token, jwtSecret);
      expect(decoded.id).toBeDefined();
      expect(decoded.id).toBe(testUser._id.toString());
    });

    it('should return 401 for wrong password', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          username: 'testlogin',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.token).toBeUndefined();
    });

    it('should return 401 for non-existent user', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          username: 'nonexistentuser',
          password: 'anypassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when username is missing', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when password is missing', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          username: 'testlogin'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for empty username', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          username: '',
          password: 'password123'
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 for empty password', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          username: 'testlogin',
          password: ''
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 for null username', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          username: null,
          password: 'password123'
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 for null password', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          username: 'testlogin',
          password: null
        });

      expect(res.status).toBe(400);
    });

    it('should not expose password in response', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          username: 'testlogin',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body.password).toBeUndefined();
      expect(res.body.user?.password).toBeUndefined();
    });

    it('should return 400 for empty request body', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({});

      expect(res.status).toBe(400);
    });

    it('should be case-sensitive for username', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          username: 'TESTLOGIN', // Different case
          password: 'password123'
        });

      expect([401, 400]).toContain(res.status);
    });
  });

  describe('Protected Routes with Authentication', () => {
    let validToken;
    let testUserId;

    beforeEach(async () => {
      const user = await User.create({
        username: 'protectedtest',
        password: 'password123',
        businessName: 'Protected Test',
        phone: '9876543210'
      });
      testUserId = user._id;
      validToken = jwt.sign({ id: testUserId }, jwtSecret, { expiresIn: '1d' });
    });

    it('should allow access with valid token', async () => {
      const res = await request(app)
        .get('/api/health')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
    });

    it('should return 401 without token on protected route', async () => {
      const res = await request(app)
        .get('/api/inventory')
        .set('Authorization', `Bearer `); // Empty token

      expect(res.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/inventory')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(res.status).toBe(401);
    });

    it('should handle malformed authorization header', async () => {
      const res = await request(app)
        .get('/api/inventory')
        .set('Authorization', 'InvalidHeaderFormat');

      expect(res.status).toBe(401);
    });
  });
});
