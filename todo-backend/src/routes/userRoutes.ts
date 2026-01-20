import { Router } from 'express';
import { getAllUsers } from '../controllers/userController.ts';
import { verifyTokenMiddleware } from '../middleware/verifyToken.ts';
import { requireAdmin } from '../middleware/requireAdmin.ts';

const router = Router();

router.use(verifyTokenMiddleware);
router.use(requireAdmin);

router.get('/', getAllUsers);

export default router;