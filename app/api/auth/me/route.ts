import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();

        if (!session.isLoggedIn) {
            return NextResponse.json({ user: null });
        }

        // For managers, fetch fresh permissions from DB
        if (session.role === 'manager') {
            const manager = await prisma.manager.findUnique({
                where: { id: session.userId },
                select: { permissions: true, isActive: true, email: true },
            });

            if (!manager || !manager.isActive) {
                // Manager was deactivated — destroy session
                session.destroy();
                return NextResponse.json({ user: null });
            }

            let permissions = null;
            try {
                permissions = manager.permissions ? JSON.parse(manager.permissions) : null;
            } catch { /* ignore */ }

            return NextResponse.json({
                user: {
                    name: session.name,
                    email: manager.email,
                    phone: session.phone,
                    role: session.role,
                    permissions,
                }
            });
        }

        // For admin
        if (session.role === 'admin') {
            return NextResponse.json({
                user: {
                    name: session.name,
                    phone: session.phone,
                    role: session.role,
                }
            });
        }

        // For users — fetch phone from DB
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { phone: true, name: true },
        });

        return NextResponse.json({
            user: {
                name: user?.name || session.name,
                phone: user?.phone || session.phone,
                role: session.role,
            }
        });
    } catch {
        return NextResponse.json({ user: null });
    }
}
