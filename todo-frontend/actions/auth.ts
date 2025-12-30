'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ============================================
// VALIDATION SCHEMAS (Match backend)
// ============================================

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and number'
    ),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// ============================================
// TYPE DEFINITIONS
// ============================================

interface ActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Register new user
 */
export async function registerAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    // 1. Extract and validate form data
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    const validationResult = registerSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    // 2. Call backend API
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validationResult.data),
      credentials: 'include', // ✅ Important for cookies
    });

    const data = await response.json();

    // 3. Handle response
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Registration failed',
      };
    }

    // 4. Extract cookie from response and set it
    // ⚠️ NEXT.JS 16: cookies() is now async
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      const cookieStore = await cookies();
      // Parse the cookie (simple extraction - production would need proper parsing)
      const tokenMatch = setCookieHeader.match(/token=([^;]+)/);
      if (tokenMatch) {
        cookieStore.set('token', tokenMatch[1], {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60, // 7 days
          path: '/',
        });
      }
    }

  } catch (error) {
    console.error('Register action error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
    };
  }

  // 5. Redirect to dashboard
  redirect('/dashboard');
}

/**
 * Login user
 */
export async function loginAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    // 1. Extract and validate form data
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    const validationResult = loginSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    // 2. Call backend API
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validationResult.data),
      credentials: 'include',
    });

    const data = await response.json();

    // 3. Handle response
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Invalid email or password',
      };
    }

    // 4. Extract and set cookie
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      const cookieStore = await cookies();
      const tokenMatch = setCookieHeader.match(/token=([^;]+)/);
      if (tokenMatch) {
        cookieStore.set('token', tokenMatch[1], {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        });
      }
    }

  } catch (error) {
    console.error('Login action error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
    };
  }

  // 5. Redirect to dashboard
  redirect('/dashboard');
}

/**
 * Logout user
 */
export async function logoutAction(): Promise<void> {
  try {
    // 1. Call backend logout endpoint
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (token) {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `token=${token}`,
        },
        credentials: 'include',
      });
    }

    // 2. Clear cookie on frontend
    cookieStore.delete('token');

  } catch (error) {
    console.error('Logout action error:', error);
  }

  // 3. Redirect to login
  redirect('/login');
}

/**
 * Get current authenticated user
 */
export async function getCurrentUserAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `token=${token}`,
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.data?.user || null;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}
