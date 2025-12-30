import { Router } from 'express';
import { register, login, logout, getCurrentUser } from '../controllers/authController.ts';
import { validateRequest } from '../middleware/validateRequest.ts';
import { registerSchema, loginSchema } from '../schemas/authSchemas.ts';
import { verifyTokenMiddleware } from '../middleware/verifyToken.ts';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', validateRequest(registerSchema), register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validateRequest(loginSchema), login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', verifyTokenMiddleware, getCurrentUser);

export default router;