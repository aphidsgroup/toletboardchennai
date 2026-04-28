import Link from 'next/link';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';


async function getStats() {
    const [totalProperties, publishedProperties, rentProperties, leaseProperties, totalLeads, totalUsers] = await Promise.all([
        prisma.property.count(),
        prisma.property.count({ where: { isPublished: true } }),
        prisma.property.count({ where: { dealType: 'rent', isPublished: true } }),
        prisma.property.count({ where: { dealType: 'lease', isPublished: true } }),
        prisma.leadFormResponse.count(),
        prisma.user.count(),
    ]);

    return { totalProperties, publishedProperties, rentProperties, leaseProperties, totalLeads, totalUsers };
}

async function getRecentProperties() {
    return prisma.property.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
    });
}

export default async function AdminDashboard() {
    const stats = await getStats();
    const recentProperties = await getRecentProperties();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Welcome to Tolet Board Chennai CMS
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Properties</h3>
                        <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalProperties}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400">Published</h3>
                        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.publishedProperties}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400">Rent</h3>
                        <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.rentProperties}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400">Lease</h3>
                        <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.leaseProperties}</p>
                </div>

                <Link href="/admin/leads" className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5 hover:shadow-lg transition-shadow group">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Leads</h3>
                        <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalLeads}</p>
                    <span className="text-xs text-primary-500 group-hover:underline">View all →</span>
                </Link>

                <Link href="/admin/users" className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5 hover:shadow-lg transition-shadow group">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400">Registered Users</h3>
                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                    <span className="text-xs text-primary-500 group-hover:underline">View all →</span>
                </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Link
                        href="/admin/properties/new"
                        className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl transition-all duration-300"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="font-semibold text-sm">Add Property</span>
                    </Link>

                    <Link
                        href="/admin/properties"
                        className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        <span className="font-semibold text-sm">Properties</span>
                    </Link>

                    <Link
                        href="/admin/leads"
                        className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="font-semibold text-sm">Leads</span>
                    </Link>

                    <Link
                        href="/admin/users"
                        className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="font-semibold text-sm">Users</span>
                    </Link>

                    <Link
                        href="/admin/managers"
                        className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="font-semibold text-sm">Managers</span>
                    </Link>

                    <Link
                        href="/admin/settings"
                        className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-semibold text-sm">Settings</span>
                    </Link>
                </div>
            </div>

            {/* Recent Properties */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Properties</h2>
                    <Link
                        href="/admin/properties"
                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                    >
                        View All →
                    </Link>
                </div>

                {recentProperties.length > 0 ? (
                    <div className="space-y-3">
                        {recentProperties.map((property) => (
                            <Link
                                key={property.id}
                                href={`/admin/properties/${property.id}/edit`}
                                className="block p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                            {property.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {property.areaName} • {property.dealType.toUpperCase()} • {property.usageType}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {property.isPublished ? (
                                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                                                Published
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-full">
                                                Draft
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                        No properties yet. Create your first property!
                    </p>
                )}
            </div>
        </div>
    );
}
