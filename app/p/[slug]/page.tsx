import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import {
    formatPrice,
    formatSize,
    parseTopFacilities,
    parseLocationAdvantages,
    parsePropertyDetails,
    parseCustomSections,
    parseSectionOrder,
    parseSectionNames,
    buildWhatsAppUrl,
    DEFAULT_SECTION_ORDER,
    DEFAULT_SECTION_NAMES,
    type CustomSection,
    type PropertyDetail,
    type LocationAdvantage,
    type SectionNames,
} from '@/lib/utils';
import ContactBar from '@/components/ContactBar';
import TeleportMeEmbed from '@/components/TeleportMeEmbed';
import FacilitiesAndLocations from '@/components/FacilitiesAndLocations';
import FloatingShortlistButton from '@/components/FloatingShortlistButton';
import PropertySlider from '@/components/PropertySlider';

interface PropertyPageProps {
    params: Promise<{
        slug: string;
    }>;
}

async function getProperty(slug: string) {
    const property = await prisma.property.findUnique({
        where: { slug, isPublished: true },
    });
    return property;
}

async function getSiteSettings() {
    const settings = await prisma.siteSettings.findUnique({
        where: { id: 'default' },
    });
    return settings;
}

async function getSimilarProperties(property: { id: string; areaName: string; usageType: string; dealType: string }) {
    const similar = await prisma.property.findMany({
        where: {
            isPublished: true,
            id: { not: property.id },
            OR: [
                { areaName: property.areaName },
                { usageType: property.usageType },
                { dealType: property.dealType },
            ],
        },
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
            leasePeriodYears: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
    });
    return similar;
}

// Dynamic SEO metadata per property
export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
    const { slug } = await params;
    const property = await getProperty(slug);

    if (!property) {
        return { title: 'Property Not Found' };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toletboardchennai.com';
    const propertyUrl = `${siteUrl}/p/${property.slug}`;
    const description = `${property.title} - ${formatPrice(property.priceInr)}/mo | ${formatSize(property.sizeSqft)} | ${property.areaName}, ${property.city}. ${property.dealType === 'rent' ? 'Available for rent' : 'Available for lease'} with 360° virtual tour.`;
    const images = property.images ? JSON.parse(property.images) : [];
    const ogImage = images.length > 0 ? images[0] : `${siteUrl}/logo.png`;

    return {
        title: `${property.title} | ${property.areaName} | Tolet Board Chennai`,
        description,
        keywords: [
            property.title,
            property.areaName,
            property.city,
            property.dealType,
            property.usageType,
            property.propertySubtype || '',
            '360 virtual tour',
            'rent chennai',
            'lease chennai',
            'tolet board chennai',
        ].filter(Boolean),
        alternates: {
            canonical: propertyUrl,
        },
        openGraph: {
            title: `${property.title} | ${formatPrice(property.priceInr)}/mo`,
            description,
            url: propertyUrl,
            siteName: 'Tolet Board Chennai',
            type: 'website',
            images: [{ url: ogImage, width: 1200, height: 630, alt: property.title }],
            locale: 'en_IN',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${property.title} | ${formatPrice(property.priceInr)}/mo`,
            description,
            images: [ogImage],
        },
    };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
    const { slug } = await params;

    // Gate: require login to view property
    const session = await getSession();
    if (!session.isLoggedIn) {
        redirect(`/login?redirect=/p/${encodeURIComponent(slug)}`);
    }

    const property = await getProperty(slug);
    const [settings, similarProperties] = await Promise.all([
        getSiteSettings(),
        getProperty(slug).then(p => p ? getSimilarProperties(p) : []),
    ]);

    if (!property) {
        notFound();
    }

    // Parse dynamic data
    const topFacilities = parseTopFacilities(property.topFacilities);
    const locationAdvantages = parseLocationAdvantages(property.locationAdvantages);
    const propertyDetails = parsePropertyDetails(property.propertyDetails);
    const customSections = parseCustomSections(property.customSections);
    const sectionOrder = parseSectionOrder(property.sectionOrder);
    const sectionNameOverrides = parseSectionNames((property as any).sectionNames);

    // Merge default names with overrides
    const sectionNames: SectionNames = { ...DEFAULT_SECTION_NAMES, ...sectionNameOverrides };

    // Use saved order or default
    const orderedSections = sectionOrder.length > 0 ? sectionOrder : DEFAULT_SECTION_ORDER;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toletboardchennai.com';
    const propertyUrl = `${siteUrl}/p/${property.slug}`;

    const whatsappUrl = buildWhatsAppUrl(
        settings?.whatsappNumber || '+919876543210',
        settings?.whatsappTemplate || 'Hi, I\'m interested in {propertyTitle}. Link: {propertyUrl}',
        property.title,
        propertyUrl
    );
    const callUrl = `tel:${settings?.phoneNumber || '+919876543210'}`;

    // JSON-LD Structured Data for AI/Search engines
    const images = property.images ? JSON.parse(property.images) : [];
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        name: property.title,
        description: `${property.title} available for ${property.dealType} in ${property.areaName}, ${property.city}`,
        url: propertyUrl,
        datePosted: property.createdAt.toISOString(),
        ...(images.length > 0 && { image: images }),
        offers: {
            '@type': 'Offer',
            price: property.priceInr,
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
        },
        address: {
            '@type': 'PostalAddress',
            addressLocality: property.areaName,
            addressRegion: property.city,
            addressCountry: 'IN',
        },
        floorSize: {
            '@type': 'QuantitativeValue',
            value: property.sizeSqft,
            unitCode: 'FTK',
        },
        ...(property.bedrooms && { numberOfRooms: property.bedrooms }),
        ...(property.bathrooms && { numberOfBathroomsTotal: property.bathrooms }),
        ...(property.tourEmbedUrl && {
            virtualTour: {
                '@type': 'VirtualLocation',
                url: property.tourEmbedUrl,
            },
        }),
    };

    // Helper to get section name
    const getSectionName = (key: string) => {
        return sectionNameOverrides[key] || sectionNames[key] || key;
    };

    // Section renderers
    const renderSection = (sectionId: string) => {
        switch (sectionId) {
            case 'basic-info':
                return (
                    <div key="basic-info" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            {getSectionName('basic-info')}
                        </h2>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Price</p>
                                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                        {formatPrice(property.priceInr)}{property.dealType === 'rent' ? '/mo' : ''}
                                    </p>
                                    {property.isNegotiable && (
                                        <span className="inline-block mt-1 px-2.5 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold rounded-full">
                                            Negotiable
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Size</p>
                                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {formatSize(property.sizeSqft)}
                                    </p>
                                </div>
                                {property.bedrooms !== null && property.bedrooms > 0 && (
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Bedrooms</p>
                                        <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                            {property.bedrooms} BHK
                                        </p>
                                    </div>
                                )}
                                {property.bathrooms && (
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Bathrooms</p>
                                        <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                            {property.bathrooms}
                                        </p>
                                    </div>
                                )}
                                {property.parking && (
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Parking</p>
                                        <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                            {property.parking}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Furnishing</p>
                                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {property.furnishing || 'Unfurnished'}
                                    </p>
                                </div>
                                {property.dealType === 'rent' && property.advanceMonths && (
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Advance</p>
                                        <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                            {property.advanceMonths} months
                                        </p>
                                    </div>
                                )}
                                {property.dealType === 'lease' && property.leasePeriodYears && (
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Lease Period</p>
                                        <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                            {property.leasePeriodYears} {property.leasePeriodYears === 1 ? 'year' : 'years'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                            One-time payment
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 'tour':
                if (!property.tourEmbedUrl) return null;
                return (
                    <div key="tour" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            {getSectionName('tour')}
                        </h2>
                        <div className="relative w-full bg-gray-900 rounded-2xl overflow-hidden shadow-2xl md:pb-[56.25%] pb-[133%]">
                            {(() => {
                                const isTeleportMe = property.tourEmbedUrl!.includes('tours.realprop360.in') || property.tourEmbedUrl!.includes('teleportme');
                                return isTeleportMe ? (
                                    <TeleportMeEmbed tourUrl={property.tourEmbedUrl!} />
                                ) : (
                                    <iframe
                                        src={property.tourEmbedUrl!}
                                        className="absolute top-0 left-0 w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                        allowFullScreen
                                        loading="lazy"
                                        title={`360° Tour of ${property.title}`}
                                    />
                                );
                            })()}
                        </div>
                    </div>
                );

            case 'specifications':
                if (!(property.floorNumber || property.tenantPreference || property.carpetAreaSqft || property.availableFrom || property.propertyAge)) return null;
                return (
                    <div key="specifications" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            {getSectionName('specifications')}
                        </h2>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {property.floorNumber && property.totalFloors && (
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-lg">
                                            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                                {property.floorNumber} out of {property.totalFloors} floors
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Floor Details</p>
                                        </div>
                                    </div>
                                )}
                                {property.tenantPreference && (
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-lg">
                                            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                                For {property.tenantPreference}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Tenant Preference</p>
                                        </div>
                                    </div>
                                )}
                                {property.carpetAreaSqft && (
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-lg">
                                            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                                {formatSize(property.carpetAreaSqft)} Carpet Area
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">({Math.round(property.carpetAreaSqft * 0.092903)} sq.m.)</p>
                                        </div>
                                    </div>
                                )}
                                {property.availableFrom && (
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-lg">
                                            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                                Available from {new Date(property.availableFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Availability</p>
                                        </div>
                                    </div>
                                )}
                                {property.propertyAge && (
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-lg">
                                            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                                {property.propertyAge} Old Property
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Property Age</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 'additional-details':
                // This was the old duplicate "Specifications" (price/size/bhk) — now merged into basic-info
                return null;

            case 'property-details':
                if (propertyDetails.length === 0) return null;
                return (
                    <div key="property-details" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            {getSectionName('property-details')}
                        </h2>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                            <div className="space-y-3">
                                {propertyDetails.map((detail: PropertyDetail, index: number) => (
                                    <div
                                        key={index}
                                        className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                                    >
                                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                                            {detail.key}
                                        </span>
                                        <span className="font-semibold text-gray-900 dark:text-white text-sm">
                                            {detail.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'facilities':
                if (topFacilities.length === 0 && locationAdvantages.length === 0) return null;
                return (
                    <div key="facilities">
                        <FacilitiesAndLocations
                            topFacilities={topFacilities}
                            locationAdvantages={locationAdvantages}
                        />
                    </div>
                );

            case 'locations':
                // Handled together with facilities
                return null;

            default:
                // Custom sections
                const customSection = customSections.find((s: CustomSection) => s.id === sectionId);
                if (!customSection) return null;
                return (
                    <div key={sectionId} className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            {customSection.title}
                        </h2>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                            {customSection.type === 'keyvalue' && Array.isArray(customSection.content) ? (
                                <div className="space-y-3">
                                    {(customSection.content as PropertyDetail[]).map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                                        >
                                            <span className="text-gray-600 dark:text-gray-400 text-sm">{item.key}</span>
                                            <span className="font-semibold text-gray-900 dark:text-white text-sm">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                    {typeof customSection.content === 'string' ? customSection.content : ''}
                                </p>
                            )}
                        </div>
                    </div>
                );
        }
    };

    return (
        <>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
                {/* Header */}
                <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <Link href="/list" className="flex items-center gap-2 text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                <span className="font-semibold">Back to Listings</span>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="container mx-auto px-4 py-6 max-w-4xl">
                    {/* Title & Location */}
                    <div className="mb-6">
                        <div className="flex items-start justify-between gap-4 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {property.title}
                            </h1>
                            <div className="flex flex-col gap-2">
                                <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm font-semibold rounded-full uppercase whitespace-nowrap">
                                    {property.dealType}
                                </span>
                                <span className="px-3 py-1 bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300 text-sm font-semibold rounded-full capitalize whitespace-nowrap">
                                    {property.usageType}
                                </span>
                            </div>
                        </div>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            {property.areaName}, {property.city}
                        </p>
                        {property.propertySubtype && (
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                                {property.propertySubtype}
                            </p>
                        )}
                    </div>

                    {/* Dynamic Sections - rendered in order */}
                    {orderedSections.map((sectionId: string) => renderSection(sectionId))}

                    {/* Contact Info */}
                    <div className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 text-center">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Interested in this property?
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Contact us via WhatsApp, call, or share this listing
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                            Use the buttons below to get in touch
                        </p>
                    </div>

                    {/* People Also Viewed */}
                    {similarProperties.length > 0 && (
                        <div className="mt-2">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                People Also Viewed
                            </h2>
                            <PropertySlider properties={similarProperties} />
                        </div>
                    )}
                </div>

                {/* Floating Shortlist Button */}
                <FloatingShortlistButton propertyId={property.id} />

                {/* Contact Bar */}
                <ContactBar
                    whatsappUrl={whatsappUrl}
                    callUrl={callUrl}
                    propertyTitle={property.title}
                />
            </main>
        </>
    );
}
