'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { formatPrice, formatSize } from '@/lib/utils';

interface SliderProperty {
    id: string;
    slug: string;
    title: string;
    dealType: string;
    usageType: string;
    areaName: string;
    city: string;
    priceInr: number;
    sizeSqft: number;
    bedrooms: number | null;
    bathrooms: number | null;
    images: string | null;
}

interface PropertySliderProps {
    properties: SliderProperty[];
}

export default function PropertySlider({ properties }: PropertySliderProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const scrollAmount = 320;
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    if (properties.length === 0) return null;

    return (
        <div className="relative group/slider">
            {/* Left Arrow */}
            <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-gray-800 shadow-lg rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-gray-700 transition-all duration-200 opacity-0 group-hover/slider:opacity-100 -translate-x-3 group-hover/slider:translate-x-0"
                aria-label="Previous"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Right Arrow */}
            <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-gray-800 shadow-lg rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-gray-700 transition-all duration-200 opacity-0 group-hover/slider:opacity-100 translate-x-3 group-hover/slider:translate-x-0"
                aria-label="Next"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Scrollable Container */}
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {properties.map((property) => {
                    const images = property.images ? JSON.parse(property.images) : [];
                    const mainImage = images.length > 0 ? images[0] : null;

                    return (
                        <Link
                            key={property.id}
                            href={`/p/${property.slug}`}
                            className="snap-start flex-shrink-0 w-[280px] bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                        >
                            {/* Image */}
                            {mainImage ? (
                                <div className="relative w-full h-40 overflow-hidden bg-gray-200 dark:bg-gray-700">
                                    <img
                                        src={mainImage}
                                        alt={property.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute top-2 right-2 flex gap-1.5">
                                        <span className="px-2 py-0.5 bg-primary-600/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-full uppercase">
                                            {property.dealType}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative w-full h-40 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                                    <svg className="w-12 h-12 text-primary-300 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    <div className="absolute top-2 right-2">
                                        <span className="px-2 py-0.5 bg-primary-600/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-full uppercase">
                                            {property.dealType}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Info */}
                            <div className="p-4">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
                                    {property.title}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    {property.areaName}, {property.city}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                    <span className="font-bold text-primary-600 dark:text-primary-400 text-base">
                                        {formatPrice(property.priceInr)}
                                    </span>
                                    <span>•</span>
                                    <span>{formatSize(property.sizeSqft)}</span>
                                    {property.bedrooms && property.bedrooms > 0 && (
                                        <>
                                            <span>•</span>
                                            <span>{property.bedrooms} BHK</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Scroll Indicator Dots */}
            <div className="flex justify-center mt-3 gap-1">
                {properties.slice(0, Math.min(properties.length, 5)).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                ))}
            </div>
        </div>
    );
}
