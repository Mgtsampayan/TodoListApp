import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.ts';
import { prisma } from '../config/prisma.ts';
import { LRUCache } from 'lru-cache';
import type { Role } from '../../generated/client/client.ts';

type CachedUser = { id: string; email: string; role: Role };

const userCache = new LRUCache<string, CachedUser>({
    max: 500,
    ttl: 1000 * 60 * 5,
});

export function invalidateUserCache(userId: string) {
    userCache.delete(userId);
}

export async function verifyTokenMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const token = req.cookies.token;

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        const payload = await verifyToken(token);

        if (!payload) {
            res.status(401).json({
                success: false,
                message: 'Authentication session expired or invalid',
            });
            return;
        }

        let user = userCache.get(payload.id);

        if (!user) {
            const dbUser = await prisma.user.findUnique({
                where: { id: payload.id },
                select: { id: true, email: true, role: true },
            });

            if (!dbUser) {
                res.status(401).json({
                    success: false,
                    message: 'User not found',
                });
                return;
            }

            user = dbUser;
            userCache.set(payload.id, user);
        }

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
}
