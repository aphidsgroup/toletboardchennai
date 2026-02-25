'use client';

import { useShortlist } from './ShortlistProvider';

interface ShortlistButtonProps {
    propertyId: string;
}

export default function ShortlistButton({ propertyId }: ShortlistButtonProps) {
    const { shortlistedIds, toggleShortlist, isLoaded } = useShortlist();

    if (!isLoaded) return null;

    const isShortlisted = shortlistedIds.has(propertyId);

    return (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleShortlist(propertyId);
            }}
            className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:scale-110 transition-all duration-200"
            title={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
        >
            <svg
                className={`w-5 h-5 transition-colors duration-200 ${isShortlisted
                        ? 'text-red-500 fill-red-500'
                        : 'text-gray-400 hover:text-red-400'
                    }`}
                fill={isShortlisted ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
            </svg>
        </button>
    );
}
