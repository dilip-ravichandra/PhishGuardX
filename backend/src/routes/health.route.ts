import { Router, Request, Response } from 'express';
import type { ApiResponse } from '../types/api-response';

const router = Router();

interface HealthPayload {
  status: 'ok';
  service: 'backend';
  timestamp: string;
}

/**
 * GET /api/v1/health
 *
 * Infrastructure-only endpoint confirming the server is up. This is not a
 * business feature - it exists so Milestone 0's exit criteria ("all
 * services boot without errors") can be verified, and so later Docker
 * Compose healthchecks (Milestone 10) have something to poll.
 */
router.get('/', (_req: Request, res: Response<ApiResponse<HealthPayload>>) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      service: 'backend',
      timestamp: new Date().toISOString()
    }
  });
});

export default router;
