import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.toletboardchennai.in';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/api/',
                    '/account',
                    '/forms/',
                    '/login',
                    '/manager/',
                    '/p/',
                    '/register',
                    '/shortlist',
                ],
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
