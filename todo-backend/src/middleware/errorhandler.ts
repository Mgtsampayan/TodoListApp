import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '../../generated/client/client.ts';
import { ZodError } from 'zod';

interface ErrorResponse {
    success: false;
    message: string;
    errors?: unknown;
    stack?: string;
}

export function errorHandler(
    err: any, // Ginawa nating 'any' para ma-access ang properties ng iba't ibang error types
    req: Request,
    res: Response,
    next: NextFunction
) {
    // 1. Logging - Sa production, mas maganda kung and gagamitin ay Winston o Pino
    // Pero for now, console.error is fine.
    console.error(`[${new Date().toISOString()}] ❌ Error:`, {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    const response: ErrorResponse = {
        success: false,
        message: 'Internal server error',
    };

    // 2. Handle JSON Syntax Errors (e.g., Malformed JSON body)
    if (err instanceof SyntaxError && 'status' in err && err.status === 400) {
        return res.status(400).json({
            success: false,
            message: 'Invalid JSON payload. Check your syntax.',
        });
    }

    // 3. Handle Zod Validation Errors (Kung ipapasa mo ang error sa next())
    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: err.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            })),
        });
    }

    // 4. Handle Prisma Specific Errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002': // Unique constraint violation
                return res.status(409).json({
                    success: false,
                    message: `A record with this ${err.meta?.target} already exists.`,
                });
            case 'P2025': // Record not found
                return res.status(404).json({
                    success: false,
                    message: 'The requested record was not found.',
                });
            case 'P2003': // Foreign key constraint failed
                return res.status(400).json({
                    success: false,
                    message: 'Operation failed due to a database relationship constraint.',
                });
            default:
                // Iba pang Prisma errors na ayaw nating i-leak ang details
                return res.status(400).json({
                    success: false,
                    message: 'Database operation failed.',
                });
        }
    }

    if (err instanceof Prisma.PrismaClientValidationError) {
        return res.status(400).json({
            success: false,
            message: 'Invalid data format provided to the database.',
        });
    }

    // 5. Handle JWT / Auth Errors
    if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token.',
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Session expired. Please login again.',
        });
    }

    // 6. Final Fallback (500 Internal Server Error)
    // ✅ SECURITY: I-check ang environment. Ipakita lang ang stack trace sa development.
    const isDevelopment = process.env.NODE_ENV === 'development';

    res.status(err.status || 500).json({
        success: false,
        message: response.message,
        ...(isDevelopment && { stack: err.stack, detail: err.message }),
    });
}