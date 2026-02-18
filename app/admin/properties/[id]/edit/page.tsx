'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Property } from '@prisma/client';
import PropertyForm from '@/components/admin/PropertyForm';
import Link from 'next/link';

export default function EditPropertyPage() {
    const params = useParams();
    const router = useRouter();
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProperty();
    }, []);

    const fetchProperty = async () => {
        try {
            const res = await fetch(`/api/admin/properties/${params.id}`);
            if (!res.ok) throw new Error('Property not found');
            const data = await res.json();
            setProperty(data);
        } catch (error) {
            console.error('Error fetching property:', error);
            alert('Property not found');
            router.push('/admin/properties');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${property?.title}"?`)) return;

        try {
            await fetch(`/api/admin/properties/${params.id}`, { method: 'DELETE' });
            router.push('/admin/properties');
            router.refresh();
        } catch (error) {
            console.error('Error deleting property:', error);
            alert('Failed to delete property');
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </div>
        );
    }

    if (!property) return null;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Edit Property
                    </h1>
                    <div className="flex gap-2">
                        <Link
                            href={`/p/${property.slug}`}
                            target="_blank"
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors"
                        >
                            Preview
                        </Link>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/p/${property.slug}`);
                                alert('Link copied to clipboard!');
                            }}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors"
                        >
                            Copy Link
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                    Update property details
                </p>
            </div>

            <PropertyForm property={property} mode="edit" />
        </div>
    );
}
