import { Router } from 'express';
import { register, login, logout, getCurrentUser } from '../controllers/authController.ts';
import { validateRequest } from '../middleware/validateRequest.ts';
import { registerSchema, loginSchema } from '../schemas/authSchemas.ts';
import { verifyTokenMiddleware } from '../middleware/verifyToken.ts';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/logout', logout);
router.get('/me', verifyTokenMiddleware, getCurrentUser);

export default router;