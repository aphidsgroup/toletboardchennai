export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET — list change requests (optionally filter by status)
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';
    const where: any = {};
    if (status !== 'all') where.status = status;
    const requests = await prisma.changeRequest.findMany({ where, orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ requests });
}

// POST — manager submits a change request
export async function POST(req: Request) {
    const body = await req.json();
    const cr = await prisma.changeRequest.create({
        data: {
            type: body.type,
            entityType: body.entityType,
            entityId: body.entityId,
            entityTitle: body.entityTitle,
            changes: body.changes ? JSON.stringify(body.changes) : null,
            reason: body.reason || null,
            requestedBy: body.requestedBy || 'Manager',
        },
    });
    return NextResponse.json({ request: cr }, { status: 201 });
}
