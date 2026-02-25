import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const { name, phone, email, lookingFor, propertyType, budgetRange, preferredArea, message } = body;

        if (!name || !phone) {
            return NextResponse.json(
                { error: 'Name and phone are required' },
                { status: 400 }
            );
        }

        // Save to database
        const lead = await prisma.leadFormResponse.create({
            data: {
                name,
                phone,
                email: email || null,
                lookingFor: lookingFor || 'rent',
                propertyType: propertyType || null,
                budgetRange: budgetRange || null,
                preferredArea: preferredArea || null,
                message: message || null,
            },
        });

        return NextResponse.json({
            success: true,
            leadId: lead.id,
        });
    } catch (error) {
        console.error('Lead submission error:', error);
        return NextResponse.json(
            { error: 'Failed to submit enquiry' },
            { status: 500 }
        );
    }
}

// GET — for manager dashboard to fetch all leads
export async function GET() {
    try {
        const leads = await prisma.leadFormResponse.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ leads });
    } catch (error) {
        console.error('Leads fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
    }
}
