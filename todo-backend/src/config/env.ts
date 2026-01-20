import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    DATABASE_URL: z.string().url('Invalid DATABASE_URL'),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: z.string().default('7d'),
    PORT: z.preprocess(
        (val) => val ? Number(val) : 5000,
        z.number().int().positive()
    ),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    FRONTEND_URL: z.url('Invalid FRONTEND_URL'),
    COOKIE_DOMAIN: z.string().default(''),
    COOKIE_SECURE: z.preprocess(
        (val) => val === 'true',
        z.boolean()
    ).default(false),
    COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('none'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error('Invalid environment variables:');
    console.error(parsedEnv.error.format());
    process.exit(1);
}

export const env = parsedEnv.data;

export type Env = typeof env;