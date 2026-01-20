import { PrismaClient } from '../../generated/client/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { env } from './env.ts';

const { Pool } = pg;

const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

async function cleanup() {
    await prisma.$disconnect();
    await pool.end();
}

process.on('SIGINT', async () => {
    console.log('\nSIGINT received. Closing database connections...');
    await cleanup();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\nSIGTERM received. Closing database connections...');
    await cleanup();
    process.exit(0);
});