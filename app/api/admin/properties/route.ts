import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import { generateSlug } from '@/lib/utils';

export async function GET(request: Request) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        const where: any = {};
        if (search) {
            where.OR = [
                { title: { contains: search } },
                { areaName: { contains: search } },
            ];
        }

        const properties = await prisma.property.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(properties);
    } catch (error) {
        console.error('Error fetching properties:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();

        // Generate slug if not provided
        let slug = body.slug || generateSlug(body.title);

        // Ensure slug is unique
        let counter = 1;
        let uniqueSlug = slug;
        while (await prisma.property.findUnique({ where: { slug: uniqueSlug } })) {
            uniqueSlug = `${slug}-${counter}`;
            counter++;
        }

        const property = await prisma.property.create({
            data: {
                ...body,
                slug: uniqueSlug,
            },
        });

        return NextResponse.json(property, { status: 201 });
    } catch (error) {
        console.error('Error creating property:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
