import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET - List all onboarding submissions
export async function GET() {
    try {
        const session = await getSession();
        if (!session.isLoggedIn || (session.role !== 'admin' && session.role !== 'manager')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const submissions = await prisma.onboardingSubmission.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ submissions });
    } catch (error) {
        console.error('Fetch onboarding submissions error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Verify and convert submission to Lead
export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session.isLoggedIn || (session.role !== 'admin' && session.role !== 'manager')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, action } = body;

        if (action === 'delete') {
            await prisma.onboardingSubmission.delete({ where: { id } });
            return NextResponse.json({ success: true });
        }

        const submission = await prisma.onboardingSubmission.findUnique({ where: { id } });
        if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        if (action === 'verify') {
            // Convert to Lead
            await prisma.leadFormResponse.create({
                data: {
                    name: submission.name,
                    phone: submission.phone,
                    email: submission.email,
                    lookingFor: submission.formType === 'tenant' ? 'rent' : 'sell', // Mapping owner to sell for now or custom
                    propertyType: submission.propertyType,
                    budgetRange: submission.budgetRange,
                    preferredArea: submission.preferredAreas || submission.propertyAddress,
                    message: submission.propertyDetails ? `SUBMISSION DETAILS: ${submission.propertyDetails}` : 'From onboarding form',
                }
            });

            // Update status
            await prisma.onboardingSubmission.update({
                where: { id },
                data: { status: 'verified' }
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Verify onboarding submission error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
