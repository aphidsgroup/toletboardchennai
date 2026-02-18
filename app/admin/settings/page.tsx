'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        brandName: '',
        tagline: '',
        city: '',
        whatsappNumber: '',
        phoneNumber: '',
        whatsappTemplate: '',
        amenitiesVocabulary: [] as string[],
    });

    const [newAmenity, setNewAmenity] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            const data = await res.json();
            setFormData({
                ...data,
                amenitiesVocabulary: JSON.parse(data.amenitiesVocabulary),
            });
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                ...formData,
                amenitiesVocabulary: JSON.stringify(formData.amenitiesVocabulary),
            };

            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Failed to save settings');

            alert('Settings saved successfully!');
            router.refresh();
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const addAmenity = () => {
        if (newAmenity.trim() && !formData.amenitiesVocabulary.includes(newAmenity.trim())) {
            setFormData({
                ...formData,
                amenitiesVocabulary: [...formData.amenitiesVocabulary, newAmenity.trim()],
            });
            setNewAmenity('');
        }
    };

    const removeAmenity = (amenity: string) => {
        setFormData({
            ...formData,
            amenitiesVocabulary: formData.amenitiesVocabulary.filter(a => a !== amenity),
        });
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

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Site Settings
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Configure your site's global settings
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Brand Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Brand Settings</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                Brand Name
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.brandName}
                                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                Tagline
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.tagline}
                                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                Default City
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Contact Settings</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                WhatsApp Number
                            </label>
                            <input
                                type="tel"
                                required
                                value={formData.whatsappNumber}
                                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                                placeholder="+919876543210"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                required
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                placeholder="+919876543210"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                WhatsApp Message Template
                            </label>
                            <textarea
                                required
                                rows={3}
                                value={formData.whatsappTemplate}
                                onChange={(e) => setFormData({ ...formData, whatsappTemplate: e.target.value })}
                                placeholder="Hi, I'm interested in {propertyTitle}. Link: {propertyUrl}"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Use {'{propertyTitle}'} and {'{propertyUrl}'} as placeholders
                            </p>
                        </div>
                    </div>
                </div>

                {/* Amenities Vocabulary */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Amenities Vocabulary</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Manage the list of amenities available for properties
                    </p>

                    <div className="mb-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newAmenity}
                                onChange={(e) => setNewAmenity(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                                placeholder="Add new amenity..."
                                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                            />
                            <button
                                type="button"
                                onClick={addAmenity}
                                className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {formData.amenitiesVocabulary.map((amenity) => (
                            <div
                                key={amenity}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full"
                            >
                                <span className="text-gray-900 dark:text-white">{amenity}</span>
                                <button
                                    type="button"
                                    onClick={() => removeAmenity(amenity)}
                                    className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
}
