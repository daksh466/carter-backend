const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const Connection = require('../src/models/Connection');

describe('Connection Model', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carter-test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  test('Connection schema validation - lastTalkSummary maxlength', async () => {
    const validConnection = {
      businessName: 'Test Business',
      firstName: 'John',
      phone: '1234567890',
      category: 'customer',
      lastTalkSummary: 'A'.repeat(500) // exactly maxlength
    };

    const connection = new Connection(validConnection);
    const error = connection.validateSync();
    expect(error).toBeUndefined();
  });
});
