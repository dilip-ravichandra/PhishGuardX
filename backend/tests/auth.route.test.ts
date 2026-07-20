import request from 'supertest';
import { createApp } from '../src/app';
import { authService } from '../src/services/auth.service';
import { userRepository } from '../src/repositories/user.repository';
import { jwtService } from '../src/services/jwt.service';
import { ConflictError, UnauthorizedError } from '../src/utils/errors';

jest.mock('../src/services/auth.service');
jest.mock('../src/repositories/user.repository');

const mockedAuthService = authService as jest.Mocked<typeof authService>;
const mockedUserRepository = userRepository as jest.Mocked<typeof userRepository>;

const app = createApp();

const fakeUser = { id: 'user-1', name: 'Ada Lovelace', email: 'ada@example.com', role: 'user' as const };

describe('POST /api/v1/auth/register', () => {
  it('returns 201 and sets a refresh token cookie on success', async () => {
    mockedAuthService.register.mockResolvedValue({
      user: fakeUser,
      accessToken: 'access-token-value',
      refreshToken: 'refresh-token-value'
    });

    const response = await request(app).post('/api/v1/auth/register').send({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'Password1',
      confirmPassword: 'Password1'
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      success: true,
      data: { user: fakeUser, accessToken: 'access-token-value' }
    });
    expect(response.headers['set-cookie']?.[0]).toMatch(/refreshToken=refresh-token-value/);
    expect(response.headers['set-cookie']?.[0]).toMatch(/HttpOnly/);
  });

  it('returns 400 when passwords do not match', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'Password1',
      confirmPassword: 'Different1'
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(mockedAuthService.register).not.toHaveBeenCalled();
  });

  it('returns 400 for a weak password', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'short',
      confirmPassword: 'short'
    });

    expect(response.status).toBe(400);
  });

  it('returns 409 when the service reports a duplicate email', async () => {
    mockedAuthService.register.mockRejectedValue(new ConflictError('An account with this email already exists'));

    const response = await request(app).post('/api/v1/auth/register').send({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'Password1',
      confirmPassword: 'Password1'
    });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });
});

describe('POST /api/v1/auth/login', () => {
  it('returns 200 with user and access token on valid credentials', async () => {
    mockedAuthService.login.mockResolvedValue({
      user: fakeUser,
      accessToken: 'access-token-value',
      refreshToken: 'refresh-token-value'
    });

    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'ada@example.com',
      password: 'Password1'
    });

    expect(response.status).toBe(200);
    expect(response.body.data.user).toEqual(fakeUser);
  });

  it('returns 401 on invalid credentials', async () => {
    mockedAuthService.login.mockRejectedValue(new UnauthorizedError('Invalid email or password'));

    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'ada@example.com',
      password: 'WrongPassword1'
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});

describe('GET /api/v1/auth/me', () => {
  it('returns 401 when no Authorization header is present', async () => {
    const response = await request(app).get('/api/v1/auth/me');
    expect(response.status).toBe(401);
  });

  it('returns 200 with the current user for a valid access token', async () => {
    const token = jwtService.generateAccessToken({ sub: 'user-1', role: 'user' });
    mockedAuthService.getCurrentUser.mockResolvedValue(fakeUser);

    const response = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.user).toEqual(fakeUser);
  });
});

describe('GET /api/v1/auth/admin/user-count', () => {
  it('returns 401 with no token', async () => {
    const response = await request(app).get('/api/v1/auth/admin/user-count');
    expect(response.status).toBe(401);
  });

  it('returns 403 for a non-admin user', async () => {
    const token = jwtService.generateAccessToken({ sub: 'user-1', role: 'user' });
    const response = await request(app).get('/api/v1/auth/admin/user-count').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(403);
  });

  it('returns 200 with a count for an admin user', async () => {
    const token = jwtService.generateAccessToken({ sub: 'admin-1', role: 'admin' });
    mockedUserRepository.countAll.mockResolvedValue(42);

    const response = await request(app).get('/api/v1/auth/admin/user-count').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.totalUsers).toBe(42);
  });
});

describe('POST /api/v1/auth/refresh', () => {
  it('returns 401 when no refresh cookie is present', async () => {
    const response = await request(app).post('/api/v1/auth/refresh');
    expect(response.status).toBe(401);
  });

  it('returns 200 and rotates the cookie on a valid refresh token', async () => {
    mockedAuthService.refresh.mockResolvedValue({
      user: fakeUser,
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token'
    });

    const response = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', ['refreshToken=old-refresh-token']);

    expect(response.status).toBe(200);
    expect(response.body.data.accessToken).toBe('new-access-token');
    expect(response.headers['set-cookie']?.[0]).toMatch(/refreshToken=new-refresh-token/);
  });
});

describe('POST /api/v1/auth/logout', () => {
  it('clears the cookie and returns 200 even with no prior session', async () => {
    const response = await request(app).post('/api/v1/auth/logout');
    expect(response.status).toBe(200);
    expect(response.body.data.loggedOut).toBe(true);
  });
});

describe('GET /api/v1/auth/google', () => {
  it('returns 501 Not Implemented (scaffolded, per FR-003)', async () => {
    const response = await request(app).get('/api/v1/auth/google');
    expect(response.status).toBe(501);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('NOT_IMPLEMENTED');
  });
});
