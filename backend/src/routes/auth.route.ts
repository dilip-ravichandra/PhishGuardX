import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { registerValidators, loginValidators, handleValidationErrors } from '../validators/auth.validator';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

router.post('/register', registerValidators, handleValidationErrors, authController.register);
router.post('/login', loginValidators, handleValidationErrors, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

router.get('/me', authenticate, authController.me);
router.get('/admin/user-count', authenticate, authorize('admin'), authController.adminUserCount);

// Scaffolded per FR-003; see the comment in auth.controller.ts.
router.get('/google', authController.googleOAuth);

export default router;
