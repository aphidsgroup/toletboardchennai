export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
    const session = await getSession();
    if (!session.isLoggedIn || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Auto-create default record if it doesn't exist
        const settings = await prisma.siteSettings.upsert({
            where: { id: 'default' },
            update: {},
            create: { id: 'default' },
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const session = await getSession();
    if (!session.isLoggedIn || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();

        const settings = await prisma.siteSettings.upsert({
            where: { id: 'default' },
            update: body,
            create: { id: 'default', ...body },
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
