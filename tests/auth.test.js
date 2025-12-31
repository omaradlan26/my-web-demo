const request = require('supertest');
const app = require('../server');

describe('Auth endpoints', () => {
  const name = `testuser_${Date.now()}`;
  let token;

  test('register new user', async () => {
    const res = await request(app).post('/api/auth/register').send({ username: name, password: 'pass1234' });
    expect(res.statusCode).toBe(201);
    expect(res.body.username).toBe(name);
  });

  test('login with new user', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: name, password: 'pass1234' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeTruthy();
    token = res.body.token;
  });

  test('access protected /api/me', async () => {
    const res = await request(app).get('/api/me').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe(name);
  });
});
