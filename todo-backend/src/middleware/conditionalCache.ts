import { createHash } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

// ============================================
// ETAG CACHING MIDDLEWARE (Performance Optimization)
// ============================================
// Enables HTTP conditional requests (If-None-Match header)
// Returns 304 Not Modified for unchanged data, saving bandwidth

export function conditionalCache(req: Request, res: Response, next: NextFunction) {
    // Only apply to GET requests
    if (req.method !== 'GET') {
        return next();
    }

    const originalJson = res.json.bind(res);

    res.json = (body: unknown) => {
        // Generate ETag from response body
        const etag = `"${createHash('md5').update(JSON.stringify(body)).digest('hex')}"`;
        res.setHeader('ETag', etag);
        res.setHeader('Cache-Control', 'private, no-cache');

        // Check if client has matching ETag
        const clientEtag = req.headers['if-none-match'];
        if (clientEtag === etag) {
            res.status(304);
            return res.end();
        }

        return originalJson(body);
    };

    next();
}
