import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { formatPrice, formatSize, parseTopFacilities, parseLocationAdvantages, parsePropertyDetails, buildWhatsAppUrl } from '@/lib/utils';
import ContactBar from '@/components/ContactBar';
import TeleportMeEmbed from '@/components/TeleportMeEmbed';
import FacilitiesAndLocations from '@/components/FacilitiesAndLocations';

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

export default async function PropertyPage({ params }: PropertyPageProps) {
    const { slug } = await params;
    const property = await getProperty(slug);
    const settings = await getSiteSettings();

    if (!property) {
        notFound();
    }

    const topFacilities = parseTopFacilities(property.topFacilities);
    const locationAdvantages = parseLocationAdvantages(property.locationAdvantages);
    const propertyDetails = parsePropertyDetails(property.propertyDetails);
    const propertyUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/p/${property.slug}`;

    const whatsappUrl = buildWhatsAppUrl(
        settings?.whatsappNumber || '+919876543210',
        settings?.whatsappTemplate || 'Hi, I\'m interested in {propertyTitle}. Link: {propertyUrl}',
        property.title,
        propertyUrl
    );

    const callUrl = `tel:${settings?.phoneNumber || '+919876543210'}`;

    return (
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

                {/* Property Images */}
                {(() => {
                    const images = property.images ? JSON.parse(property.images) : [];
                    if (images.length > 0) {
                        return (
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    Property Images
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {images.map((imagePath: string, index: number) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={imagePath}
                                                alt={`${property.title} - Image ${index + 1}`}
                                                className="w-full h-64 object-cover rounded-xl shadow-md hover:shadow-xl transition-shadow cursor-pointer"
                                                onClick={() => window.open(imagePath, '_blank')}
                                            />
                                            {index === 0 && (
                                                <span className="absolute top-3 left-3 bg-primary-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                                                    Main Photo
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    }
                    return null;
                })()}

                {/* 360° Tour */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        360° Virtual Tour
                    </h2>
                    {/* Portrait on mobile (133% = 3:4 ratio), landscape on desktop (56.25% = 16:9 ratio) */}
                    <div className="relative w-full bg-gray-900 rounded-2xl overflow-hidden shadow-2xl md:pb-[56.25%] pb-[133%]">
                        {(() => {
                            const isTeleportMe = property.tourEmbedUrl.includes('tours.realprop360.in') || property.tourEmbedUrl.includes('teleportme');
                            console.log('Tour URL:', property.tourEmbedUrl);
                            console.log('Is TeleportMe?', isTeleportMe);

                            return isTeleportMe ? (
                                <TeleportMeEmbed tourUrl={property.tourEmbedUrl} />
                            ) : (
                                <iframe
                                    src={property.tourEmbedUrl}
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

                {/* Specs */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Specifications
                    </h2>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Price</p>
                                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                    {formatPrice(property.priceInr)}/mo
                                </p>
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
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Furnishing</p>
                                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {property.furnishing || 'Unfurnished'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Facilities & Location Advantages */}
                <FacilitiesAndLocations
                    topFacilities={topFacilities}
                    locationAdvantages={locationAdvantages}
                />

                {/* Specifications */}
                {(property.floorNumber || property.tenantPreference || property.carpetAreaSqft || property.availableFrom || property.propertyAge) && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Specifications
                        </h2>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Floor Details */}
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

                                {/* Tenant Preference */}
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

                                {/* Carpet Area */}
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

                                {/* Available From */}
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

                                {/* Property Age */}
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
                )}

                {/* Property Details */}
                {propertyDetails.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Property Details
                        </h2>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                            <div className="space-y-3">
                                {propertyDetails.map((detail, index) => (
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
                )}

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
            </div>

            {/* Contact Bar */}
            <ContactBar
                whatsappUrl={whatsappUrl}
                callUrl={callUrl}
                propertyTitle={property.title}
            />
        </main>
    );
}
