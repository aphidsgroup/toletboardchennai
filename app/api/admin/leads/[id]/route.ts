import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET single lead
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ lead });
}

// PUT — update lead (status, notes, leadType switch, etc.)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await req.json();

    const updateData: any = {};

    // Allow updating any field
    const allowedFields = [
        'leadType', 'source', 'name', 'phone', 'email', 'whatsappNumber',
        'propertyAddress', 'propertyType', 'expectedRent',
        'lookingFor', 'budgetRange', 'preferredArea', 'bhkPreference',
        'status', 'assignedTo', 'followUpDate', 'notes',
        'closedVia', 'closedPropertyId', 'message',
    ];

    for (const field of allowedFields) {
        if (body[field] !== undefined) {
            if (field === 'expectedRent' && body[field] !== null) {
                updateData[field] = parseInt(body[field]);
            } else if (field === 'followUpDate' && body[field]) {
                updateData[field] = new Date(body[field]);
            } else {
                updateData[field] = body[field];
            }
        }
    }

    // Handle adding a note (append to existing notes JSON array)
    if (body.addNote) {
        const existing = await prisma.lead.findUnique({ where: { id }, select: { notes: true } });
        const currentNotes = existing?.notes ? JSON.parse(existing.notes) : [];
        currentNotes.push({
            date: new Date().toISOString(),
            note: body.addNote.note,
            by: body.addNote.by || 'Admin',
        });
        updateData.notes = JSON.stringify(currentNotes);
    }

    const lead = await prisma.lead.update({ where: { id }, data: updateData });
    return NextResponse.json({ lead });
}

// DELETE
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
