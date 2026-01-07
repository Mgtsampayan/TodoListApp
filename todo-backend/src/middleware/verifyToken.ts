import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.ts';
import { prisma } from '../config/prisma.ts';
import { LRUCache } from 'lru-cache';
import type { Role } from '../../generated/client/client.ts';

// ============================================
// USER CACHE (Performance Optimization)
// ============================================
// Cache user lookups to avoid hitting the database on every request
// TTL: 5 minutes - balances freshness with performance
// Max: 500 entries - suitable for small-medium apps
type CachedUser = { id: string; email: string; role: Role };

const userCache = new LRUCache<string, CachedUser>({
    max: 500,
    ttl: 1000 * 60 * 5, // 5 minutes
});

// Export for cache invalidation on user update/delete
export function invalidateUserCache(userId: string) {
    userCache.delete(userId);
}

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

        // ✅ PERFORMANCE: Check cache first before hitting database
        let user = userCache.get(payload.id);
        
        if (!user) {
            // Cache miss - fetch from database
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
            
            // Store in cache for future requests
            user = dbUser;
            userCache.set(payload.id, user);
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
}
