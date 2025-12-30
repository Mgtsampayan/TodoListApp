import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export type UserRole = 'USER' | 'ADMIN';

export interface User {
    id: string;
    email: string;
    role: UserRole;
    createdAt: string;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: unknown;
}

export async function getCurrentUser(): Promise<User | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return null;
        }

        // Call backend /api/auth/me endpoint
        const response = await fetch(`${API_URL}/api/auth/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `token=${token}`,
            },
            credentials: 'include',
            cache: 'no-store',
        });

        if (!response.ok) {
            return null;
        }

        const result: ApiResponse<{ user: User }> = await response.json();
        return result.data?.user || null;
    } catch (error) {
        console.error('getCurrentUser error:', error);
        return null;
    }
}

export async function isAuthenticated(): Promise<boolean> {
    const user = await getCurrentUser();
    return user !== null;
}

export async function hasRole(role: UserRole): Promise<boolean> {
    const user = await getCurrentUser();
    return user?.role === role;
}

export async function requireAuth(): Promise<User> {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('User is not authenticated');
    }
    return user;
}

export async function requiredAdmin(): Promise<User> {
    const user = await requireAuth();
    if (user.role !== 'ADMIN') {
        throw new Error('User does not have admin privileges')
    }
    return user;
}

export async function fetchAPI<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
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
    });

    const data = await response.json();
    return data;
}