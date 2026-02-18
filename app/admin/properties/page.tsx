'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Property } from '@prisma/client';

export default function PropertiesListPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async (searchQuery = '') => {
        setLoading(true);
        try {
            const url = searchQuery
                ? `/api/admin/properties?search=${encodeURIComponent(searchQuery)}`
                : '/api/admin/properties';
            const res = await fetch(url);
            const data = await res.json();
            setProperties(data);
        } catch (error) {
            console.error('Error fetching properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchProperties(search);
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

        try {
            await fetch(`/api/admin/properties/${id}`, { method: 'DELETE' });
            fetchProperties(search);
        } catch (error) {
            console.error('Error deleting property:', error);
            alert('Failed to delete property');
        }
    };

    const togglePublish = async (property: Property) => {
        try {
            await fetch(`/api/admin/properties/${property.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...property, isPublished: !property.isPublished }),
            });
            fetchProperties(search);
        } catch (error) {
            console.error('Error toggling publish:', error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Properties
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage all your property listings
                    </p>
                </div>
                <Link
                    href="/admin/properties/new"
                    className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    + Add Property
                </Link>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-6">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by title or area..."
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                        type="submit"
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors"
                    >
                        Search
                    </button>
                    {search && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch('');
                                fetchProperties('');
                            }}
                            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-xl transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </form>

            {/* Properties Table */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : properties.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Property
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {properties.map((property) => (
                                    <tr key={property.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-semibold text-gray-900 dark:text-white">
                                                    {property.title}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {property.areaName}, {property.city}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs font-semibold rounded uppercase w-fit">
                                                    {property.dealType}
                                                </span>
                                                <span className="px-2 py-1 bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300 text-xs font-semibold rounded capitalize w-fit">
                                                    {property.usageType}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">
                                            ₹{property.priceInr.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => togglePublish(property)}
                                                className={`px-3 py-1 text-xs font-semibold rounded-full ${property.isPublished
                                                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                                                    }`}
                                            >
                                                {property.isPublished ? 'Published' : 'Draft'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/p/${property.slug}`}
                                                    target="_blank"
                                                    className="px-3 py-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                                                >
                                                    View
                                                </Link>
                                                <Link
                                                    href={`/admin/properties/${property.id}/edit`}
                                                    className="px-3 py-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(property.id, property.title)}
                                                    className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:underline"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-12 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No properties found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {search ? 'Try a different search term' : 'Get started by creating your first property'}
                    </p>
                    <Link
                        href="/admin/properties/new"
                        className="inline-block px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
                    >
                        + Add Property
                    </Link>
                </div>
            )}
        </div>
    );
}
