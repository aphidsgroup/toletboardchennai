import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// PUT — admin approves/rejects a deletion request
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await req.json();

    const dr = await prisma.changeRequest.update({
        where: { id },
        data: {
            status: body.status, // "approved" or "rejected"
            reviewedBy: body.reviewedBy || 'Admin',
            reviewNote: body.reviewNote || null,
        },
    });

    // If approved, delete the property
    if (body.status === 'approved' && dr.entityId) {
        await prisma.property.delete({ where: { id: dr.entityId } }).catch(() => {});
    }

    return NextResponse.json({ request: dr });
}
