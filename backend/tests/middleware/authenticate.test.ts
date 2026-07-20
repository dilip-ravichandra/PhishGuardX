import type { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../src/middleware/authenticate';
import { jwtService } from '../../src/services/jwt.service';

function mockRes(): Response {
  return {} as Response;
}

describe('authenticate middleware', () => {
  it('calls next with an UnauthorizedError when the header is missing', () => {
    const req = { headers: {} } as Request;
    const next = jest.fn() as NextFunction;

    authenticate(req, mockRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
    const errorArg = (next as jest.Mock).mock.calls[0][0];
    expect(errorArg.name).toBe('UnauthorizedError');
  });

  it('calls next with an UnauthorizedError for a malformed header', () => {
    const req = { headers: { authorization: 'Token abc' } } as Request;
    const next = jest.fn() as NextFunction;

    authenticate(req, mockRes(), next);

    const errorArg = (next as jest.Mock).mock.calls[0][0];
    expect(errorArg.name).toBe('UnauthorizedError');
  });

  it('calls next with an UnauthorizedError for an invalid token', () => {
    const req = { headers: { authorization: 'Bearer not-a-real-token' } } as Request;
    const next = jest.fn() as NextFunction;

    authenticate(req, mockRes(), next);

    const errorArg = (next as jest.Mock).mock.calls[0][0];
    expect(errorArg.name).toBe('UnauthorizedError');
  });

  it('attaches req.user and calls next with no error for a valid token', () => {
    const token = jwtService.generateAccessToken({ sub: 'user-1', role: 'user' });
    const req = { headers: { authorization: `Bearer ${token}` } } as Request;
    const next = jest.fn() as NextFunction;

    authenticate(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith();
    expect(req.user).toMatchObject({ sub: 'user-1', role: 'user' });
  });
});
