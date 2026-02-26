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
import PropertyLeadForm from '@/components/PropertyLeadForm';

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
    const description = `${property.title} - ${formatPrice(property.priceInr)}/mo | ${formatSize(property.sizeSqft)} | ${property.areaName}, ${property.city}. ${property.dealType === 'rent' ? 'Available for rent' : 'Available for lease'} with 360Â° virtual tour.`;
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
        redirect(`/register?redirect=/p/${encodeURIComponent(slug)}`);
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
    const bhkLabel = property.bedrooms ? `${property.bedrooms} BHK` : '';
    const propertyTypeLabel = property.propertySubtype || property.usageType;
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        name: property.title,
        description: `${bhkLabel ? bhkLabel + ' ' : ''}${propertyTypeLabel} available for ${property.dealType} in ${property.areaName}, ${property.city}. ${formatSize(property.sizeSqft)}, ${formatPrice(property.priceInr)}${property.dealType === 'rent' ? '/month' : ''}.${property.tourEmbedUrl ? ' 360Â° virtual tour available.' : ''}`,
        url: propertyUrl,
        datePosted: property.createdAt.toISOString(),
        ...(images.length > 0 && { image: images }),
        offers: {
            '@type': 'Offer',
            price: property.priceInr,
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
            ...(property.isNegotiable && { priceSpecification: { '@type': 'PriceSpecification', price: property.priceInr, priceCurrency: 'INR', description: 'Negotiable' } }),
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
        ...(property.propertySubtype && { propertyType: property.propertySubtype }),
        ...(property.tourEmbedUrl && {
            virtualTour: {
                '@type': 'VirtualLocation',
                url: property.tourEmbedUrl,
            },
        }),
    };

    // FAQ Schema for AEO (Answer Engine Optimization)
    const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: `What types of properties are available for ${property.dealType} in ${property.areaName}, Chennai?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `${property.areaName} in Chennai offers a variety of properties for ${property.dealType} including apartments, independent houses, and commercial spaces. This listing is a ${bhkLabel ? bhkLabel + ' ' : ''}${propertyTypeLabel} spanning ${formatSize(property.sizeSqft)} at ${formatPrice(property.priceInr)}${property.dealType === 'rent' ? '/month' : ''}.`,
                },
            },
            {
                '@type': 'Question',
                name: `What is the average ${property.dealType} price in ${property.areaName}, Chennai?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `${property.dealType === 'rent' ? 'Rental' : 'Lease'} prices in ${property.areaName} vary based on property size and type. This ${bhkLabel ? bhkLabel + ' ' : ''}${propertyTypeLabel} is ${property.dealType === 'rent' ? 'available at' : 'listed for'} ${formatPrice(property.priceInr)}${property.dealType === 'rent' ? '/month' : ''}${property.isNegotiable ? ' (negotiable)' : ''}. Browse more listings on Tolet Board Chennai to compare prices.`,
                },
            },
            {
                '@type': 'Question',
                name: `Is ${property.areaName} well-connected to public transport and IT corridors in Chennai?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `${property.areaName} is a well-established locality in Chennai with good connectivity to major IT corridors, bus routes, and metro stations. Properties here are popular among families and professionals. Explore this listing with a 360Â° virtual tour on Tolet Board Chennai.`,
                },
            },
        ],
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
                                    <TeleportMeEmbed tourUrl={property.tourEmbedUrl!} propertyTitle={property.title} />
                                ) : (
                                    <iframe
                                        src={property.tourEmbedUrl!}
                                        className="absolute top-0 left-0 w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                        allowFullScreen
                                        loading="lazy"
                                        title={`360Â° Tour of ${property.title}`}
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
                // This was the old duplicate "Specifications" (price/size/bhk) â€” now merged into basic-info
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
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
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


                    {/* Property Highlights â€” Modern Card Grid */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            </span>
                            Property Highlights
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800 transition-colors">
                                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{bhkLabel ? `${bhkLabel} ` : ''}{propertyTypeLabel}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{property.areaName} Â· {formatSize(property.sizeSqft)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800 transition-colors">
                                <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatPrice(property.priceInr)}{property.dealType === 'rent' ? '/month' : ''}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{property.dealType === 'rent' ? 'Rent' : 'Lease'}{property.isNegotiable ? ' Â· Negotiable' : ''}</p>
                                </div>
                            </div>
                            {property.tourEmbedUrl && (
                                <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800 transition-colors">
                                    <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">360Â° Virtual Tour</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Explore from home</p>
                                    </div>
                                </div>
                            )}
                            {property.bedrooms && property.bathrooms && (
                                <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800 transition-colors">
                                    <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{property.bedrooms} Bed Â· {property.bathrooms} Bath</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Ideal for families</p>
                                    </div>
                                </div>
                            )}
                            {property.furnishing && (
                                <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800 transition-colors">
                                    <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{property.furnishing}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Move-in ready</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Neighborhood FAQ â€” Accordion */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                            </span>
                            Frequently Asked Questions
                        </h2>
                        <div className="space-y-3">
                            {[
                                {
                                    q: `What types of properties are available for ${property.dealType} in ${property.areaName}, Chennai?`,
                                    a: `${property.areaName} in Chennai offers a variety of properties for ${property.dealType} including apartments, independent houses, and commercial spaces. This listing is a ${bhkLabel ? bhkLabel + ' ' : ''}${propertyTypeLabel} spanning ${formatSize(property.sizeSqft)} at ${formatPrice(property.priceInr)}${property.dealType === 'rent' ? '/month' : ''}.`,
                                },
                                {
                                    q: `What is the average ${property.dealType} price in ${property.areaName}, Chennai?`,
                                    a: `${property.dealType === 'rent' ? 'Rental' : 'Lease'} prices in ${property.areaName} vary based on property size and type. This ${bhkLabel ? bhkLabel + ' ' : ''}${propertyTypeLabel} is ${property.dealType === 'rent' ? 'available at' : 'listed for'} ${formatPrice(property.priceInr)}${property.dealType === 'rent' ? '/month' : ''}${property.isNegotiable ? ' (negotiable)' : ''}. Browse more listings on Tolet Board Chennai for comparisons.`,
                                },
                                {
                                    q: `Is ${property.areaName} well-connected to public transport and IT corridors in Chennai?`,
                                    a: `${property.areaName} is a well-established locality in Chennai with good connectivity to major IT corridors, bus routes, and metro stations. Properties here are popular among families and professionals. Explore this listing with a 360Â° virtual tour.`,
                                },
                            ].map((faq, index) => (
                                <details key={index} className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                                    <summary className="flex items-center justify-between cursor-pointer p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors list-none [&::-webkit-details-marker]:hidden">
                                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm pr-4">{faq.q}</h3>
                                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </summary>
                                    <div className="px-4 pb-4 pt-0">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>

                    {/* Lead Collection Form */}
                    <div className="mt-8">
                        <PropertyLeadForm propertyId={property.id} propertyTitle={property.title} />
                    </div>

                    {/* Contact Info */}
                    <div className="mt-8 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 text-center">
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
                        <div className="mt-8">
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
