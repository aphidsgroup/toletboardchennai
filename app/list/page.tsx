import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import PropertyCard from '@/components/PropertyCard';
import FilterSheet from '@/components/FilterSheet';
import { DealType, UsageType } from '@/lib/types';

interface ListPageProps {
    searchParams: Promise<{
        deal?: DealType;
        use?: UsageType;
        subtype?: string;
        area?: string;
        bhk?: string;
        q?: string;
        minPrice?: string;
        maxPrice?: string;
        minSize?: string;
        maxSize?: string;
    }>;
}

export async function generateMetadata({ searchParams }: ListPageProps): Promise<Metadata> {
    const params = await searchParams;
    const parts: string[] = [];
    if (params.deal) parts.push(params.deal === 'rent' ? 'Rent' : 'Lease');
    if (params.use) parts.push(params.use === 'residential' ? 'Residential' : 'Commercial');
    parts.push('Properties');
    if (params.area) parts.push(`in ${params.area}`);
    parts.push('| Chennai');

    const title = parts.join(' ');
    const description = `Browse ${params.deal || 'all'} ${params.use || ''} properties ${params.area ? `in ${params.area}, ` : ''}Chennai with 360° virtual tours. Compare prices, sizes, and amenities.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
        },
    };
}

async function getProperties(filters: {
    deal?: DealType;
    use?: UsageType;
    subtype?: string;
    area?: string;
    bhk?: number;
    q?: string;
    minPrice?: number;
    maxPrice?: number;
    minSize?: number;
    maxSize?: number;
}) {
    const where: any = {
        isPublished: true,
    };

    if (filters.deal) where.dealType = filters.deal;
    if (filters.use) where.usageType = filters.use;
    if (filters.subtype) where.propertySubtype = filters.subtype;
    if (filters.area) where.areaName = filters.area;
    if (filters.q) {
        where.OR = [
            { title: { contains: filters.q, mode: 'insensitive' } },
            { areaName: { contains: filters.q, mode: 'insensitive' } },
            { city: { contains: filters.q, mode: 'insensitive' } },
            { propertySubtype: { contains: filters.q, mode: 'insensitive' } },
        ];
    }
    if (filters.bhk) {
        if (filters.bhk >= 4) {
            where.bedrooms = { gte: 4 };
        } else {
            where.bedrooms = filters.bhk;
        }
    }
    if (filters.minPrice) where.priceInr = { ...where.priceInr, gte: filters.minPrice };
    if (filters.maxPrice) where.priceInr = { ...where.priceInr, lte: filters.maxPrice };
    if (filters.minSize) where.sizeSqft = { ...where.sizeSqft, gte: filters.minSize };
    if (filters.maxSize) where.sizeSqft = { ...where.sizeSqft, lte: filters.maxSize };

    return await prisma.property.findMany({
        where,
        orderBy: { createdAt: 'desc' },
    });
}

async function getUniqueAreas() {
    const properties = await prisma.property.findMany({
        where: { isPublished: true },
        select: { areaName: true },
        distinct: ['areaName'],
    });
    return properties.map(p => p.areaName).sort();
}

export default async function ListPage({ searchParams }: ListPageProps) {
    const params = await searchParams;

    const filters = {
        deal: params.deal,
        use: params.use,
        subtype: params.subtype,
        area: params.area,
        bhk: params.bhk ? parseInt(params.bhk) : undefined,
        q: params.q,
        minPrice: params.minPrice ? parseInt(params.minPrice) : undefined,
        maxPrice: params.maxPrice ? parseInt(params.maxPrice) : undefined,
        minSize: params.minSize ? parseInt(params.minSize) : undefined,
        maxSize: params.maxSize ? parseInt(params.maxSize) : undefined,
    };

    const properties = await getProperties(filters);
    const areas = await getUniqueAreas();

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <Link href="/" className="flex items-center gap-2 text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="font-semibold">Back</span>
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            Properties
                        </h1>
                        <div className="w-20" /> {/* Spacer for centering */}
                    </div>

                    {/* Transaction Type Toggle */}
                    <div className="flex gap-2 mb-3">
                        <Link
                            href={`/list?deal=rent${params.use ? `&use=${params.use}` : ''}`}
                            className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-center transition-all duration-300 ${params.deal === 'rent' || !params.deal
                                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            Rent
                        </Link>
                        <Link
                            href={`/list?deal=lease${params.use ? `&use=${params.use}` : ''}`}
                            className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-center transition-all duration-300 ${params.deal === 'lease'
                                ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-md'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            Lease
                        </Link>
                    </div>

                    {/* Usage Type Toggle */}
                    <div className="flex gap-2">
                        <Link
                            href={`/list${params.deal ? `?deal=${params.deal}` : ''}${params.use === 'residential' ? '' : '&use=residential'}`}
                            className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-center transition-all duration-300 ${params.use === 'residential'
                                ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 border-2 border-primary-500'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            Residential
                        </Link>
                        <Link
                            href={`/list${params.deal ? `?deal=${params.deal}` : ''}${params.use === 'commercial' ? '' : '&use=commercial'}`}
                            className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-center transition-all duration-300 ${params.use === 'commercial'
                                ? 'bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300 border-2 border-accent-500'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            Commercial
                        </Link>
                    </div>
                </div>
            </header>

            {/* Results */}
            <div className="container mx-auto px-4 py-6 pb-24">
                {/* Results Count */}
                <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
                    </p>
                </div>

                {/* Properties Grid */}
                {properties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((property) => (
                            <PropertyCard key={property.id} property={property} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No properties found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Try adjusting your filters to see more results
                        </p>
                        <Link
                            href="/list"
                            className="inline-block px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
                        >
                            Clear All Filters
                        </Link>
                    </div>
                )}
            </div>

            {/* Filter Sheet */}
            <FilterSheet areas={areas} />
        </main>
    );
}
