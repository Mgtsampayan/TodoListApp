import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const PUBLIC_ROUTES = ['/login', '/register'];
const ADMIN_ROUTES = ['/admin'];
const PROTECTED_ROUTES = ['/dashboard', '/todos'];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('token')?.value;

    if (pathname === '/' || PUBLIC_ROUTES.includes(pathname)) {
        if (token && (pathname === '/login' || pathname === '/register')) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next();
    }

    if (
        PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) ||
        ADMIN_ROUTES.some((route) => pathname.startsWith(route))
    ) {
        if (!token) {
            const url = new URL('/login', request.url);
            url.searchParams.set('redirect', pathname);
            return NextResponse.redirect(url);
        }

        if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
            try {
                const response = await fetch(`${API_URL}/api/auth/me`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cookie': `token=${token}`,
                    },
                    credentials: 'include',
                });

                if (!response.ok) {
                    const res = NextResponse.redirect(new URL('/login', request.url));
                    res.cookies.delete('token');
                    return res;
                }

                const data = await response.json();
                const user = data.data?.user;

                if (user?.role !== 'ADMIN') {
                    return NextResponse.redirect(new URL('/dashboard', request.url));
                }

                return NextResponse.next();
            } catch (error) {
                console.error('Middleware auth check failed:', error);
                const res = NextResponse.redirect(new URL('/login', request.url));
                res.cookies.delete('token');
                return res;
            }
        }

        return NextResponse.next();
    }

    return NextResponse.next();
}

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