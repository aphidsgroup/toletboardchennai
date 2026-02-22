import Link from 'next/link';
import { Property } from '@prisma/client';
import { formatPrice, formatSize } from '@/lib/utils';

interface PropertyCardProps {
    property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
    let mainImage: string | null = null;
    try {
        if (property.images) {
            let parsed = JSON.parse(property.images);
            if (typeof parsed === 'string') parsed = JSON.parse(parsed);
            if (Array.isArray(parsed) && parsed.length > 0) {
                mainImage = parsed[0];
            } else if (typeof parsed === 'string') {
                mainImage = parsed;
            }
        }
    } catch {
        if (property.images && property.images.startsWith('http')) {
            mainImage = property.images;
        }
    }

    return (
        <Link
            href={`/p/${property.slug}`}
            className="block bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
        >
            {/* Property Image */}
            {mainImage ? (
                <div className="relative w-full h-48 overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <img
                        src={mainImage}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                        <span className="px-2.5 py-1 bg-primary-600/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full uppercase">
                            {property.dealType}
                        </span>
                        <span className="px-2.5 py-1 bg-accent-600/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full capitalize">
                            {property.usageType}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="relative w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="absolute top-3 right-3 flex gap-2">
                        <span className="px-2.5 py-1 bg-primary-600/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full uppercase">
                            {property.dealType}
                        </span>
                        <span className="px-2.5 py-1 bg-accent-600/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full capitalize">
                            {property.usageType}
                        </span>
                    </div>
                </div>
            )}

            <div className="p-5">
                {/* Header */}
                <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {property.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {property.areaName}, {property.city}
                    </p>
                </div>

                {/* Price & Details */}
                <div className="flex items-center gap-3 mb-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                    <span className="font-bold text-primary-600 dark:text-primary-400 text-xl">
                        {formatPrice(property.priceInr)}/mo
                    </span>
                    <span>•</span>
                    <span className="font-medium">{formatSize(property.sizeSqft)}</span>
                    {property.bedrooms !== null && property.bedrooms > 0 && (
                        <>
                            <span>•</span>
                            <span>{property.bedrooms} BHK</span>
                        </>
                    )}
                    {property.bathrooms && (
                        <>
                            <span>•</span>
                            <span>{property.bathrooms} Bath</span>
                        </>
                    )}
                </div>

                {/* CTA */}
                <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 group-hover:from-primary-600 group-hover:to-primary-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Open 360° Tour</span>
                </div>
            </div>
        </Link>
    );
}
