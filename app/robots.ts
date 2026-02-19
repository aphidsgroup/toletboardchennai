import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toletboardchennai.com';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            // Explicitly allow AI crawlers
            {
                userAgent: 'GPTBot',
                allow: '/',
            },
            {
                userAgent: 'Google-Extended',
                allow: '/',
            },
            {
                userAgent: 'ClaudeBot',
                allow: '/',
            },
            {
                userAgent: 'Applebot-Extended',
                allow: '/',
            },
            {
                userAgent: 'PerplexityBot',
                allow: '/',
            },
            {
                userAgent: 'anthropic-ai',
                allow: '/',
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
