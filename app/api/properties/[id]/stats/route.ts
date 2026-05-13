import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const property = await prisma.property.findUnique({
            where: { id },
            select: {
                viewCount: true,
                _count: {
                    select: { shortlists: true }
                }
            }
        });

        if (!property) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }

        return NextResponse.json({
            viewCount: property.viewCount,
            shortlistCount: property._count.shortlists
        });
    } catch (error) {
        console.error('Error fetching property stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Increment view count
        const updatedProperty = await prisma.property.update({
            where: { id },
            data: {
                viewCount: {
                    increment: 1
                }
            },
            select: {
                viewCount: true,
                _count: {
                    select: { shortlists: true }
                }
            }
        });

        return NextResponse.json({
            viewCount: updatedProperty.viewCount,
            shortlistCount: updatedProperty._count.shortlists
        });
    } catch (error) {
        console.error('Error updating property stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
