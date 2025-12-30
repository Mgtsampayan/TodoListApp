'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Todo } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const createTodoSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
    description: z.string().optional(),
});

const updateTodoSchema = z.object({
    title: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    completed: z.boolean().optional(),
});

export async function getTodosAction(): Promise<{
    success: boolean;
    data?: Todo[];
    message?: string;
}> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) return { success: false, message: 'Unauthorized' };

        // ✅ FIX: Send token in Authorization header
        const response = await fetch(`${API_URL}/api/todos`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,  // ✅ Key change
            },
        });

        if (!response.ok) {
            return { success: false, message: 'Failed to fetch todos' };
        }

        const json = await response.json();
        return { success: true, data: json.data?.todos || [] };
    } catch (error) {
        console.error('Get todos error:', error);
        return { success: false, message: 'Network error' };
    }
}

export async function createTodoAction(formData: FormData): Promise<{
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
}> {
    const rawData = {
        title: formData.get('title'),
        description: formData.get('description'),
    };

    const validation = createTodoSchema.safeParse(rawData);

    if (!validation.success) {
        return {
            success: false,
            message: 'Validation failed',
            errors: validation.error.flatten().fieldErrors,
        };
    }

    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        // ✅ FIX: Send token in Authorization header
        const response = await fetch(`${API_URL}/api/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,  // ✅ Key change
            },
            body: JSON.stringify(validation.data),
        });

        if (!response.ok) {
            const json = await response.json();
            return { success: false, message: json.message || 'Failed to create todo' };
        }

        revalidatePath('/dashboard');
        return { success: true, message: 'Todo created' };
    } catch (error) {
        console.error('Create todo error:', error);
        return { success: false, message: 'Network error' };
    }
}

export async function updateTodoAction(
    id: string,
    data: z.infer<typeof updateTodoSchema>
): Promise<void> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        // ✅ FIX: Send token in Authorization header
        await fetch(`${API_URL}/api/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,  // ✅ Key change
            },
            body: JSON.stringify(data),
        });

        revalidatePath('/dashboard');
        revalidatePath('/admin');
    } catch (error) {
        console.error('Update todo error:', error);
    }
}

export async function deleteTodoAction(id: string): Promise<void> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        // ✅ FIX: Send token in Authorization header
        await fetch(`${API_URL}/api/todos/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,  // ✅ Key change
            },
        });

        revalidatePath('/dashboard');
        revalidatePath('/admin');
    } catch (error) {
        console.error('Delete todo error:', error);
    }
}