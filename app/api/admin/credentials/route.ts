export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, hashPassword, verifyPassword } from '@/lib/auth';

/**
 * POST /api/admin/credentials
 * Admin can:
 *   - Change their own email and/or password (requires current password to verify)
 *   - Change any manager's email and/or password (no current password needed — admin override)
 *
 * Body:
 *   { target: 'admin', currentPassword, newEmail?, newPassword? }
 *   { target: 'manager', managerId, newEmail?, newPassword?, newName? }
 */
export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session.isLoggedIn || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { target } = body;

        // ── Change admin's own credentials ──────────────────────────────────────
        if (target === 'admin') {
            const { currentPassword, newEmail, newPassword } = body;

            if (!currentPassword) {
                return NextResponse.json(
                    { error: 'Current password is required to update admin credentials' },
                    { status: 400 }
                );
            }

            if (!newEmail && !newPassword) {
                return NextResponse.json(
                    { error: 'Provide at least a new email or new password' },
                    { status: 400 }
                );
            }

            const admin = await prisma.admin.findUnique({ where: { id: session.userId } });
            if (!admin) {
                return NextResponse.json({ error: 'Admin account not found' }, { status: 404 });
            }

            const valid = await verifyPassword(currentPassword, admin.passwordHash);
            if (!valid) {
                return NextResponse.json(
                    { error: 'Current password is incorrect' },
                    { status: 403 }
                );
            }

            const updateData: Record<string, string> = {};

            if (newEmail && newEmail !== admin.email) {
                // Check email not taken
                const existing = await prisma.admin.findFirst({ where: { email: newEmail } });
                if (existing) {
                    return NextResponse.json({ error: 'That email is already in use' }, { status: 409 });
                }
                updateData.email = newEmail;
            }

            if (newPassword) {
                if (newPassword.length < 8) {
                    return NextResponse.json(
                        { error: 'New password must be at least 8 characters' },
                        { status: 400 }
                    );
                }
                updateData.passwordHash = await hashPassword(newPassword);
            }

            if (Object.keys(updateData).length === 0) {
                return NextResponse.json({ message: 'No changes made' });
            }

            await prisma.admin.update({ where: { id: admin.id }, data: updateData });
            return NextResponse.json({ success: true, message: 'Admin credentials updated' });
        }

        // ── Change a manager's credentials ──────────────────────────────────────
        if (target === 'manager') {
            const { managerId, newEmail, newPassword, newName } = body;

            if (!managerId) {
                return NextResponse.json({ error: 'Manager ID is required' }, { status: 400 });
            }

            if (!newEmail && !newPassword && !newName) {
                return NextResponse.json(
                    { error: 'Provide at least one field to update (name, email, or password)' },
                    { status: 400 }
                );
            }

            const manager = await prisma.manager.findUnique({ where: { id: managerId } });
            if (!manager) {
                return NextResponse.json({ error: 'Manager not found' }, { status: 404 });
            }

            const updateData: Record<string, string> = {};

            if (newName) updateData.name = newName;

            if (newEmail && newEmail !== manager.email) {
                const existing = await prisma.manager.findUnique({ where: { email: newEmail } });
                if (existing) {
                    return NextResponse.json({ error: 'That email is already used by another manager' }, { status: 409 });
                }
                updateData.email = newEmail;
            }

            if (newPassword) {
                if (newPassword.length < 6) {
                    return NextResponse.json(
                        { error: 'Manager password must be at least 6 characters' },
                        { status: 400 }
                    );
                }
                updateData.passwordHash = await hashPassword(newPassword);
            }

            if (Object.keys(updateData).length === 0) {
                return NextResponse.json({ message: 'No changes made' });
            }

            await prisma.manager.update({ where: { id: managerId }, data: updateData });
            return NextResponse.json({ success: true, message: 'Manager credentials updated' });
        }

        return NextResponse.json({ error: 'Invalid target. Use "admin" or "manager"' }, { status: 400 });
    } catch (error) {
        console.error('Credentials update error:', error);
        return NextResponse.json({ error: 'Failed to update credentials' }, { status: 500 });
    }
}
