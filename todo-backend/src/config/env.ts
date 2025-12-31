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
    PORT: z.preprocess(
        (val) => val ? Number(val) : 5000,
        z.number().int().positive()
    ),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // CORS
    FRONTEND_URL: z.string().url('Invalid FRONTEND_URL'),
    // FRONTEND_URL: z.preprocess(
    //     (val) => typeof val === 'string' ? val.trim() : val,
    //     z.url()
    // ),

    // Cookies
    COOKIE_DOMAIN: z.string().default('localhost'),
    COOKIE_SECURE: z.preprocess(
        (val) => val === 'true',
        z.boolean()
    ).default(false),
    COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),
});

// 2. Validate environment variables on startup
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error('❌ Invalid environment variables:');
    // Print errors in a readable format
    console.error(parsedEnv.error.format());
    process.exit(1);
}

// 3. Export the validated and typed environment
export const env = parsedEnv.data;

// 4. Type for TS support
export type Env = typeof env;
