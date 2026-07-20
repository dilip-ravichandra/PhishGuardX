import request from 'supertest';
import { createApp } from '../src/app';

describe('GET /api/v1/health', () => {
  const app = createApp();

  it('returns 200 with an ok status payload', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        status: 'ok',
        service: 'backend',
        timestamp: expect.any(String)
      }
    });
  });
});

describe('Unmatched route', () => {
  const app = createApp();

  it('returns a 404 in the standard error envelope', async () => {
    const response = await request(app).get('/api/v1/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('ROUTE_NOT_FOUND');
  });
});
