'use client';

import { useState, useEffect } from 'react';

interface PropertyStats {
    viewCount: number;
    shortlistCount: number;
}

interface PropertyStatsBarProps {
    propertyId: string;
}

export default function PropertyStatsBar({ propertyId }: PropertyStatsBarProps) {
    const [stats, setStats] = useState<PropertyStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const updateAndFetchStats = async () => {
            try {
                // We use POST to increment the view count and get updated stats in one go
                const response = await fetch(`/api/properties/${propertyId}/stats`, {
                    method: 'POST',
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to update stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        updateAndFetchStats();
    }, [propertyId]);

    if (isLoading) {
        return (
            <div className="flex gap-2 items-center animate-pulse py-2">
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="flex flex-wrap gap-3 items-center mt-3 animate-in fade-in slide-in-from-top-2 duration-700">
            {/* Stats Pill */}
            <div className="inline-flex items-center gap-4 px-4 py-1.5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-800 rounded-full shadow-sm">
                {/* Views */}
                <div className="flex items-center gap-2 group transition-all duration-300">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        <span className="text-gray-900 dark:text-white font-bold">{stats.viewCount}</span> people viewed
                    </span>
                </div>

                {/* Divider */}
                <div className="w-px h-4 bg-gray-200 dark:bg-gray-700"></div>

                {/* Shortlists */}
                <div className="flex items-center gap-2 group transition-all duration-300">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        <span className="text-gray-900 dark:text-white font-bold">{stats.shortlistCount}</span> shortlisted
                    </span>
                </div>
            </div>

            {/* Live Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full border border-green-100 dark:border-green-800/30">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider">Live</span>
            </div>
        </div>
    );
}
