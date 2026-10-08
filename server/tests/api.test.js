const request = require('supertest');
const app = require('../src/index');

describe('API Integration Tests', () => {
  test('GET / returns API info', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Gemini AI Chat & Cost Tracker Backend API');
  });

  test('GET /api/health returns health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('online');
    expect(res.body.services).toBeDefined();
  });

  test('GET /api/models returns Gemini models list', async () => {
    const res = await request(app).get('/api/models');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.models)).toBe(true);
    expect(res.body.models.length).toBeGreaterThan(0);
    
    const flashModel = res.body.models.find(m => m.id === 'gemini-1.5-flash');
    expect(flashModel).toBeDefined();
    expect(flashModel.pricing).toBeDefined();
  });

  test('POST /api/cost/estimate calculates cost correctly', async () => {
    const res = await request(app)
      .post('/api/cost/estimate')
      .send({
        model: 'gemini-1.5-flash',
        promptTokens: 10000,
        candidateTokens: 2000,
        exchangeRate: 35.0
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.calculation.tokens.totalTokens).toBe(12000);
    expect(res.body.calculation.costUSD.totalCost).toBeGreaterThan(0);
  });

  test('GET /api/cost/stats returns user usage metrics', async () => {
    const res = await request(app)
      .get('/api/cost/stats')
      .set('x-user-id', 'test-user-unit');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats).toBeDefined();
    expect(res.body.stats.summary).toBeDefined();
  });

  test('GET /api/chat/sessions returns empty array for new user', async () => {
    const res = await request(app)
      .get('/api/chat/sessions')
      .set('x-user-id', 'new-test-user');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.sessions)).toBe(true);
  });
});
