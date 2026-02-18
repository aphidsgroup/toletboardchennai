'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface FilterSheetProps {
    areas: string[];
    amenitiesVocab: string[];
}

export default function FilterSheet({ areas, amenitiesVocab }: FilterSheetProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);

    // Get current filter values from URL
    const [area, setArea] = useState(searchParams.get('area') || '');
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [minSize, setMinSize] = useState(searchParams.get('minSize') || '');
    const [maxSize, setMaxSize] = useState(searchParams.get('maxSize') || '');
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
        searchParams.get('amenities')?.split(',').filter(Boolean) || []
    );

    const handleApply = () => {
        const params = new URLSearchParams(searchParams.toString());

        // Preserve deal and use params
        if (area) params.set('area', area);
        else params.delete('area');

        if (minPrice) params.set('minPrice', minPrice);
        else params.delete('minPrice');

        if (maxPrice) params.set('maxPrice', maxPrice);
        else params.delete('maxPrice');

        if (minSize) params.set('minSize', minSize);
        else params.delete('minSize');

        if (maxSize) params.set('maxSize', maxSize);
        else params.delete('maxSize');

        if (selectedAmenities.length > 0) params.set('amenities', selectedAmenities.join(','));
        else params.delete('amenities');

        router.push(`/list?${params.toString()}`);
        setIsOpen(false);
    };

    const handleClear = () => {
        const params = new URLSearchParams(searchParams.toString());

        // Keep only deal and use params
        const deal = params.get('deal');
        const use = params.get('use');

        const newParams = new URLSearchParams();
        if (deal) newParams.set('deal', deal);
        if (use) newParams.set('use', use);

        setArea('');
        setMinPrice('');
        setMaxPrice('');
        setMinSize('');
        setMaxSize('');
        setSelectedAmenities([]);

        router.push(`/list?${newParams.toString()}`);
        setIsOpen(false);
    };

    const toggleAmenity = (amenity: string) => {
        setSelectedAmenities(prev =>
            prev.includes(amenity)
                ? prev.filter(a => a !== amenity)
                : [...prev, amenity]
        );
    };

    const activeFiltersCount = [area, minPrice, maxPrice, minSize, maxSize, ...selectedAmenities].filter(Boolean).length;

    return (
        <>
            {/* Filter Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                    <span className="bg-white text-primary-600 text-xs font-bold px-2 py-0.5 rounded-full">
                        {activeFiltersCount}
                    </span>
                )}
            </button>

            {/* Bottom Sheet */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Sheet */}
                    <div className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto animate-slide-up">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Filters</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Area */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                    Area
                                </label>
                                <select
                                    value={area}
                                    onChange={(e) => setArea(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="">All Areas</option>
                                    {areas.map((a) => (
                                        <option key={a} value={a}>{a}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Budget */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                    Budget (₹/month)
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Size */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                    Size (sq ft)
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={minSize}
                                        onChange={(e) => setMinSize(e.target.value)}
                                        className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={maxSize}
                                        onChange={(e) => setMaxSize(e.target.value)}
                                        className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Amenities */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                    Amenities
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {amenitiesVocab
                                        .filter((amenity) => {
                                            const usageType = searchParams.get('use') || 'residential';

                                            // Residential-only amenities
                                            const residentialAmenities = [
                                                'Swimming Pool', 'Play Area', 'Garden', 'Club House',
                                                'Children\'s Park', 'Jogging Track', 'Indoor Games',
                                                'Community Hall', 'Meditation Area', 'Senior Citizen Area'
                                            ];

                                            // Commercial-only amenities
                                            const commercialAmenities = [
                                                'Conference Room', 'Reception Area', 'Cafeteria',
                                                'Server Room', 'Meeting Rooms', 'Pantry',
                                                'Workstations', 'Cabin Space', 'Washrooms per Floor',
                                                'Visitor Parking', 'Loading Bay', 'Storage Area'
                                            ];

                                            // Common amenities for both
                                            const commonAmenities = [
                                                'Lift', 'Parking', 'Security', 'Power Backup',
                                                'Water Supply', 'CCTV', 'Intercom', '24/7 Security',
                                                'Fire Safety', 'Maintenance Staff', 'Covered Parking',
                                                'Visitor Parking', 'Rainwater Harvesting', 'Waste Management'
                                            ];

                                            if (usageType === 'residential') {
                                                return !commercialAmenities.includes(amenity);
                                            } else {
                                                return !residentialAmenities.includes(amenity);
                                            }
                                        })
                                        .map((amenity) => (
                                            <button
                                                key={amenity}
                                                onClick={() => toggleAmenity(amenity)}
                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${selectedAmenities.includes(amenity)
                                                    ? 'bg-primary-500 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                    }`}
                                            >
                                                {amenity}
                                            </button>
                                        ))}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex gap-3">
                            <button
                                onClick={handleClear}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Clear
                            </button>
                            <button
                                onClick={handleApply}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl transition-all duration-300"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
