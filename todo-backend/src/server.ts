import express, { type Request, type Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.ts';
import { errorHandler } from './middleware/errorhandler.ts';
import { prisma } from './config/prisma.ts';

// Import routes
import authRoutes from './routes/authRoutes.ts';
import todoRoutes from './routes/todoRoutes.ts';
import userRoutes from './routes/userRoutes.ts';

const app = express();

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// 1. Security Headers (Data Privacy Act Compliance)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"], // Allow self and inline for simple apps, but strict enough
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

// 2. CORS configuration
app.use(
    cors({
        origin: env.FRONTEND_URL,
        credentials: true, // Allow cookies
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// 3. Global Rate Limiting (DDoS Protection)
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', globalLimiter);

// 3.1 Auth-Specific Rate Limiting (Brute Force Protection)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit to 10 attempts
    message: 'Too many authentication attempts, please try again after 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// 4. Body parser
// NOTE: I reduced the global limit to 100kb for security. 
// If you need to upload large files (e.g., Scanned Requirements), create a specific route with a higher limit.
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// 5. Cookie parser
app.use(cookieParser());

// Request logging (development only)
if (env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
        next();
    });
}

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', async (req: Request, res: Response) => {
    try {
        // Check database connection
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
        res.status(503).json({
            success: false,
            message: 'Server is unhealthy',
            data: {
                database: 'disconnected',
            },
        });
    }
});

// ============================================
// API ROUTES
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// ============================================
// ERROR HANDLER (Must be last)
// ============================================

app.use(errorHandler);

// ============================================
// GRACEFUL SHUTDOWN & SERVER STARTUP
// ============================================

async function shutdown(signal: string) {
    console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
    try {
        await prisma.$disconnect();
        console.log('✅ Database disconnected.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during database disconnect:', error);
        process.exit(1);
    }
}

async function startServer() {
    try {
        // Test database connection
        await prisma.$connect();
        console.log('✅ Database connected successfully');

        // Start server
        const server = app.listen(env.PORT, () => {
            console.log(`
╔════════════════════════════════════════════════╗
║                                                ║
║   🚀 TODO RBAC API SERVER (Dec 2025)          ║
║                                                ║
║   Environment: ${env.NODE_ENV.padEnd(32)}║
║   Port:        ${String(env.PORT).padEnd(32)}║
║   Database:    Connected                       ║
║   Frontend:    ${env.FRONTEND_URL.padEnd(32)}║
║                                                ║
║   API Endpoints:                               ║
║   - POST   /api/auth/register                  ║
║   - POST   /api/auth/login                     ║
║   - POST   /api/auth/logout                    ║
║   - GET    /api/auth/me                        ║
║   - GET    /api/todos                          ║
║   - POST   /api/todos                          ║
║   - PUT    /api/todos/:id                      ║
║   - DELETE /api/todos/:id                      ║
║   - GET    /api/users (Admin only)             ║
║                                                ║
║   Health Check: /health                        ║
║                                                ║
╚════════════════════════════════════════════════╝
      `);
        });

        // Graceful shutdown signals
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle unhandled promise rejections (Network failures, etc.)
process.on('unhandledRejection', (err: Error) => {
    console.error('❌ Unhandled Promise Rejection:', err);
    // Don't exit immediately; let the shutdown handler take care of it if critical
    // or log it for the admin to see.
});

// Handle uncaught exceptions (Programmer errors)
process.on('uncaughtException', (err: Error) => {
    console.error('❌ Uncaught Exception:', err);
    shutdown('UNCAUGHT_EXCEPTION');
});

// Start the server
startServer();