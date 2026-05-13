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
        <div className="flex flex-wrap gap-4 items-center mt-3 animate-in fade-in slide-in-from-top-1 duration-500">
            {/* Views */}
            <div className="flex items-center gap-1.5 group transition-all duration-300">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    <span className="text-gray-900 dark:text-white font-bold">{stats.viewCount}</span> people viewed
                </span>
            </div>

            {/* Dot Divider */}
            <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></div>

            {/* Shortlists */}
            <div className="flex items-center gap-1.5 group transition-all duration-300">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    <span className="text-gray-900 dark:text-white font-bold">{stats.shortlistCount}</span> shortlisted
                </span>
            </div>
        </div>
    );
}
