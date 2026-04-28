export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
    const session = await getSession();
    if (!session.isLoggedIn || (session.role !== 'manager' && session.role !== 'admin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        const where: any = {};
        if (search) {
            where.OR = [
                { title: { contains: search } },
                { areaName: { contains: search } },
            ];
        }

        const properties = await prisma.property.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                slug: true,
                areaName: true,
                dealType: true,
                usageType: true,
                priceInr: true,
                isPublished: true,
                createdAt: true,
            },
        });

        return NextResponse.json({ properties });
    } catch (error) {
        console.error('Error fetching properties:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
