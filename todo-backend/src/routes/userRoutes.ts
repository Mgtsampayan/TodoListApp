import { Router } from 'express';
import { getAllUsers } from '../controllers/userController.ts';
import { verifyTokenMiddleware } from '../middleware/verifyToken.ts';
import { requireAdmin } from '../middleware/requireAdmin.ts';

const router = Router();

// Apply authentication and admin check to all routes
router.use(verifyTokenMiddleware);
router.use(requireAdmin);

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get('/', getAllUsers);

export default router;