'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CHENNAI_AREAS } from '@/lib/chennai-areas';

interface SearchBarProps {
    availableAreas?: string[];
}

export default function SearchBar({ availableAreas = [] }: SearchBarProps) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Available areas that have properties in DB (sorted)
    const sortedAvailable = useMemo(() =>
        [...availableAreas].sort((a, b) => a.localeCompare(b)),
        [availableAreas]
    );
    const availableSet = useMemo(() => new Set(availableAreas), [availableAreas]);

    // All other areas (not in available)
    const otherAreas = useMemo(() =>
        CHENNAI_AREAS.filter(a => !availableSet.has(a)),
        [availableSet]
    );

    // Filter based on query
    const isSearching = query.trim().length >= 1;
    const q = query.toLowerCase();

    const filteredAvailable = useMemo(() =>
        isSearching ? sortedAvailable.filter(a => a.toLowerCase().includes(q)) : sortedAvailable,
        [isSearching, q, sortedAvailable]
    );
    const filteredOther = useMemo(() =>
        isSearching ? otherAreas.filter(a => a.toLowerCase().includes(q)) : otherAreas,
        [isSearching, q, otherAreas]
    );

    // Combined flat list for keyboard navigation
    const allSuggestions = useMemo(() =>
        [...filteredAvailable, ...filteredOther],
        [filteredAvailable, filteredOther]
    );

    // How many more hidden
    const totalChennai = CHENNAI_AREAS.length;
    const shownCount = filteredAvailable.length + filteredOther.length;
    const hiddenCount = totalChennai - shownCount;

    // Close suggestions when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (searchQuery?: string) => {
        const term = (searchQuery || query).trim();
        if (term) {
            router.push(`/list?q=${encodeURIComponent(term)}`);
        } else {
            router.push('/list');
        }
        setShowSuggestions(false);
    };

    const handleSelectSuggestion = (area: string) => {
        setQuery(area);
        setShowSuggestions(false);
        router.push(`/list?areas=${encodeURIComponent(area)}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions) {
            if (e.key === 'Enter') handleSearch();
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev < allSuggestions.length - 1 ? prev + 1 : 0));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : allSuggestions.length - 1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < allSuggestions.length) {
                    handleSelectSuggestion(allSuggestions[selectedIndex]);
                } else {
                    handleSearch();
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                break;
        }
    };

    // Track index offset
    let runningIndex = 0;

    return (
        <div ref={wrapperRef} className="relative">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-2 flex items-center gap-2 min-w-0">
                <svg className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setSelectedIndex(-1);
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Search by area..."
                    className="flex-1 min-w-0 px-2 py-2.5 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none text-sm"
                    autoComplete="off"
                />
                <button
                    onClick={() => handleSearch()}
                    className="btn-premium p-2.5 rounded-lg transition-all duration-200 flex-shrink-0"
                    aria-label="Search"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
                    <div className="max-h-72 overflow-y-auto">
                        {/* Available Properties section */}
                        {filteredAvailable.length > 0 && (
                            <>
                                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-750 sticky top-0">
                                    <span className="text-[11px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                                        Available Properties
                                    </span>
                                </div>
                                {filteredAvailable.map((area) => {
                                    const idx = runningIndex++;
                                    return (
                                        <button
                                            key={`avail-${area}`}
                                            onClick={() => handleSelectSuggestion(area)}
                                            className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${idx === selectedIndex
                                                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            <svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="font-medium">{area}</span>
                                        </button>
                                    );
                                })}
                            </>
                        )}

                        {/* All Chennai Areas section */}
                        {filteredOther.length > 0 && (
                            <>
                                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-750 sticky top-0 border-t border-gray-100 dark:border-gray-700">
                                    <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        All Chennai Areas
                                    </span>
                                </div>
                                {filteredOther.map((area) => {
                                    const idx = runningIndex++;
                                    return (
                                        <button
                                            key={`other-${area}`}
                                            onClick={() => handleSelectSuggestion(area)}
                                            className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${idx === selectedIndex
                                                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>{area}</span>
                                        </button>
                                    );
                                })}
                            </>
                        )}

                        {/* Footer: Type to search more */}
                        {!isSearching && hiddenCount > 0 && (
                            <div className="px-4 py-3 text-center border-t border-gray-100 dark:border-gray-700">
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                    Type to search {hiddenCount} more areas...
                                </span>
                            </div>
                        )}

                        {/* No results */}
                        {allSuggestions.length === 0 && isSearching && (
                            <div className="px-4 py-3 text-center">
                                <span className="text-sm text-gray-400">No areas found</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
