import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, verifyPassword } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const manager = await prisma.manager.findUnique({ where: { email } });

        if (!manager) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        if (!manager.isActive) {
            return NextResponse.json(
                { error: 'Your account has been deactivated. Contact admin.' },
                { status: 403 }
            );
        }

        const isValid = await verifyPassword(password, manager.passwordHash);

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Create session
        const session = await getSession();
        session.userId = manager.id;
        session.phone = manager.email;
        session.name = manager.name;
        session.role = 'manager';
        session.isLoggedIn = true;
        await session.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Manager login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
