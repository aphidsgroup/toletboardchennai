import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow login page
    if (pathname === '/admin/login') {
        return NextResponse.next();
    }

    // Protect all /admin routes — must be logged in AND be admin
    if (pathname.startsWith('/admin')) {
        const session = await getSession();

        if (!session.isLoggedIn || session.role !== 'admin') {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    // Add security headers to all responses
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    return response;
}

export const config = {
    matcher: ['/admin/:path*', '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
