export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session.isLoggedIn || (session.role !== 'admin' && session.role !== 'manager')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { rows, leadType } = await request.json();

        if (!rows || !Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({ error: 'No rows provided' }, { status: 400 });
        }

        if (rows.length > 500) {
            return NextResponse.json({ error: 'Maximum 500 rows per import' }, { status: 400 });
        }

        let imported = 0;
        let skipped = 0;
        const errors: string[] = [];

        for (const row of rows) {
            // name and phone are mandatory
            const name = String(row.name || '').trim();
            const phone = String(row.phone || '').replace(/\D/g, '').slice(-10);

            if (!name || !phone || phone.length < 7) {
                skipped++;
                continue;
            }

            // Skip duplicates (same phone + leadType already in DB)
            const existing = await prisma.lead.findFirst({
                where: { phone: { endsWith: phone }, leadType },
            });
            if (existing) { skipped++; continue; }

            try {
                await prisma.lead.create({
                    data: {
                        leadType,
                        source: row.source || 'other',
                        name,
                        phone,
                        email: row.email ? String(row.email).trim() : null,
                        whatsappNumber: row.whatsappNumber ? String(row.whatsappNumber).replace(/\D/g, '').slice(-10) : null,
                        // Owner fields
                        propertyAddress: row.propertyAddress ? String(row.propertyAddress).trim() : null,
                        propertyType: row.propertyType ? String(row.propertyType).trim() : null,
                        expectedRent: row.expectedRent ? parseInt(String(row.expectedRent).replace(/\D/g, '')) || null : null,
                        // Tenant fields
                        lookingFor: row.lookingFor ? String(row.lookingFor).trim() : null,
                        budgetRange: row.budgetRange ? String(row.budgetRange).trim() : null,
                        preferredArea: row.preferredArea ? String(row.preferredArea).trim() : null,
                        bhkPreference: row.bhkPreference ? String(row.bhkPreference).trim() : null,
                        // Common
                        message: row.message ? String(row.message).trim() : null,
                        assignedTo: row.assignedTo ? String(row.assignedTo).trim() : null,
                        status: row.status || 'new',
                    },
                });
                imported++;
            } catch (err) {
                errors.push(`Row "${name}": ${err instanceof Error ? err.message : 'failed'}`);
                skipped++;
            }
        }

        return NextResponse.json({ imported, skipped, errors: errors.slice(0, 10) });
    } catch (error) {
        console.error('Lead import error:', error);
        return NextResponse.json({ error: 'Import failed' }, { status: 500 });
    }
}
