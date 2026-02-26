import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, verifyPassword } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { phone, password } = await request.json();

        if (!phone || !password) {
            return NextResponse.json(
                { error: 'Phone number and password are required' },
                { status: 400 }
            );
        }

        const cleanPhone = phone.replace(/\D/g, '').replace(/^91/, '');
        const user = await prisma.user.findUnique({ where: { phone: cleanPhone } });

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid phone number or password' },
                { status: 401 }
            );
        }

        const isValid = await verifyPassword(password, user.passwordHash);

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid phone number or password' },
                { status: 401 }
            );
        }

        // Create session
        const session = await getSession();
        session.userId = user.id;
        session.phone = user.phone;
        session.name = user.name;
        session.role = 'user';
        session.isLoggedIn = true;
        await session.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('User login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
