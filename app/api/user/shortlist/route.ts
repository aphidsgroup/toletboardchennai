export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET — get user's shortlisted property IDs
export async function GET() {
    try {
        const session = await getSession();
        if (!session.isLoggedIn || session.role !== 'user') {
            return NextResponse.json({ shortlists: [] });
        }

        const shortlists = await prisma.shortlist.findMany({
            where: { userId: session.userId },
            include: {
                property: {
                    select: {
                        id: true,
                        slug: true,
                        title: true,
                        dealType: true,
                        usageType: true,
                        propertySubtype: true,
                        areaName: true,
                        city: true,
                        priceInr: true,
                        isNegotiable: true,
                        sizeSqft: true,
                        bedrooms: true,
                        bathrooms: true,
                        images: true,
                        leasePeriodYears: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ shortlists });
    } catch (error) {
        console.error('Shortlist fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch shortlists' }, { status: 500 });
    }
}

// POST — toggle shortlist (add/remove)
export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session.isLoggedIn || session.role !== 'user') {
            return NextResponse.json({ error: 'Login required' }, { status: 401 });
        }

        const { propertyId } = await request.json();
        if (!propertyId) {
            return NextResponse.json({ error: 'Property ID required' }, { status: 400 });
        }

        // Check if already shortlisted
        const existing = await prisma.shortlist.findUnique({
            where: {
                userId_propertyId: {
                    userId: session.userId,
                    propertyId,
                },
            },
        });

        if (existing) {
            // Remove from shortlist
            await prisma.shortlist.delete({ where: { id: existing.id } });
            return NextResponse.json({ action: 'removed' });
        } else {
            // Add to shortlist
            await prisma.shortlist.create({
                data: {
                    userId: session.userId,
                    propertyId,
                },
            });
            return NextResponse.json({ action: 'added' });
        }
    } catch (error) {
        console.error('Shortlist toggle error:', error);
        return NextResponse.json({ error: 'Failed to update shortlist' }, { status: 500 });
    }
}
