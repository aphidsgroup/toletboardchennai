'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CHENNAI_AREAS } from '@/lib/chennai-areas';

interface FilterSheetProps {
    areas: string[]; // DB areas (properties that exist)
}

// Budget presets in INR
const BUDGET_MIN = 0;
const BUDGET_MAX = 200000;
const BUDGET_STEP = 5000;

// Size presets in sqft
const SIZE_MIN = 0;
const SIZE_MAX = 5000;
const SIZE_STEP = 100;

const BHK_OPTIONS = [
    { label: 'Any', value: '' },
    { label: '1 BHK', value: '1' },
    { label: '2 BHK', value: '2' },
    { label: '3 BHK', value: '3' },
    { label: '4+ BHK', value: '4' },
];

const PROPERTY_TYPES = [
    { label: 'All Types', value: '' },
    { label: 'Apartment', value: 'Apartment' },
    { label: 'Villa / House', value: 'Villa' },
    { label: 'Office', value: 'Office' },
    { label: 'Shop / Retail', value: 'Shop' },
    { label: 'Warehouse', value: 'Warehouse' },
    { label: 'PG / Co-living', value: 'PG' },
];

function formatBudget(value: number): string {
    if (value >= 100000) return `₹${(value / 100000).toFixed(value % 100000 === 0 ? 0 : 1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
    return `₹${value}`;
}

export default function FilterSheet({ areas }: FilterSheetProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);

    // Merge DB areas with master list — DB areas first, then rest
    const allAreas = useMemo(() => {
        const dbSet = new Set(areas);
        const rest = CHENNAI_AREAS.filter(a => !dbSet.has(a));
        return [...areas, ...rest];
    }, [areas]);

    // Set for O(1) "Available" lookup
    const dbAreaSet = useMemo(() => new Set(areas), [areas]);

    // State from URL
    const [selectedAreas, setSelectedAreas] = useState<string[]>(
        searchParams.get('areas')?.split(',').filter(Boolean) ||
        (searchParams.get('area') ? [searchParams.get('area')!] : [])
    );
    const [areaSearch, setAreaSearch] = useState('');
    const [bhk, setBhk] = useState(searchParams.get('bhk') || '');
    const [subtype, setSubtype] = useState(searchParams.get('subtype') || '');
    const [minPrice, setMinPrice] = useState(parseInt(searchParams.get('minPrice') || '0'));
    const [maxPrice, setMaxPrice] = useState(parseInt(searchParams.get('maxPrice') || String(BUDGET_MAX)));
    const [minSize, setMinSize] = useState(parseInt(searchParams.get('minSize') || '0'));
    const [maxSize, setMaxSize] = useState(parseInt(searchParams.get('maxSize') || String(SIZE_MAX)));

    const toggleArea = useCallback((a: string) => {
        setSelectedAreas(prev => {
            if (prev.includes(a)) return prev.filter(x => x !== a);
            if (prev.length >= 5) return prev; // max 5
            return [...prev, a];
        });
        setAreaSearch('');
    }, []);

    const filteredAreas = useMemo(() => {
        if (!areaSearch.trim()) return allAreas.filter(a => !selectedAreas.includes(a));
        const q = areaSearch.toLowerCase();
        return allAreas.filter(a => !selectedAreas.includes(a) && a.toLowerCase().includes(q));
    }, [areaSearch, allAreas, selectedAreas]);

    const handleApply = useCallback(() => {
        const params = new URLSearchParams();

        // Preserve deal and use
        const deal = searchParams.get('deal');
        const use = searchParams.get('use');
        if (deal) params.set('deal', deal);
        if (use) params.set('use', use);

        if (selectedAreas.length > 0) params.set('areas', selectedAreas.join(','));
        if (bhk) params.set('bhk', bhk);
        if (subtype) params.set('subtype', subtype);
        if (minPrice > BUDGET_MIN) params.set('minPrice', String(minPrice));
        if (maxPrice < BUDGET_MAX) params.set('maxPrice', String(maxPrice));
        if (minSize > SIZE_MIN) params.set('minSize', String(minSize));
        if (maxSize < SIZE_MAX) params.set('maxSize', String(maxSize));

        router.push(`/list?${params.toString()}`);
        setIsOpen(false);
    }, [selectedAreas, bhk, subtype, minPrice, maxPrice, minSize, maxSize, searchParams, router]);

    const handleClear = useCallback(() => {
        const params = new URLSearchParams();
        const deal = searchParams.get('deal');
        const use = searchParams.get('use');
        if (deal) params.set('deal', deal);
        if (use) params.set('use', use);

        setSelectedAreas([]);
        setAreaSearch('');
        setBhk('');
        setSubtype('');
        setMinPrice(BUDGET_MIN);
        setMaxPrice(BUDGET_MAX);
        setMinSize(SIZE_MIN);
        setMaxSize(SIZE_MAX);

        router.push(`/list?${params.toString()}`);
        setIsOpen(false);
    }, [searchParams, router]);

    // Count active filters
    const activeCount = [
        selectedAreas.length > 0 ? 'y' : '',
        bhk,
        subtype,
        minPrice > BUDGET_MIN ? 'y' : '',
        maxPrice < BUDGET_MAX ? 'y' : '',
        minSize > SIZE_MIN ? 'y' : '',
        maxSize < SIZE_MAX ? 'y' : '',
    ].filter(Boolean).length;

    return (
        <>
            {/* Floating Filter Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3.5 px-7 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2.5"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>Filters</span>
                {activeCount > 0 && (
                    <span className="bg-white text-primary-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {activeCount}
                    </span>
                )}
            </button>

            {/* Bottom Sheet Overlay */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl max-h-[80vh] flex flex-col animate-slide-up">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

                            {/* Property Type dropdown — FIRST */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                    Property Type
                                </label>
                                <select
                                    value={subtype}
                                    onChange={(e) => setSubtype(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
                                >
                                    {PROPERTY_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Areas — multi-select (up to 5) — SECOND */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Areas <span className="normal-case font-normal">(up to 5)</span>
                                    </label>
                                    <span className="text-xs text-primary-600 dark:text-primary-400 font-semibold">
                                        {selectedAreas.length}/5 selected
                                    </span>
                                </div>
                                {/* Selected area chips */}
                                {selectedAreas.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        {selectedAreas.map(a => (
                                            <button
                                                key={a}
                                                onClick={() => toggleArea(a)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/60 transition-colors"
                                            >
                                                {a}
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {/* Search + dropdown */}
                                <input
                                    type="text"
                                    value={areaSearch}
                                    onChange={(e) => setAreaSearch(e.target.value)}
                                    placeholder={selectedAreas.length >= 5 ? 'Max 5 areas selected' : 'Search areas...'}
                                    disabled={selectedAreas.length >= 5}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-1.5 disabled:opacity-50"
                                />
                                <div className="max-h-32 overflow-y-auto border border-gray-100 dark:border-gray-700 rounded-xl">
                                    {filteredAreas.slice(0, 30).map(a => (
                                        <button
                                            key={a}
                                            onClick={() => toggleArea(a)}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                                        >
                                            <svg className={`w-3.5 h-3.5 flex-shrink-0 ${dbAreaSet.has(a) ? 'text-green-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="flex-1">{a}</span>
                                            {dbAreaSet.has(a) && (
                                                <span className="text-[10px] font-semibold text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded-md">
                                                    Available
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                    {filteredAreas.length === 0 && (
                                        <p className="px-3 py-2 text-xs text-gray-400">No areas found</p>
                                    )}
                                </div>
                            </div>

                            {/* Row 2: BHK pills */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                    BHK
                                </label>
                                <div className="flex gap-2">
                                    {BHK_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setBhk(bhk === opt.value ? '' : opt.value)}
                                            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${bhk === opt.value
                                                ? 'bg-primary-500 text-white shadow-sm'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Row 3: Budget Range Slider */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Budget /month
                                    </label>
                                    <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                                        {formatBudget(minPrice)} – {maxPrice >= BUDGET_MAX ? '₹2L+' : formatBudget(maxPrice)}
                                    </span>
                                </div>
                                <div className="relative pt-1">
                                    <div className="range-slider-track">
                                        <div
                                            className="range-slider-fill"
                                            style={{
                                                left: `${(minPrice / BUDGET_MAX) * 100}%`,
                                                width: `${((maxPrice - minPrice) / BUDGET_MAX) * 100}%`,
                                            }}
                                        />
                                    </div>
                                    <input
                                        type="range"
                                        min={BUDGET_MIN}
                                        max={BUDGET_MAX}
                                        step={BUDGET_STEP}
                                        value={minPrice}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (val < maxPrice) setMinPrice(val);
                                        }}
                                        className="range-slider-thumb"
                                    />
                                    <input
                                        type="range"
                                        min={BUDGET_MIN}
                                        max={BUDGET_MAX}
                                        step={BUDGET_STEP}
                                        value={maxPrice}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (val > minPrice) setMaxPrice(val);
                                        }}
                                        className="range-slider-thumb"
                                    />
                                </div>
                            </div>

                            {/* Row 4: Size Range Slider */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Size
                                    </label>
                                    <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                                        {minSize} – {maxSize >= SIZE_MAX ? '5000+' : maxSize} sq ft
                                    </span>
                                </div>
                                <div className="relative pt-1">
                                    <div className="range-slider-track">
                                        <div
                                            className="range-slider-fill"
                                            style={{
                                                left: `${(minSize / SIZE_MAX) * 100}%`,
                                                width: `${((maxSize - minSize) / SIZE_MAX) * 100}%`,
                                            }}
                                        />
                                    </div>
                                    <input
                                        type="range"
                                        min={SIZE_MIN}
                                        max={SIZE_MAX}
                                        step={SIZE_STEP}
                                        value={minSize}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (val < maxSize) setMinSize(val);
                                        }}
                                        className="range-slider-thumb"
                                    />
                                    <input
                                        type="range"
                                        min={SIZE_MIN}
                                        max={SIZE_MAX}
                                        step={SIZE_STEP}
                                        value={maxSize}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (val > minSize) setMaxSize(val);
                                        }}
                                        className="range-slider-thumb"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="border-t border-gray-100 dark:border-gray-700 px-6 py-4 flex gap-3">
                            <button
                                onClick={handleClear}
                                className="flex-1 px-5 py-3 border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Clear All
                            </button>
                            <button
                                onClick={handleApply}
                                className="flex-1 px-5 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl shadow-md transition-all duration-300"
                            >
                                Show Results
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
