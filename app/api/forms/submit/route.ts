import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            formType,
            name,
            phone,
            whatsappNumber,
            email,
            wantsWhatsappUpdates,
            tenantType,
            preferredAreas,
            propertyType,
            budgetRange,
            bedrooms,
            moveInDate,
            propertyAddress,
            propertyDetails
        } = body;

        if (!formType || !name || !phone) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const submission = await prisma.onboardingSubmission.create({
            data: {
                formType,
                name,
                phone,
                whatsappNumber,
                email,
                wantsWhatsappUpdates: !!wantsWhatsappUpdates,
                tenantType,
                preferredAreas,
                propertyType,
                budgetRange,
                bedrooms,
                moveInDate: moveInDate ? new Date(moveInDate) : null,
                propertyAddress,
                propertyDetails: propertyDetails ? JSON.stringify(propertyDetails) : null,
            }
        });

        return NextResponse.json({ success: true, id: submission.id });
    } catch (error) {
        console.error('Form submission error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
