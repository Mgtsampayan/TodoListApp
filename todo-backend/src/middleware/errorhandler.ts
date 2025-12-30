import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.ts';
import { Prisma } from '../../generated/client/client.ts';

interface ErrorResponse {
    success: false;
    message: string;
    errors?: unknown;
    stack?: string;
}

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.error('❌ Error:', err);

    const response: ErrorResponse = {
        success: false,
        message: 'Internal server error',
    };

    // Prisma Errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (err.code === 'P2002') {
            response.message = 'A record with this information already exists';
            res.status(409).json(response);
            return;
        }

        // Record not found
        if (err.code === 'P2025') {
            response.message = 'Record not found';
            res.status(404).json(response);
            return;
        }
    }

    // Prisma Validation Error
    if (err instanceof Prisma.PrismaClientValidationError) {
        response.message = 'Invalid data provided';
        res.status(400).json(response);
        return;
    }

    // Include stack trace in development
    if (env.NODE_ENV === 'development') {
        // response.stack = err.stack;
        response.errors = err;
    }

    res.status(500).json(response);
}