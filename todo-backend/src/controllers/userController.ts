import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.ts';

export async function getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                _count: {
                    select: {
                        todos: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json({
            success: true,
            data: { users },
        });
    } catch (error) {
        next(error);
    }
}