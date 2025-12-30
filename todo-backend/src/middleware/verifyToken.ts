import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.ts';
import { prisma } from '../config/prisma.ts';

export async function verifyTokenMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        // ✅ FIX: Extract token from Authorization header instead of cookie
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        // Extract token after "Bearer "
        const token = authHeader.substring(7);

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
                message: 'Invalid or expired token',
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