import jwt, { type SignOptions } from 'jsonwebtoken';
import crypto from 'node:crypto';
import { config } from '../config/env';
import type { UserRole } from '../models/user.model';

export interface AccessTokenPayload {
  sub: string;
  role: UserRole;
}

export interface RefreshTokenPayload {
  sub: string;
}

export const jwtService = {
  generateAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiry
    } as SignOptions);
  },

  verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, config.jwt.accessSecret) as AccessTokenPayload;
  },

  /**
   * Refresh tokens are also signed JWTs (using the documented
   * JWT_REFRESH_SECRET / JWT_REFRESH_EXPIRY env vars from Volume 2 /
   * the Implementation Blueprint), but a signature alone is not enough
   * to revoke a session early - so a SHA-256 hash of the issued token is
   * additionally stored server-side (see refresh-token.repository.ts).
   * Refresh requires BOTH a valid signature AND a matching, non-revoked
   * DB record. This satisfies AUTH-04 without inventing an undocumented
   * token format.
   */
  generateRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiry
    } as SignOptions);
  },

  verifyRefreshToken(token: string): RefreshTokenPayload {
    return jwt.verify(token, config.jwt.refreshSecret) as RefreshTokenPayload;
  },

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
};
