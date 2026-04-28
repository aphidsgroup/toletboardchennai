import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET — list all pending deletion-type change requests
export async function GET() {
    const requests = await prisma.changeRequest.findMany({
        where: { type: 'delete_property' },
        orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ requests });
}

// POST — manager creates a deletion request (via ChangeRequest)
export async function POST(req: Request) {
    const body = await req.json();
    const dr = await prisma.changeRequest.create({
        data: {
            type: 'delete_property',
            entityType: 'property',
            entityId: body.propertyId,
            entityTitle: body.propertyTitle,
            requestedBy: body.requestedBy,
            reason: body.reason || null,
        },
    });
    return NextResponse.json({ request: dr }, { status: 201 });
}
