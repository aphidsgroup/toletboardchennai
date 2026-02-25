import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, hashPassword } from '@/lib/auth';

// GET — list all managers
export async function GET() {
    try {
        const session = await getSession();
        if (!session.isLoggedIn || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const managers = await prisma.manager.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                isActive: true,
                permissions: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ managers });
    } catch (error) {
        console.error('Manager list error:', error);
        return NextResponse.json({ error: 'Failed to fetch managers' }, { status: 500 });
    }
}

// POST — create a new manager
export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session.isLoggedIn || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, email, password, permissions } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
        }

        // Check if email already exists
        const existing = await prisma.manager.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: 'A manager with this email already exists' }, { status: 409 });
        }

        const passwordHash = await hashPassword(password);

        const defaultPermissions = {
            viewLeads: true,
            viewUsers: true,
            viewProperties: true,
        };

        const manager = await prisma.manager.create({
            data: {
                name,
                email,
                passwordHash,
                isActive: true,
                permissions: JSON.stringify(permissions || defaultPermissions),
            },
            select: {
                id: true,
                name: true,
                email: true,
                isActive: true,
                permissions: true,
                createdAt: true,
            },
        });

        return NextResponse.json({ manager });
    } catch (error) {
        console.error('Manager create error:', error);
        return NextResponse.json({ error: 'Failed to create manager' }, { status: 500 });
    }
}

// PATCH — update manager (toggle active, update permissions)
export async function PATCH(request: Request) {
    try {
        const session = await getSession();
        if (!session.isLoggedIn || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, isActive, permissions, name, password } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Manager ID required' }, { status: 400 });
        }

        const updateData: Record<string, unknown> = {};
        if (typeof isActive === 'boolean') updateData.isActive = isActive;
        if (permissions) updateData.permissions = JSON.stringify(permissions);
        if (name) updateData.name = name;
        if (password) {
            if (password.length < 6) {
                return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
            }
            updateData.passwordHash = await hashPassword(password);
        }

        const manager = await prisma.manager.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                isActive: true,
                permissions: true,
                createdAt: true,
            },
        });

        return NextResponse.json({ manager });
    } catch (error) {
        console.error('Manager update error:', error);
        return NextResponse.json({ error: 'Failed to update manager' }, { status: 500 });
    }
}

// DELETE — remove a manager
export async function DELETE(request: Request) {
    try {
        const session = await getSession();
        if (!session.isLoggedIn || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Manager ID required' }, { status: 400 });
        }

        await prisma.manager.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Manager delete error:', error);
        return NextResponse.json({ error: 'Failed to delete manager' }, { status: 500 });
    }
}
