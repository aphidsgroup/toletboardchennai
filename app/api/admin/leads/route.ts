import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/admin/leads — list leads with filters
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // "owner" or "tenant"
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const q = searchParams.get('q');

    const where: any = {};
    if (type) where.leadType = type;
    if (status) where.status = status;
    if (source) where.source = source;
    if (q) {
        where.OR = [
            { name: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q } },
            { email: { contains: q, mode: 'insensitive' } },
            { preferredArea: { contains: q, mode: 'insensitive' } },
            { propertyAddress: { contains: q, mode: 'insensitive' } },
        ];
    }

    const leads = await prisma.lead.findMany({ where, orderBy: { createdAt: 'desc' } });

    // Get status counts for the given type
    const countWhere: any = {};
    if (type) countWhere.leadType = type;

    const statusCounts = await prisma.lead.groupBy({
        by: ['status'],
        where: countWhere,
        _count: true,
    });

    return NextResponse.json({ leads, statusCounts });
}

// POST /api/admin/leads — create a new lead
export async function POST(request: Request) {
    const body = await request.json();

    const lead = await prisma.lead.create({
        data: {
            leadType: body.leadType || 'tenant',
            source: body.source || 'other',
            name: body.name,
            phone: body.phone,
            email: body.email || null,
            whatsappNumber: body.whatsappNumber || null,
            propertyAddress: body.propertyAddress || null,
            propertyType: body.propertyType || null,
            expectedRent: body.expectedRent ? parseInt(body.expectedRent) : null,
            lookingFor: body.lookingFor || null,
            budgetRange: body.budgetRange || null,
            preferredArea: body.preferredArea || null,
            bhkPreference: body.bhkPreference || null,
            status: 'new',
            assignedTo: body.assignedTo || null,
            message: body.message || null,
        },
    });

    return NextResponse.json({ lead }, { status: 201 });
}
