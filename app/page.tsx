import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import PropertySlider from '@/components/PropertySlider';
import SearchBar from '@/components/SearchBar';

export const metadata: Metadata = {
    title: 'Tolet Board Chennai - 360° Virtual Property Tours | Rent & Lease Properties',
    description: 'Find your perfect property in Chennai with immersive 360° virtual tours. Browse apartments, villas, offices, shops and more. Rent or lease residential and commercial properties across Chennai.',
};

async function getSiteSettings() {
    const settings = await prisma.siteSettings.findUnique({
        where: { id: 'default' },
    });
    return settings;
}

async function getPublishedProperties() {
    return await prisma.property.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            slug: true,
            title: true,
            dealType: true,
            usageType: true,
            areaName: true,
            city: true,
            priceInr: true,
            sizeSqft: true,
            bedrooms: true,
            bathrooms: true,
            images: true,
        },
    });
}

export default async function HomePage() {
    const settings = await getSiteSettings();
    const properties = await getPublishedProperties();

    const whatsappUrl = `https://wa.me/${settings?.whatsappNumber?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hi, I want to know more about properties - Tolet Board Chennai')}`;
    const callUrl = `tel:${settings?.phoneNumber}`;

    // Category config
    const categories = [
        { label: 'Apartment', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', href: '/list?subtype=Apartment' },
        { label: 'Villa / House', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', href: '/list?subtype=Villa' },
        { label: 'Office Space', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', href: '/list?subtype=Office' },
        { label: 'Shop / Retail', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', href: '/list?subtype=Shop' },
        { label: 'Warehouse', icon: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z', href: '/list?subtype=Warehouse' },
        { label: 'PG / Co-living', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', href: '/list?subtype=PG' },
    ];
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toletboardchennai.com';

    // Homepage JSON-LD
    const homepageJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Property Categories in Chennai',
        itemListElement: categories.map((cat, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: cat.label,
            url: `${siteUrl}${cat.href}`,
        })),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageJsonLd) }}
            />
            <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
                <div className="container mx-auto px-4 py-8 max-w-2xl">
                    {/* Header */}
                    <header className="text-center mb-8 animate-fade-in">
                        <div className="mb-4">
                            <div className="w-28 h-28 mx-auto rounded-full shadow-lg overflow-hidden">
                                <img
                                    src="/logo.png"
                                    alt="Tolet Board Chennai"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2 whitespace-nowrap">
                            {settings?.brandName || 'Tolet Board Chennai'}
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            {settings?.tagline || '360° Tours • Rent & Lease • Chennai'}
                        </p>
                    </header>

                    {/* Search */}
                    <div className="mb-6">
                        <SearchBar />
                    </div>

                    {/* Primary CTAs */}
                    <div className="space-y-4 mb-8">
                        <Link
                            href="/list?deal=rent"
                            className="block w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center"
                        >
                            <div className="flex items-center justify-center gap-2">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span>View Rental Properties</span>
                            </div>
                        </Link>

                        <Link
                            href="/list?deal=lease"
                            className="block w-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center"
                        >
                            <div className="flex items-center justify-center gap-2">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span>View Lease Properties</span>
                            </div>
                        </Link>

                        <div className="grid grid-cols-2 gap-4">
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                    <span className="text-sm">WhatsApp</span>
                                </div>
                            </a>

                            <a
                                href={callUrl}
                                className="block w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span className="text-sm">Call Us</span>
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* Properties Slider */}
                    {properties.length > 0 && (
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Latest Properties
                                </h2>
                                <Link
                                    href="/list"
                                    className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                                >
                                    View All →
                                </Link>
                            </div>
                            <PropertySlider properties={properties} />
                        </div>
                    )}

                    {/* Browse by Category */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Browse by Category
                        </h2>
                        <div className="grid grid-cols-3 gap-3">
                            {categories.map((cat) => (
                                <Link
                                    key={cat.label}
                                    href={cat.href}
                                    className="block bg-white dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 text-center group"
                                >
                                    <svg className="w-7 h-7 mx-auto mb-2 text-primary-500 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={cat.icon} />
                                    </svg>
                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                                        {cat.label}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Browse by Type */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Browse by Type
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <Link
                                href="/list?use=residential"
                                className="block bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 text-center"
                            >
                                <svg className="w-8 h-8 mx-auto mb-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span className="font-semibold text-gray-900 dark:text-white">Residential</span>
                            </Link>

                            <Link
                                href="/list?use=commercial"
                                className="block bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 text-center"
                            >
                                <svg className="w-8 h-8 mx-auto mb-2 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span className="font-semibold text-gray-900 dark:text-white">Commercial</span>
                            </Link>
                        </div>
                    </div>



                    {/* Footer */}
                    <footer className="text-center text-sm text-gray-500 dark:text-gray-400 mt-12">
                        <p>© 2026 {settings?.brandName || 'Tolet Board Chennai'}. All rights reserved.</p>
                    </footer>
                </div>
            </main>
        </>
    );
}
