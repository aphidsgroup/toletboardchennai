'use client';

import Link from 'next/link';
import { useShortlist } from './ShortlistProvider';

export default function FloatingShortlistButton() {
    const { shortlistedIds, isLoaded } = useShortlist();

    if (!isLoaded) return null;

    const count = shortlistedIds.size;

    return (
        <Link
            href="/shortlist"
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:scale-105 group"
            title="View Shortlist"
        >
            <svg
                className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform"
                fill="currentColor"
                viewBox="0 0 24 24"
            >
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Shortlist
            </span>
            {count > 0 && (
                <span className="flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                    {count}
                </span>
            )}
        </Link>
    );
}
