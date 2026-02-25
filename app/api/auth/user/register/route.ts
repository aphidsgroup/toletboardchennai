import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { name, email, phone, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json(
                { error: 'An account with this email already exists' },
                { status: 409 }
            );
        }

        // Create user
        const passwordHash = await hashPassword(password);
        const user = await prisma.user.create({
            data: { name, email, phone: phone || null, passwordHash },
        });

        // Create session
        const session = await getSession();
        session.userId = user.id;
        session.email = user.email;
        session.name = user.name;
        session.role = 'user';
        session.isLoggedIn = true;
        await session.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
