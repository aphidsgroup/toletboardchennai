export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

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

        // Input sanitization
        const cleanName = String(name).trim().slice(0, 100);
        const cleanPhone = String(phone).replace(/\D/g, '').slice(0, 15);
        if (cleanPhone.length < 10) {
            return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
        }

        // Save to database
        const lead = await prisma.leadFormResponse.create({
            data: {
                name: cleanName,
                phone: cleanPhone,
                email: email ? String(email).trim().slice(0, 100) : null,
                lookingFor: lookingFor || 'rent',
                propertyType: propertyType ? String(propertyType).trim().slice(0, 50) : null,
                budgetRange: budgetRange ? String(budgetRange).trim().slice(0, 50) : null,
                preferredArea: preferredArea ? String(preferredArea).trim().slice(0, 100) : null,
                message: message ? String(message).trim().slice(0, 500) : null,
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
        const session = await getSession();
        if (!session.isLoggedIn || (session.role !== 'admin' && session.role !== 'manager')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const leads = await prisma.leadFormResponse.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ leads });
    } catch (error) {
        console.error('Leads fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
    }
}
