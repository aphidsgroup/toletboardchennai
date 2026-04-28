import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toletboardchennai.com';

    // Fetch all published properties (gracefully handle DB errors during build)
    let properties: { slug: string; updatedAt: Date }[] = [];
    try {
        properties = await prisma.property.findMany({
            where: { isPublished: true },
            select: { slug: true, updatedAt: true },
            orderBy: { updatedAt: 'desc' },
        });
    } catch {
        // DB not available during build — return static pages only
    }

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: siteUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${siteUrl}/list`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.9,
        },
        {
            url: `${siteUrl}/list?dealType=rent`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.8,
        },
        {
            url: `${siteUrl}/list?dealType=lease`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.8,
        },
        {
            url: `${siteUrl}/list?usageType=residential`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.7,
        },
        {
            url: `${siteUrl}/list?usageType=commercial`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.7,
        },
    ];

    // Dynamic property pages
    const propertyPages: MetadataRoute.Sitemap = properties.map((property) => ({
        url: `${siteUrl}/p/${property.slug}`,
        lastModified: property.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [...staticPages, ...propertyPages];
}
