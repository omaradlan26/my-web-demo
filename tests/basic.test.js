const request = require('supertest');
const app = require('../server');

describe('Basic API', () => {
  test('GET /api/books returns 200 and array', async () => {
    const res = await request(app).get('/api/books');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
