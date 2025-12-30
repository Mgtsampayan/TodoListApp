import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    // Database
    DATABASE_URL: z.string().url('Invalid DATABASE_URL'),

    // JWT
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: z.string().default('7d'),

    // Server
    PORT: z.string().transform(Number).pipe(z.number().int().positive()).default(5000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // CORS
    FRONTEND_URL: z.string().url('Invalid FRONTEND_URL'),

    // Cookies
    COOKIE_DOMAIN: z.string().default('localhost'),
    COOKIE_SECURE: z.string().transform(val => val === 'true').default(false),
    COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),
});

export type Env = z.infer<typeof envSchema>;

// Validate environment variables on startup
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error('❌ Invalid environment variables:', parsedEnv.error.format());
    process.exit(1);
}

export const env = parsedEnv.data;
