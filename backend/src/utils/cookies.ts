import type { Response } from 'express';
import { config } from '../config/env';

export const REFRESH_TOKEN_COOKIE = 'refreshToken';

/**
 * The refresh token is stored in an httpOnly cookie rather than
 * localStorage or the response body's JSON, so that client-side
 * JavaScript (and therefore an XSS payload) can never read it directly.
 * `secure` is enabled outside development since it requires HTTPS.
 */
export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    path: '/api/v1/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000 // matches the default 7d refresh expiry; actual expiry is enforced by the JWT/DB record
  });
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    path: '/api/v1/auth'
  });
}
