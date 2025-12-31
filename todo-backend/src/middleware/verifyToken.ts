import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.ts';
import { prisma } from '../config/prisma.ts';

export async function verifyTokenMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        // ✅ SECURITY HARDENING: Extract token from cookies (Strictly httpOnly)
        const token = req.cookies.token;

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        // Verify token
        const payload = await verifyToken(token);

        if (!payload) {
            res.status(401).json({
                success: false,
                message: 'Authentication session expired or invalid',
            });
            return;
        }

        // Verify user still exists in database
        const user = await prisma.user.findUnique({
            where: { id: payload.id },
            select: { id: true, email: true, role: true },
        });

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
}