// ============================================
// USER & AUTH TYPES
// ============================================

export type UserRole = 'USER' | 'ADMIN';

export interface User {
    id: string;
    email: string;
    role: UserRole;
    createdAt: string;
    updatedAt?: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data?: {
        user: User;
    };
}

// ============================================
// TODO TYPES
// ============================================

export interface Todo {
    id: string;
    title: string;
    description: string | null;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
    ownerId: string;
    owner: {
        id: string;
        email: string;
    };
}

export interface TodosResponse {
    success: boolean;
    data: {
        todos: Todo[];
    };
}

export interface TodoResponse {
    success: boolean;
    message: string;
    data?: {
        todo: Todo;
    };
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: Record<string, string[]>;
}

export interface ApiError {
    success: false;
    message: string;
    errors?: unknown;
}

// ============================================
// FORM ACTION TYPES
// ============================================

export interface ActionResult {
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
}

// ============================================
// ADMIN TYPES
// ============================================

export interface UserWithStats extends User {
    _count: {
        todos: number;
    };
}

export interface UsersResponse {
    success: boolean;
    data: {
        users: UserWithStats[];
    };
}