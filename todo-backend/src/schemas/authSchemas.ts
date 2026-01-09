import { z } from 'zod';

export const registerSchema = z.object({
    body: z.object({
        email: z.email('Invalid email format'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .max(100, 'Password must be less than 100 characters')
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                'Password must contain at least one uppercase letter, one lowercase letter, and one number'
            ),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.email('Invalid email format'),
        password: z.string().min(1, 'Password is required'),
    }),
});