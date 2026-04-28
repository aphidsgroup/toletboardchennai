import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// PUT — admin approves or rejects
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await req.json();

    const cr = await prisma.changeRequest.update({
        where: { id },
        data: { status: body.status, reviewedBy: body.reviewedBy || 'Admin', reviewNote: body.reviewNote || null },
    });

    // If approved, apply the change
    if (body.status === 'approved') {
        try {
            if (cr.type === 'delete_property') {
                await prisma.property.delete({ where: { id: cr.entityId } });
                revalidatePath('/'); revalidatePath('/list');
            } else if (cr.type === 'edit_property' && cr.changes) {
                const changes = JSON.parse(cr.changes);
                await prisma.property.update({ where: { id: cr.entityId }, data: changes });
                revalidatePath('/'); revalidatePath('/list');
            } else if (cr.type === 'delete_lead') {
                await prisma.lead.delete({ where: { id: cr.entityId } });
            } else if (cr.type === 'edit_lead' && cr.changes) {
                const changes = JSON.parse(cr.changes);
                await prisma.lead.update({ where: { id: cr.entityId }, data: changes });
            } else if (cr.type === 'status_lead' && cr.changes) {
                const changes = JSON.parse(cr.changes);
                await prisma.lead.update({ where: { id: cr.entityId }, data: { status: changes.status } });
            } else if (cr.type === 'switch_lead' && cr.changes) {
                const changes = JSON.parse(cr.changes);
                await prisma.lead.update({ where: { id: cr.entityId }, data: { leadType: changes.leadType } });
            }
        } catch (e) { console.error('Error applying change:', e); }
    }

    return NextResponse.json({ request: cr });
}
