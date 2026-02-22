'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface FilterSheetProps {
    areas: string[];
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

    // State from URL
    const [area, setArea] = useState(searchParams.get('area') || '');
    const [bhk, setBhk] = useState(searchParams.get('bhk') || '');
    const [subtype, setSubtype] = useState(searchParams.get('subtype') || '');
    const [minPrice, setMinPrice] = useState(parseInt(searchParams.get('minPrice') || '0'));
    const [maxPrice, setMaxPrice] = useState(parseInt(searchParams.get('maxPrice') || String(BUDGET_MAX)));
    const [minSize, setMinSize] = useState(parseInt(searchParams.get('minSize') || '0'));
    const [maxSize, setMaxSize] = useState(parseInt(searchParams.get('maxSize') || String(SIZE_MAX)));

    const handleApply = useCallback(() => {
        const params = new URLSearchParams();

        // Preserve deal and use
        const deal = searchParams.get('deal');
        const use = searchParams.get('use');
        if (deal) params.set('deal', deal);
        if (use) params.set('use', use);

        if (area) params.set('area', area);
        if (bhk) params.set('bhk', bhk);
        if (subtype) params.set('subtype', subtype);
        if (minPrice > BUDGET_MIN) params.set('minPrice', String(minPrice));
        if (maxPrice < BUDGET_MAX) params.set('maxPrice', String(maxPrice));
        if (minSize > SIZE_MIN) params.set('minSize', String(minSize));
        if (maxSize < SIZE_MAX) params.set('maxSize', String(maxSize));

        router.push(`/list?${params.toString()}`);
        setIsOpen(false);
    }, [area, bhk, subtype, minPrice, maxPrice, minSize, maxSize, searchParams, router]);

    const handleClear = useCallback(() => {
        const params = new URLSearchParams();
        const deal = searchParams.get('deal');
        const use = searchParams.get('use');
        if (deal) params.set('deal', deal);
        if (use) params.set('use', use);

        setArea('');
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
        area,
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

                            {/* Row 1: Area + Property Type — side by side dropdowns */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                        Area
                                    </label>
                                    <select
                                        value={area}
                                        onChange={(e) => setArea(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
                                    >
                                        <option value="">All Areas</option>
                                        {areas.map((a) => (
                                            <option key={a} value={a}>{a}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                        Type
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
