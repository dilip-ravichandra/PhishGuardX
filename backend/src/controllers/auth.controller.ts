import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { userRepository } from '../repositories/user.repository';
import { setRefreshTokenCookie, clearRefreshTokenCookie, REFRESH_TOKEN_COOKIE } from '../utils/cookies';
import { UnauthorizedError } from '../utils/errors';
import type { ApiResponse } from '../types/api-response';
import type { PublicUser } from '../services/auth.service';

function requireRefreshCookie(req: Request): string {
  const token = req.cookies?.[REFRESH_TOKEN_COOKIE];
  if (!token) {
    throw new UnauthorizedError('No refresh token present');
  }
  return token;
}

export const authController = {
  async register(req: Request, res: Response<ApiResponse<{ user: PublicUser; accessToken: string }>>, next: NextFunction) {
    try {
      const { user, accessToken, refreshToken } = await authService.register(req.body);
      setRefreshTokenCookie(res, refreshToken);
      res.status(201).json({ success: true, data: { user, accessToken } });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response<ApiResponse<{ user: PublicUser; accessToken: string }>>, next: NextFunction) {
    try {
      const { user, accessToken, refreshToken } = await authService.login(req.body);
      setRefreshTokenCookie(res, refreshToken);
      res.status(200).json({ success: true, data: { user, accessToken } });
    } catch (error) {
      next(error);
    }
  },

  async refresh(req: Request, res: Response<ApiResponse<{ user: PublicUser; accessToken: string }>>, next: NextFunction) {
    try {
      const presentedToken = requireRefreshCookie(req);
      const { user, accessToken, refreshToken } = await authService.refresh(presentedToken);
      setRefreshTokenCookie(res, refreshToken);
      res.status(200).json({ success: true, data: { user, accessToken } });
    } catch (error) {
      next(error);
    }
  },

  async logout(req: Request, res: Response<ApiResponse<{ loggedOut: true }>>, next: NextFunction) {
    try {
      const token = req.cookies?.[REFRESH_TOKEN_COOKIE];
      if (token) {
        await authService.logout(token);
      }
      clearRefreshTokenCookie(res);
      res.status(200).json({ success: true, data: { loggedOut: true } });
    } catch (error) {
      next(error);
    }
  },

  async me(req: Request, res: Response<ApiResponse<{ user: PublicUser }>>, next: NextFunction) {
    try {
      // authenticate middleware guarantees req.user is set here.
      const user = await authService.getCurrentUser(req.user!.sub);
      res.status(200).json({ success: true, data: { user } });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Minimal admin-only endpoint whose sole purpose is to demonstrate that
   * RBAC actually gates a route (Milestone 1 exit criterion: "rejected
   * when unauthenticated/unauthorized by role"). Real administration
   * features are out of scope until Milestone 9.
   */
  async adminUserCount(_req: Request, res: Response<ApiResponse<{ totalUsers: number }>>, next: NextFunction) {
    try {
      const totalUsers = await userRepository.countAll();
      res.status(200).json({ success: true, data: { totalUsers } });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Google OAuth is required by SRS FR-003, but no client credentials,
   * redirect URI, or provider library are defined anywhere in the
   * documentation or Implementation Blueprint. Per your instruction,
   * this route is scaffolded as a clear placeholder rather than wired to
   * a real provider.
   */
  googleOAuth(_req: Request, res: Response<ApiResponse<never>>) {
    res.status(501).json({
      success: false,
      error: {
        message: 'Google OAuth (FR-003) is not yet implemented. Scaffolded pending provider credentials.',
        code: 'NOT_IMPLEMENTED'
      }
    });
  }
};
