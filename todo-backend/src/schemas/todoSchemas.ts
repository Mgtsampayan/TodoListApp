import { z } from 'zod';

export const createTodoSchema = z.object({
    body: z.object({
        title: z
            .string()
            .min(1, 'Title is required')
            .max(255, 'Title must be less than 255 characters'),
        description: z
            .string()
            .max(5000, 'Description must be less than 5000 characters')
            .optional(),
    }),
});

export const updateTodoSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid todo ID'),
    }),
    body: z.object({
        title: z
            .string()
            .min(1, 'Title is required')
            .max(255, 'Title must be less than 255 characters')
            .optional(),
        description: z
            .string()
            .max(5000, 'Description must be less than 5000 characters')
            .nullable()
            .optional(),
        completed: z.boolean().optional(),
    }),
});

export const deleteTodoSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid todo ID'),
    }),
});