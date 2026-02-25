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
                select: { permissions: true, isActive: true },
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
                    email: session.email,
                    role: session.role,
                    permissions,
                }
            });
        }

        return NextResponse.json({
            user: {
                name: session.name,
                email: session.email,
                role: session.role,
            }
        });
    } catch {
        return NextResponse.json({ user: null });
    }
}
