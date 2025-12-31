import { PrismaClient } from '../../generated/client/client.ts';  // ✅ Custom output path
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { env } from './env.js';

// ============================================
// PRISMA 7 ADAPTER PATTERN
// ============================================
// In Prisma 7, we must pass a database adapter directly to PrismaClient
// instead of using the `url` property in schema.prisma

const { Pool } = pg;

// Create PostgreSQL connection pool
const pool = new Pool({
    connectionString: env.DATABASE_URL,
    // Connection pool settings for production
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    // SSL requirement for Render/Cloud Postgres
    ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Create Prisma adapter for PostgreSQL
const adapter = new PrismaPg(pool);

// ============================================
// PRISMA CLIENT SINGLETON (Prisma 7 Style)
// ============================================

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter, // ✅ Pass the adapter instead of URL
        log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

async function cleanup() {
    await prisma.$disconnect();
    await pool.end(); // ✅ Also close the connection pool
}

process.on('SIGINT', async () => {
    console.log('\n⚠️  SIGINT received. Closing database connections...');
    await cleanup();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n⚠️  SIGTERM received. Closing database connections...');
    await cleanup();
    process.exit(0);
});