import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ============================================
// ROUTE DEFINITIONS
// ============================================

const PUBLIC_ROUTES = ['/login', '/register'];
const ADMIN_ROUTES = ['/admin'];
const PROTECTED_ROUTES = ['/dashboard', '/todos'];

// ============================================
// MIDDLEWARE FUNCTION
// ============================================

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('token')?.value;

    // ============================================
    // CASE 1: Public Routes (/, /login, /register)
    // ============================================
    if (pathname === '/' || PUBLIC_ROUTES.includes(pathname)) {
        // If already logged in, redirect to dashboard
        if (token && (pathname === '/login' || pathname === '/register')) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next();
    }

    // ============================================
    // CASE 2: Protected Routes - Require Authentication
    // ============================================
    if (
        PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) ||
        ADMIN_ROUTES.some((route) => pathname.startsWith(route))
    ) {
        // No token = redirect to login
        if (!token) {
            const url = new URL('/login', request.url);
            url.searchParams.set('redirect', pathname); // Save intended destination
            return NextResponse.redirect(url);
        }

        // ============================================
        // CASE 3: Admin Routes - Require ADMIN Role
        // ============================================
        if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
            try {
                // Verify user role by calling backend
                const response = await fetch(`${API_URL}/api/auth/me`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cookie': `token=${token}`,
                    },
                    credentials: 'include',
                });

                if (!response.ok) {
                    // Invalid token - clear and redirect
                    const res = NextResponse.redirect(new URL('/login', request.url));
                    res.cookies.delete('token');
                    return res;
                }

                const data = await response.json();
                const user = data.data?.user;

                // Check if user is ADMIN
                if (user?.role !== 'ADMIN') {
                    // User is authenticated but not admin - redirect to dashboard
                    return NextResponse.redirect(new URL('/dashboard', request.url));
                }

                // Admin verified - proceed
                return NextResponse.next();
            } catch (error) {
                console.error('Middleware auth check failed:', error);
                const res = NextResponse.redirect(new URL('/login', request.url));
                res.cookies.delete('token');
                return res;
            }
        }

        // Regular protected route - just check token exists
        return NextResponse.next();
    }

    // ============================================
    // CASE 4: All Other Routes
    // ============================================
    return NextResponse.next();
}

// ============================================
// MATCHER CONFIGURATION
// ============================================
// ⚠️ IMPORTANT: Exclude static files and API routes from middleware
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    ],
};