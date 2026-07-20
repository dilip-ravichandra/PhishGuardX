import type { Request, Response, NextFunction } from 'express';
import { authorize } from '../../src/middleware/authorize';

function mockRes(): Response {
  return {} as Response;
}

describe('authorize middleware', () => {
  it('rejects with UnauthorizedError when req.user is missing', () => {
    const req = {} as Request;
    const next = jest.fn() as NextFunction;

    authorize('admin')(req, mockRes(), next);

    const errorArg = (next as jest.Mock).mock.calls[0][0];
    expect(errorArg.name).toBe('UnauthorizedError');
  });

  it('rejects with ForbiddenError when role is not permitted', () => {
    const req = { user: { sub: 'u1', role: 'user' } } as Request;
    const next = jest.fn() as NextFunction;

    authorize('admin')(req, mockRes(), next);

    const errorArg = (next as jest.Mock).mock.calls[0][0];
    expect(errorArg.name).toBe('ForbiddenError');
  });

  it('calls next with no error when role is permitted', () => {
    const req = { user: { sub: 'u1', role: 'admin' } } as Request;
    const next = jest.fn() as NextFunction;

    authorize('admin')(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith();
  });

  it('allows any of multiple permitted roles', () => {
    const req = { user: { sub: 'u1', role: 'user' } } as Request;
    const next = jest.fn() as NextFunction;

    authorize('user', 'admin')(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith();
  });
});
