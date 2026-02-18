'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Property } from '@prisma/client';
import {
    generateSlug,
    stringifyTopFacilities,
    parseTopFacilities,
    stringifyLocationAdvantages,
    parseLocationAdvantages,
    type LocationAdvantage,
    parsePropertyDetails,
    stringifyPropertyDetails,
    type PropertyDetail,
    parseCustomSections,
    stringifyCustomSections,
    type CustomSection,
    parseSectionOrder,
    stringifySectionOrder,
    DEFAULT_SECTION_ORDER
} from '@/lib/utils';

interface PropertyFormProps {
    property?: Property;
    mode: 'create' | 'edit';
}

export default function PropertyForm({ property, mode }: PropertyFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: property?.title || '',
        slug: property?.slug || '',
        dealType: property?.dealType || 'rent',
        usageType: property?.usageType || 'residential',
        propertySubtype: property?.propertySubtype || '',
        areaName: property?.areaName || '',
        city: property?.city || 'Chennai',
        priceInr: property?.priceInr || 0,
        advanceMonths: property?.advanceMonths || null,
        leasePeriodYears: property?.leasePeriodYears || null,
        sizeSqft: property?.sizeSqft || 0,
        bedrooms: property?.bedrooms || 0,
        bathrooms: property?.bathrooms || 0,
        parking: property?.parking || '',
        topFacilities: property ? parseTopFacilities(property.topFacilities) : [],
        locationAdvantages: property ? parseLocationAdvantages(property.locationAdvantages) : [],

        // Specifications
        floorNumber: property?.floorNumber || '',
        totalFloors: property?.totalFloors || '',
        furnishing: property?.furnishing || 'Unfurnished',
        tenantPreference: property?.tenantPreference || 'Anyone',
        carpetAreaSqft: property?.carpetAreaSqft || '',
        availableFrom: property?.availableFrom ? new Date(property.availableFrom).toISOString().split('T')[0] : '',
        propertyAge: property?.propertyAge || '0-1 Year',

        // Property Details & Custom Sections
        propertyDetails: property ? parsePropertyDetails(property.propertyDetails) : [],
        customSections: property ? parseCustomSections(property.customSections) : [],
        sectionOrder: property ? parseSectionOrder(property.sectionOrder) : DEFAULT_SECTION_ORDER,

        tourEmbedUrl: property?.tourEmbedUrl || '',
        images: property?.images ? JSON.parse(property.images) : [],
        isPublished: property?.isPublished || false,
        isFeatured: property?.isFeatured || false,
    });



    useEffect(() => {
        if (!property && formData.title) {
            setFormData(prev => ({ ...prev, slug: generateSlug(formData.title) }));
        }
    }, [formData.title, property]);



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                priceInr: parseInt(formData.priceInr.toString()),
                sizeSqft: parseInt(formData.sizeSqft.toString()),
                bedrooms: formData.bedrooms ? parseInt(formData.bedrooms.toString()) : null,
                bathrooms: formData.bathrooms ? parseInt(formData.bathrooms.toString()) : null,
                topFacilities: stringifyTopFacilities(formData.topFacilities),
                locationAdvantages: stringifyLocationAdvantages(formData.locationAdvantages),

                // Specifications
                floorNumber: formData.floorNumber ? parseInt(formData.floorNumber.toString()) : null,
                totalFloors: formData.totalFloors ? parseInt(formData.totalFloors.toString()) : null,
                carpetAreaSqft: formData.carpetAreaSqft ? parseInt(formData.carpetAreaSqft.toString()) : null,
                availableFrom: formData.availableFrom ? new Date(formData.availableFrom).toISOString() : null,

                // Property Details & Custom Sections
                propertyDetails: stringifyPropertyDetails(formData.propertyDetails),
                customSections: stringifyCustomSections(formData.customSections),
                sectionOrder: stringifySectionOrder(formData.sectionOrder),

                images: JSON.stringify(formData.images),
            };

            const url = mode === 'create'
                ? '/api/admin/properties'
                : `/api/admin/properties/${property!.id}`;

            const method = mode === 'create' ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Failed to save property');

            router.push('/admin/properties');
            router.refresh();
        } catch (error) {
            console.error('Error saving property:', error);
            alert('Failed to save property');
            setLoading(false);
        }
    };

    // Top Facilities handlers
    const toggleFacility = (facility: string) => {
        setFormData(prev => ({
            ...prev,
            topFacilities: prev.topFacilities.includes(facility)
                ? prev.topFacilities.filter(f => f !== facility)
                : [...prev.topFacilities, facility]
        }));
    };

    // Location Advantages handlers
    const addLocationAdvantage = () => {
        setFormData(prev => ({
            ...prev,
            locationAdvantages: [...prev.locationAdvantages, { name: '', type: 'School', distance: '' }]
        }));
    };

    const removeLocationAdvantage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            locationAdvantages: prev.locationAdvantages.filter((_, i) => i !== index)
        }));
    };

    const updateLocationAdvantage = (index: number, field: keyof LocationAdvantage, value: string) => {
        setFormData(prev => ({
            ...prev,
            locationAdvantages: prev.locationAdvantages.map((loc, i) =>
                i === index ? { ...loc, [field]: value } : loc
            )
        }));
    };

    // Property Details handlers
    const addPropertyDetail = () => {
        setFormData(prev => ({
            ...prev,
            propertyDetails: [...prev.propertyDetails, { key: '', value: '' }]
        }));
    };

    const removePropertyDetail = (index: number) => {
        setFormData(prev => ({
            ...prev,
            propertyDetails: prev.propertyDetails.filter((_, i) => i !== index)
        }));
    };

    const updatePropertyDetail = (index: number, field: 'key' | 'value', value: string) => {
        setFormData(prev => ({
            ...prev,
            propertyDetails: prev.propertyDetails.map((detail, i) =>
                i === index ? { ...detail, [field]: value } : detail
            )
        }));
    };

    // Custom Sections handlers
    const addCustomSection = () => {
        const newSection: CustomSection = {
            id: `custom-${Date.now()}`,
            title: 'New Section',
            type: 'keyvalue',
            content: []
        };
        setFormData(prev => ({
            ...prev,
            customSections: [...prev.customSections, newSection],
            sectionOrder: [...prev.sectionOrder, newSection.id]
        }));
    };

    const removeCustomSection = (id: string) => {
        setFormData(prev => ({
            ...prev,
            customSections: prev.customSections.filter(s => s.id !== id),
            sectionOrder: prev.sectionOrder.filter(sId => sId !== id)
        }));
    };

    const updateCustomSection = (id: string, updates: Partial<CustomSection>) => {
        setFormData(prev => ({
            ...prev,
            customSections: prev.customSections.map(section =>
                section.id === id ? { ...section, ...updates } : section
            )
        }));
    };

    // Section Order handlers
    const moveSectionUp = (index: number) => {
        if (index === 0) return;
        setFormData(prev => {
            const newOrder = [...prev.sectionOrder];
            [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
            return { ...prev, sectionOrder: newOrder };
        });
    };

    const moveSectionDown = (index: number) => {
        if (index === formData.sectionOrder.length - 1) return;
        setFormData(prev => {
            const newOrder = [...prev.sectionOrder];
            [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
            return { ...prev, sectionOrder: newOrder };
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Check if adding these files would exceed the limit
        if (formData.images.length + files.length > 5) {
            alert('Maximum 5 images allowed per property');
            return;
        }

        const formDataToUpload = new FormData();
        for (let i = 0; i < files.length; i++) {
            formDataToUpload.append('images', files[i]);
        }

        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formDataToUpload,
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Upload failed');
            }

            const { paths } = await res.json();
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...paths]
            }));
        } catch (error) {
            console.error('Upload error:', error);
            alert(error instanceof Error ? error.message : 'Failed to upload images');
        }

        // Reset input
        e.target.value = '';
    };

    const handleDeleteImage = (indexToDelete: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_: string, index: number) => index !== indexToDelete)
        }));
    };

    const extractEmbedUrl = (input: string): string => {
        // If it's already a clean URL, return it
        if (input.startsWith('http') && !input.includes('<')) {
            return input;
        }

        // Try to extract from TeleportMe script tag (handles both typo and correct spelling)
        // Note: TeleportMe has a typo in their script: data-teliportme instead of data-teleportme
        const teleportmeMatch = input.match(/data-teli?portme=["']([^"']+)["']/);
        if (teleportmeMatch) {
            return teleportmeMatch[1];
        }

        // Try to extract from iframe src attribute
        const iframeSrcMatch = input.match(/src=["']([^"']+)["']/);
        if (iframeSrcMatch) {
            return iframeSrcMatch[1];
        }

        // Return original input if no pattern matches
        return input;
    };

    const handleTourUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawInput = e.target.value;
        const extractedUrl = extractEmbedUrl(rawInput);
        setFormData({ ...formData, tourEmbedUrl: extractedUrl });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Basic Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Slug *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            URL-friendly identifier (auto-generated from title)
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Deal Type *
                        </label>
                        <select
                            required
                            value={formData.dealType}
                            onChange={(e) => setFormData({ ...formData, dealType: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="rent">Rent</option>
                            <option value="lease">Lease</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Usage Type *
                        </label>
                        <select
                            required
                            value={formData.usageType}
                            onChange={(e) => setFormData({ ...formData, usageType: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="residential">Residential</option>
                            <option value="commercial">Commercial</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Property Subtype
                        </label>
                        <input
                            type="text"
                            value={formData.propertySubtype}
                            onChange={(e) => setFormData({ ...formData, propertySubtype: e.target.value })}
                            placeholder="e.g., Apartment, Villa, Office"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Area *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.areaName}
                            onChange={(e) => setFormData({ ...formData, areaName: e.target.value })}
                            placeholder="e.g., OMR, ECR, Velachery"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>
            </div>

            {/* Pricing & Size */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Pricing & Size</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Price (₹/month) *
                        </label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={formData.priceInr}
                            onChange={(e) => setFormData({ ...formData, priceInr: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    {/* Conditional: Advance Payment for Rent */}
                    {formData.dealType === 'rent' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                Advance Payment
                            </label>
                            <select
                                value={formData.advanceMonths || ''}
                                onChange={(e) => setFormData({ ...formData, advanceMonths: e.target.value ? parseInt(e.target.value) : null })}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Select advance period</option>
                                <option value="3">3 months</option>
                                <option value="6">6 months</option>
                                <option value="9">9 months</option>
                                <option value="12">12 months</option>
                            </select>
                        </div>
                    )}

                    {/* Conditional: Lease Period for Lease */}
                    {formData.dealType === 'lease' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                Lease Period (One-time payment)
                            </label>
                            <select
                                value={formData.leasePeriodYears || ''}
                                onChange={(e) => setFormData({ ...formData, leasePeriodYears: e.target.value ? parseInt(e.target.value) : null })}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Select lease period</option>
                                <option value="1">1 year</option>
                                <option value="2">2 years</option>
                                <option value="3">3 years</option>
                                <option value="4">4 years</option>
                                <option value="5">5 years</option>
                                <option value="6">6 years</option>
                                <option value="7">7 years</option>
                                <option value="8">8 years</option>
                                <option value="9">9 years</option>
                                <option value="10">10 years</option>
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Size (sq ft) *
                        </label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={formData.sizeSqft}
                            onChange={(e) => setFormData({ ...formData, sizeSqft: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Bedrooms
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={formData.bedrooms || ''}
                            onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Bathrooms
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={formData.bathrooms || ''}
                            onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Parking
                        </label>
                        <input
                            type="text"
                            value={formData.parking}
                            onChange={(e) => setFormData({ ...formData, parking: e.target.value })}
                            placeholder="e.g., 2 covered, 1 open"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>
            </div>

            {/* 360° Tour */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">360° Virtual Tour</h2>

                <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Embed URL *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.tourEmbedUrl}
                        onChange={handleTourUrlChange}
                        placeholder="Paste TeleportMe script or direct URL"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Paste the iframe embed URL for the 360° tour
                    </p>
                </div>

                {formData.tourEmbedUrl && (
                    <div className="mt-4">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Preview:</p>
                        <div className="relative w-full bg-gray-900 rounded-xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                            <iframe
                                src={formData.tourEmbedUrl}
                                className="absolute top-0 left-0 w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title="Tour Preview"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Property Images */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Property Images</h2>

                <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Upload Images (Max 5)
                    </label>
                    <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        multiple
                        onChange={handleImageUpload}
                        disabled={formData.images.length >= 5}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900 dark:file:text-primary-300"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Accepted formats: JPG, PNG, WEBP. Max size: 5MB per image. {formData.images.length}/5 uploaded
                    </p>
                </div>

                {formData.images.length > 0 && (
                    <div className="mt-4">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Uploaded Images:</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {formData.images.map((imagePath: string, index: number) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={imagePath}
                                        alt={`Property ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteImage(index)}
                                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Delete image"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    {index === 0 && (
                                        <span className="absolute bottom-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                                            Main
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Top Facilities */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Top Facilities</h2>

                <div className="flex flex-wrap gap-2">
                    {[
                        'Swimming Pool', 'Gymnasium', 'Club House', "Children's Play Area",
                        'Jogging Track', 'Indoor Games', 'Party Hall', 'Badminton Court',
                        'Tennis Court', 'Squash Court', 'Yoga/Meditation Area', 'Library',
                        'Multipurpose Hall', 'Amphitheater', 'Senior Citizen Sitout'
                    ].map((facility) => (
                        <button
                            key={facility}
                            type="button"
                            onClick={() => toggleFacility(facility)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${formData.topFacilities.includes(facility)
                                ? 'bg-primary-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            {facility}
                        </button>
                    ))}
                </div>
            </div>

            {/* Location Advantages */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Location Advantages</h2>

                <div className="space-y-4">
                    {formData.locationAdvantages.map((location, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            <div className="md:col-span-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={location.name}
                                    onChange={(e) => updateLocationAdvantage(index, 'name', e.target.value)}
                                    placeholder="e.g., ABC School"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Type
                                </label>
                                <select
                                    value={location.type}
                                    onChange={(e) => updateLocationAdvantage(index, 'type', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="School">School</option>
                                    <option value="Hospital">Hospital</option>
                                    <option value="Park">Park</option>
                                    <option value="Mall">Mall</option>
                                    <option value="Metro Station">Metro Station</option>
                                    <option value="Bus Stop">Bus Stop</option>
                                    <option value="Railway Station">Railway Station</option>
                                    <option value="Airport">Airport</option>
                                    <option value="Market">Market</option>
                                    <option value="Restaurant">Restaurant</option>
                                    <option value="Bank">Bank</option>
                                    <option value="ATM">ATM</option>
                                    <option value="Gym">Gym</option>
                                    <option value="Temple">Temple</option>
                                    <option value="Church">Church</option>
                                    <option value="Mosque">Mosque</option>
                                </select>
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Distance
                                </label>
                                <input
                                    type="text"
                                    value={location.distance}
                                    onChange={(e) => updateLocationAdvantage(index, 'distance', e.target.value)}
                                    placeholder="e.g., 2.5 Kms"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div className="md:col-span-2 flex items-end">
                                <button
                                    type="button"
                                    onClick={() => removeLocationAdvantage(index)}
                                    className="w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addLocationAdvantage}
                        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-primary-500 hover:text-primary-500 dark:hover:border-primary-400 dark:hover:text-primary-400 font-medium transition-all"
                    >
                        + Add Location Advantage
                    </button>
                </div>
            </div>

            {/* Specifications */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Specifications</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Floor Details */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Floor Number
                        </label>
                        <input
                            type="number"
                            value={formData.floorNumber}
                            onChange={(e) => setFormData({ ...formData, floorNumber: e.target.value })}
                            placeholder="e.g., 12"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Total Floors
                        </label>
                        <input
                            type="number"
                            value={formData.totalFloors}
                            onChange={(e) => setFormData({ ...formData, totalFloors: e.target.value })}
                            placeholder="e.g., 19"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    {/* Furnishing */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Furnishing
                        </label>
                        <select
                            value={formData.furnishing}
                            onChange={(e) => setFormData({ ...formData, furnishing: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="Fully Furnished">Fully Furnished</option>
                            <option value="Semi Furnished">Semi Furnished</option>
                            <option value="Unfurnished">Unfurnished</option>
                        </select>
                    </div>

                    {/* Tenant Preference */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tenant Preference
                        </label>
                        <select
                            value={formData.tenantPreference}
                            onChange={(e) => setFormData({ ...formData, tenantPreference: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="Anyone">Anyone</option>
                            <option value="Family">Family</option>
                            <option value="Single Men">Single Men</option>
                            <option value="Single Women">Single Women</option>
                        </select>
                    </div>

                    {/* Carpet Area */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Carpet Area (sq.ft.)
                        </label>
                        <input
                            type="number"
                            value={formData.carpetAreaSqft}
                            onChange={(e) => setFormData({ ...formData, carpetAreaSqft: e.target.value })}
                            placeholder="e.g., 1600"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    {/* Available From */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Available From
                        </label>
                        <input
                            type="date"
                            value={formData.availableFrom}
                            onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    {/* Property Age */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Property Age
                        </label>
                        <select
                            value={formData.propertyAge}
                            onChange={(e) => setFormData({ ...formData, propertyAge: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="Under Construction">Under Construction</option>
                            <option value="0-1 Year">0-1 Year</option>
                            <option value="1-5 Years">1-5 Years</option>
                            <option value="5-10 Years">5-10 Years</option>
                            <option value="10+ Years">10+ Years</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Property Details */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Property Details</h2>
                    <button
                        type="button"
                        onClick={addPropertyDetail}
                        className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
                    >
                        + Add Field
                    </button>
                </div>

                <div className="space-y-3">
                    {formData.propertyDetails.map((detail, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            <div className="md:col-span-5">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Key
                                </label>
                                <input
                                    type="text"
                                    value={detail.key}
                                    onChange={(e) => updatePropertyDetail(index, 'key', e.target.value)}
                                    placeholder="e.g., Layout, Furnishing"
                                    list={`property-keys-${index}`}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                />
                                <datalist id={`property-keys-${index}`}>
                                    <option value="Layout" />
                                    <option value="Carpet Area" />
                                    <option value="Furnishing" />
                                    <option value="Power backup" />
                                    <option value="Width of facing road" />
                                    <option value="Floor Number" />
                                    <option value="Flooring" />
                                    <option value="Facing" />
                                    <option value="Wheelchair friendly" />
                                    <option value="Rental agreement duration" />
                                    <option value="Water Supply" />
                                    <option value="Overlooking" />
                                    <option value="Balconies" />
                                </datalist>
                            </div>
                            <div className="md:col-span-5">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Value
                                </label>
                                <input
                                    type="text"
                                    value={detail.value}
                                    onChange={(e) => updatePropertyDetail(index, 'value', e.target.value)}
                                    placeholder="e.g., 3 BHK, Semifurnished"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div className="md:col-span-2 flex items-end">
                                <button
                                    type="button"
                                    onClick={() => removePropertyDetail(index)}
                                    className="w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}

                    {formData.propertyDetails.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No property details added yet. Click "+ Add Field" to get started.
                        </div>
                    )}
                </div>
            </div>

            {/* Publishing */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Publishing</h2>

                <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isPublished}
                            onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-gray-900 dark:text-white font-medium">Publish this property</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isFeatured}
                            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-gray-900 dark:text-white font-medium">Feature on homepage</span>
                    </label>
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
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all disabled:cursor-not-allowed"
                >
                    {loading ? 'Saving...' : mode === 'create' ? 'Create Property' : 'Update Property'}
                </button>
            </div>
        </form>
    );
}
