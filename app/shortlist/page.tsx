'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatPrice, formatSize } from '@/lib/utils';

interface ShortlistedProperty {
    id: string;
    slug: string;
    title: string;
    dealType: string;
    usageType: string;
    propertySubtype: string | null;
    areaName: string;
    city: string;
    priceInr: number;
    isNegotiable: boolean;
    sizeSqft: number;
    bedrooms: number | null;
    bathrooms: number | null;
    images: string | null;
    leasePeriodYears: number | null;
}

interface ShortlistItem {
    id: string;
    propertyId: string;
    createdAt: string;
    property: ShortlistedProperty;
}

export default function ShortlistPage() {
    const [items, setItems] = useState<ShortlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(true);

    useEffect(() => {
        fetch('/api/user/shortlist')
            .then(res => res.json())
            .then(data => {
                if (data.shortlists) {
                    setItems(data.shortlists);
                } else {
                    setIsLoggedIn(false);
                }
            })
            .catch(() => setIsLoggedIn(false))
            .finally(() => setLoading(false));
    }, []);

    async function removeFromShortlist(propertyId: string) {
        const res = await fetch('/api/user/shortlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ propertyId }),
        });
        if (res.ok) {
            setItems(prev => prev.filter(item => item.propertyId !== propertyId));
        }
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
            </main>
        );
    }

    if (!isLoggedIn) {
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
                <div className="text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My Shortlist</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Login to save and view your shortlisted properties</p>
                    <Link href="/login" className="inline-block px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
                        Login
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    My Shortlist ({items.length})
                </h1>

                {items.length === 0 ? (
                    <div className="text-center py-16">
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No shortlisted properties yet
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Browse properties and tap the heart icon to shortlist</p>
                        <Link href="/list" className="inline-block px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
                            Browse Properties
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {items.map((item) => {
                            const property = item.property;
                            const imageUrl = property.images ? JSON.parse(property.images)[0] : null;

                            return (
                                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden flex">
                                    {/* Image */}
                                    <Link href={`/p/${property.slug}`} className="w-32 sm:w-48 flex-shrink-0">
                                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700">
                                            {imageUrl ? (
                                                <img src={imageUrl} alt={property.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </Link>

                                    {/* Details */}
                                    <div className="flex-1 p-4">
                                        <Link href={`/p/${property.slug}`}>
                                            <h3 className="font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-1">
                                                {property.title}
                                            </h3>
                                        </Link>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {property.areaName}, {property.city}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                            <span className="font-bold text-primary-600 dark:text-primary-400">
                                                {formatPrice(property.priceInr)}{property.dealType === 'rent' ? '/mo' : ''}
                                            </span>
                                            {property.isNegotiable && (
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold rounded-full">
                                                    Negotiable
                                                </span>
                                            )}
                                            <span className="text-sm text-gray-500">•</span>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{formatSize(property.sizeSqft)}</span>
                                        </div>

                                        <button
                                            onClick={() => removeFromShortlist(property.id)}
                                            className="mt-3 text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
