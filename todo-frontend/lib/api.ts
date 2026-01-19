import { cookies } from 'next/headers';
import type { TodosResponse, UsersResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Cookie': `token=${token}` }),
            ...options.headers,
        },
        credentials: 'include',
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response.json();
}

export async function getTodos(): Promise<TodosResponse> {
    try {
        return await fetchAPI<TodosResponse>('/api/todos');
    } catch (error) {
        console.error('Get todos error:', error);
        return {
            success: false,
            data: { todos: [] },
        };
    }
}

export async function getTodoById(id: string): Promise<TodosResponse> {
    try {
        return await fetchAPI<TodosResponse>(`/api/todos/${id}`);
    } catch (error) {
        console.error('Get todo error:', error);
        return {
            success: false,
            data: { todos: [] },
        };
    }
}

export async function getAllUsers(): Promise<UsersResponse> {
    try {
        return await fetchAPI<UsersResponse>('/api/users');
    } catch (error) {
        console.error('Get users error:', error);
        return {
            success: false,
            data: { users: [] },
        };
    }
}