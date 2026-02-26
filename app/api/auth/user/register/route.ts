import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, hashPassword } from '@/lib/auth';

// PATCH — update WhatsApp preferences after registration
export async function PATCH(request: Request) {
    try {
        const session = await getSession();
        if (!session.isLoggedIn || session.role !== 'user') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { whatsappNumber, wantsWhatsappUpdates } = await request.json();
        const waClean = whatsappNumber ? whatsappNumber.replace(/\D/g, '').replace(/^91/, '') : null;

        await prisma.user.update({
            where: { id: session.userId },
            data: {
                whatsappNumber: waClean || null,
                wantsWhatsappUpdates: wantsWhatsappUpdates === true,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('WhatsApp update error:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { name, phone, password, whatsappNumber, wantsWhatsappUpdates } = await request.json();

        if (!name || !phone || !password) {
            return NextResponse.json(
                { error: 'Name, phone number, and password are required' },
                { status: 400 }
            );
        }

        // Validate Indian phone number (10 digits)
        const cleanPhone = phone.replace(/\D/g, '').replace(/^91/, '');
        if (cleanPhone.length !== 10) {
            return NextResponse.json(
                { error: 'Please enter a valid 10-digit phone number' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existing = await prisma.user.findUnique({ where: { phone: cleanPhone } });
        if (existing) {
            return NextResponse.json(
                { error: 'An account with this phone number already exists' },
                { status: 409 }
            );
        }

        // Create user
        const passwordHash = await hashPassword(password);
        const whatsappClean = whatsappNumber ? whatsappNumber.replace(/\D/g, '').replace(/^91/, '') : null;

        const user = await prisma.user.create({
            data: {
                name,
                phone: cleanPhone,
                whatsappNumber: whatsappClean || null,
                wantsWhatsappUpdates: wantsWhatsappUpdates || false,
                passwordHash,
            },
        });

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
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
