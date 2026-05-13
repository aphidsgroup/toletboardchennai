import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, phone, propertyId, propertyTitle } = body;

        if (!name || !phone || !propertyId || !propertyTitle) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const callbackRequest = await prisma.callbackRequest.create({
            data: {
                name,
                phone,
                propertyId,
                propertyTitle,
            },
        });

        return NextResponse.json(callbackRequest, { status: 201 });
    } catch (error) {
        console.error('Error creating callback request:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const session = await getSession();
    if (!session.isLoggedIn || (session.role !== 'admin' && session.role !== 'manager')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const callbacks = await prisma.callbackRequest.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(callbacks);
    } catch (error) {
        console.error('Error fetching callback requests:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const session = await getSession();
    if (!session.isLoggedIn || (session.role !== 'admin' && session.role !== 'manager')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const updated = await prisma.callbackRequest.update({
            where: { id },
            data: { status },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating callback request:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
