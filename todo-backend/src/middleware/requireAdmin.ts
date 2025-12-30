import type { Request, Response, NextFunction } from 'express';
import { Role } from '../../generated/client/client.ts';

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Authentication required',
        });
        return;
    }

    if (req.user.role !== Role.ADMIN) {
        res.status(403).json({
            success: false,
            message: 'Admin access required',
        });
        return;
    }

    next();
}