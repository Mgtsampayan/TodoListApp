import { createHash } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

export function conditionalCache(req: Request, res: Response, next: NextFunction) {
    if (req.method !== 'GET') {
        return next();
    }

    const originalJson = res.json.bind(res);

    res.json = (body: unknown) => {
        const etag = `"${createHash('md5').update(JSON.stringify(body)).digest('hex')}"`;
        res.setHeader('ETag', etag);
        res.setHeader('Cache-Control', 'private, no-cache');

        const clientEtag = req.headers['if-none-match'];
        if (clientEtag === etag) {
            res.status(304);
            return res.end();
        }

        return originalJson(body);
    };

    next();
}