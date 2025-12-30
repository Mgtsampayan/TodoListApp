import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.ts';
import { hashPassword, verifyPassword } from '../utils/password.ts';
import { generateToken } from '../utils/jwt.ts';
import { env } from '../config/env.ts';

/**
 * Register new user
 * POST /api/auth/register
 */
export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            res.status(409).json({
                success: false,
                message: 'Email already registered',
            });
            return;
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: 'USER', // Default role
            },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        // Generate JWT
        const token = await generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        // Set HttpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: env.COOKIE_SECURE,
            sameSite: env.COOKIE_SAME_SITE,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            domain: env.COOKIE_DOMAIN,
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: { user },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Login user
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
            return;
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.password);

        if (!isValidPassword) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
            return;
        }

        // Generate JWT
        const token = await generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        // Set HttpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: env.COOKIE_SECURE,
            sameSite: env.COOKIE_SAME_SITE,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            domain: env.COOKIE_DOMAIN,
        });

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                },
            },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Logout user
 * POST /api/auth/logout
 */
export async function logout(req: Request, res: Response, next: NextFunction) {
    try {
        // Clear cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: env.COOKIE_SECURE,
            sameSite: env.COOKIE_SAME_SITE,
            domain: env.COOKIE_DOMAIN,
        });

        res.json({
            success: true,
            message: 'Logout successful',
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get current user profile
 * GET /api/auth/me
 */
export async function getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        res.json({
            success: true,
            data: { user },
        });
    } catch (error) {
        next(error);
    }
}