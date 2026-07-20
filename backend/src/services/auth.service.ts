import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import { refreshTokenRepository } from '../repositories/refresh-token.repository';
import { passwordService } from './password.service';
import { jwtService } from './jwt.service';
import { ConflictError, UnauthorizedError } from '../utils/errors';
import type { UserDocument, UserRole } from '../models/user.model';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResult {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

function toPublicUser(user: UserDocument): PublicUser {
  return {
    id: user.id as string,
    name: user.name,
    email: user.email,
    role: user.role as UserRole
  };
}

/** Reads the `exp` claim off an already-signed token to compute its DB expiry. */
function expiryDateFromToken(token: string): Date {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  if (!decoded?.exp) {
    throw new Error('Signed token is missing an exp claim');
  }
  return new Date(decoded.exp * 1000);
}

async function issueTokenPair(user: UserDocument): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = jwtService.generateAccessToken({ sub: user.id as string, role: user.role as UserRole });
  const refreshToken = jwtService.generateRefreshToken({ sub: user.id as string });

  await refreshTokenRepository.create({
    userId: user.id as string,
    tokenHash: jwtService.hashToken(refreshToken),
    expiresAt: expiryDateFromToken(refreshToken)
  });

  return { accessToken, refreshToken };
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    const passwordHash = await passwordService.hash(input.password);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: 'user'
    });

    const { accessToken, refreshToken } = await issueTokenPair(user);
    return { user: toPublicUser(user), accessToken, refreshToken };
  },

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const passwordMatches = await passwordService.verify(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const { accessToken, refreshToken } = await issueTokenPair(user);
    return { user: toPublicUser(user), accessToken, refreshToken };
  },

  /**
   * Rotates the refresh token: the presented token is verified and revoked,
   * and a brand new access/refresh pair is issued. Rotation limits the
   * damage a stolen refresh token can do, since reusing an old (revoked)
   * token is now detectable.
   */
  async refresh(presentedToken: string): Promise<AuthResult> {
    let payload;
    try {
      payload = jwtService.verifyRefreshToken(presentedToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const tokenHash = jwtService.hashToken(presentedToken);
    const stored = await refreshTokenRepository.findValidByHash(tokenHash);
    if (!stored) {
      throw new UnauthorizedError('Refresh token has been revoked or is unrecognized');
    }

    const user = await userRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedError('User account no longer exists');
    }

    await refreshTokenRepository.revokeByHash(tokenHash);
    const { accessToken, refreshToken } = await issueTokenPair(user);
    return { user: toPublicUser(user), accessToken, refreshToken };
  },

  async logout(presentedToken: string): Promise<void> {
    const tokenHash = jwtService.hashToken(presentedToken);
    await refreshTokenRepository.revokeByHash(tokenHash);
  },

  async getCurrentUser(userId: string): Promise<PublicUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User account no longer exists');
    }
    return toPublicUser(user);
  }
};
