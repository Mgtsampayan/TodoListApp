import express, { type Request, type Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.ts';
import { errorHandler } from './middleware/errorhandler.ts';
import { prisma } from './config/prisma.ts';

import authRoutes from './routes/authRoutes.ts';
import todoRoutes from './routes/todoRoutes.ts';
import userRoutes from './routes/userRoutes.ts';

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", env.FRONTEND_URL],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: "deny" },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: { permittedPolicies: "none" },
    referrerPolicy: { policy: "no-referrer" },
    xssFilter: true,
}));

app.use(
    cors({
        origin: env.FRONTEND_URL,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
    },
}));

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', globalLimiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());

if (env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
        next();
    });
}

app.get('/health', async (req: Request, res: Response) => {
    try {
        await prisma.$queryRaw`SELECT 1`;

        res.json({
            success: true,
            message: 'Server is healthy',
            data: {
                timestamp: new Date().toISOString(),
                status: 'operational',
            },
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({
            success: false,
            message: 'Server is unhealthy',
            data: {
                database: 'disconnected',
                error: error instanceof Error ? error.message : String(error),
            },
        });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/users', userRoutes);

app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

app.use(errorHandler);

async function shutdown(signal: string) {
    console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
    try {
        await prisma.$disconnect();
        console.log('Database disconnected.');
        process.exit(0);
    } catch (error) {
        console.error('Error during database disconnect:', error);
        process.exit(1);
    }
}

async function startServer() {
    try {
        await prisma.$connect();
        console.log('Database connected successfully');

        app.listen(env.PORT, () => {
            console.log(`
╔════════════════════════════════════════════════╗
║   TODO RBAC API SERVER                         ║
║   Environment: ${env.NODE_ENV.padEnd(32)}║
║   Port:        ${String(env.PORT).padEnd(32)}║
║   Frontend:    ${env.FRONTEND_URL.padEnd(32)}║
╚════════════════════════════════════════════════╝
      `);
        });

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

process.on('unhandledRejection', (err: Error) => {
    console.error('Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err: Error) => {
    console.error('Uncaught Exception:', err);
    shutdown('UNCAUGHT_EXCEPTION');
});

startServer();