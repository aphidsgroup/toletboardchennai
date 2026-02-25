import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, hashPassword, verifyPassword } from '@/lib/auth';

// POST — change own password (admin or user)
export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session.isLoggedIn) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Current and new password are required' }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
        }

        if (session.role === 'admin') {
            // Admin password change
            const admin = await prisma.admin.findUnique({ where: { email: session.email } });
            if (!admin) {
                return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
            }

            const valid = await verifyPassword(currentPassword, admin.passwordHash);
            if (!valid) {
                return NextResponse.json({ error: 'Current password is incorrect' }, { status: 403 });
            }

            const newHash = await hashPassword(newPassword);
            await prisma.admin.update({
                where: { id: admin.id },
                data: { passwordHash: newHash },
            });
        } else if (session.role === 'user') {
            // User password change
            const user = await prisma.user.findUnique({ where: { email: session.email } });
            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            const valid = await verifyPassword(currentPassword, user.passwordHash);
            if (!valid) {
                return NextResponse.json({ error: 'Current password is incorrect' }, { status: 403 });
            }

            const newHash = await hashPassword(newPassword);
            await prisma.user.update({
                where: { id: user.id },
                data: { passwordHash: newHash },
            });
        } else {
            return NextResponse.json({ error: 'Password change not allowed for this role' }, { status: 403 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Password change error:', error);
        return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
    }
}
