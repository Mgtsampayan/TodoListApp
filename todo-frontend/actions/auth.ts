'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

interface ActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Register new user
 */
export async function registerAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
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

    // ✅ Server Action: fetch runs server-side, need credentials for cookie handling
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validationResult.data),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Registration failed',
      };
    }

    // ✅ Extract Set-Cookie header from backend and forward to browser
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      const cookieStore = await cookies();
      // Parse the cookie value from Set-Cookie header
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

    return {
      success: true,
      message: 'Registration successful',
    };

  } catch (error) {
    console.error('Register action error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
    };
  }
}

/**
 * Login user
 */
export async function loginAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
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

    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validationResult.data),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Invalid email or password',
      };
    }

    // ✅ Extract Set-Cookie header from backend and forward to browser
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      const cookieStore = await cookies();
      // Parse the cookie value from Set-Cookie header
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

    return {
      success: true,
      message: 'Login successful',
    };

  } catch (error) {
    console.error('Login action error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
    };
  }
}

/**
 * Logout user
 */
export async function logoutAction(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (token) {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `token=${token}`, // ✅ SECURITY HARDENING: Use Cookie
        },
      });
    }

    // Clear cookie
    cookieStore.delete('token');

  } catch (error) {
    console.error('Logout action error:', error);
  }

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
        'Cookie': `token=${token}`, // ✅ SECURITY HARDENING: Use Cookie
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