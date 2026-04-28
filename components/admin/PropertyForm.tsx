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
    parseSectionNames,
    stringifySectionNames,
    DEFAULT_SECTION_ORDER,
    DEFAULT_SECTION_NAMES,
    type SectionNames,
} from '@/lib/utils';
import { uploadImageDirect } from '@/lib/supabase-browser';

interface PropertyFormProps {
    property?: Property;
    mode: 'create' | 'edit';
    apiBasePath?: string;
    redirectPath?: string;
    role?: 'admin' | 'manager';
}

export default function PropertyForm({ property, mode, apiBasePath = '/api/admin/properties', redirectPath = '/admin/properties', role = 'admin' }: PropertyFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploadingImages, setUploadingImages] = useState<string[]>([]); // filenames being uploaded

    const [formData, setFormData] = useState({
        title: property?.title || '',
        slug: property?.slug || '',
        dealType: property?.dealType || 'rent',
        usageType: property?.usageType || 'residential',
        propertySubtype: property?.propertySubtype || '',
        areaName: property?.areaName || '',
        city: property?.city || 'Chennai',
        priceInr: property?.priceInr || 0,
        isNegotiable: property?.isNegotiable || false,
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
        sectionOrder: property ? (parseSectionOrder(property.sectionOrder).length > 0 ? parseSectionOrder(property.sectionOrder) : DEFAULT_SECTION_ORDER) : DEFAULT_SECTION_ORDER,
        sectionNames: property ? parseSectionNames((property as any).sectionNames) : {},

        tourEmbedUrl: property?.tourEmbedUrl || '',
        images: property?.images ? JSON.parse(property.images) : [],
        isPublished: property?.isPublished || false,
        isFeatured: property?.isFeatured || false,
        isVerified: property?.isVerified || false,
        isBachelorFriendly: property?.isBachelorFriendly || false,
        isPetFriendly: property?.isPetFriendly || false,
        isVegetarianOnly: property?.isVegetarianOnly || false,

        // Editable Highlights & FAQ
        customHighlights: property?.customHighlights ? JSON.parse(property.customHighlights) : [],
        customFaqs: property?.customFaqs ? JSON.parse(property.customFaqs) : [],
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
                sectionNames: stringifySectionNames(formData.sectionNames),

                images: JSON.stringify(formData.images),

                // Editable Highlights & FAQ
                customHighlights: formData.customHighlights.length > 0 ? JSON.stringify(formData.customHighlights) : null,
                customFaqs: formData.customFaqs.length > 0 ? JSON.stringify(formData.customFaqs) : null,
            };

            const url = mode === 'create'
                ? apiBasePath
                : `${apiBasePath}/${property!.id}`;

            const method = mode === 'create' ? 'POST' : 'PUT';

            // Manager edits go through change request approval
            if (role === 'manager' && mode === 'edit') {
                const res = await fetch('/api/admin/change-requests', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'edit_property', entityType: 'property', entityId: property!.id, entityTitle: property!.title, changes: payload, requestedBy: 'Manager' }),
                });
                if (!res.ok) throw new Error('Failed to submit change request');
                alert('Edit request submitted for admin approval.');
                router.push(redirectPath);
                return;
            }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Failed to save property');

            router.push(redirectPath);
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

    // Section Names handlers
    const updateSectionName = (sectionId: string, name: string) => {
        setFormData(prev => ({
            ...prev,
            sectionNames: { ...prev.sectionNames, [sectionId]: name }
        }));
    };

    // Custom section content handlers
    const addCustomSectionRow = (sectionId: string) => {
        setFormData(prev => ({
            ...prev,
            customSections: prev.customSections.map(s =>
                s.id === sectionId && Array.isArray(s.content)
                    ? { ...s, content: [...(s.content as PropertyDetail[]), { key: '', value: '' }] }
                    : s
            )
        }));
    };

    const removeCustomSectionRow = (sectionId: string, rowIndex: number) => {
        setFormData(prev => ({
            ...prev,
            customSections: prev.customSections.map(s =>
                s.id === sectionId && Array.isArray(s.content)
                    ? { ...s, content: (s.content as PropertyDetail[]).filter((_, i) => i !== rowIndex) }
                    : s
            )
        }));
    };

    const updateCustomSectionRow = (sectionId: string, rowIndex: number, field: 'key' | 'value', value: string) => {
        setFormData(prev => ({
            ...prev,
            customSections: prev.customSections.map(s =>
                s.id === sectionId && Array.isArray(s.content)
                    ? {
                        ...s,
                        content: (s.content as PropertyDetail[]).map((row, i) =>
                            i === rowIndex ? { ...row, [field]: value } : row
                        )
                    }
                    : s
            )
        }));
    };

    // Toggle section in order (add/remove)
    const toggleSectionInOrder = (sectionId: string) => {
        setFormData(prev => {
            if (prev.sectionOrder.includes(sectionId)) {
                return { ...prev, sectionOrder: prev.sectionOrder.filter(id => id !== sectionId) };
            } else {
                return { ...prev, sectionOrder: [...prev.sectionOrder, sectionId] };
            }
        });
    };

    // Get display name for a section
    const getSectionDisplayName = (sectionId: string): string => {
        if (formData.sectionNames[sectionId]) return formData.sectionNames[sectionId];
        if (DEFAULT_SECTION_NAMES[sectionId]) return DEFAULT_SECTION_NAMES[sectionId];
        const custom = formData.customSections.find(s => s.id === sectionId);
        return custom?.title || sectionId;
    };

    // All available section IDs
    const allBuiltInSections = ['tour', 'basic-info', 'facilities', 'locations', 'specifications', 'property-details'];
    const allSectionIds = [...allBuiltInSections, ...formData.customSections.map(s => s.id)];

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (formData.images.length + files.length > 5) {
            alert('Maximum 5 images allowed per property');
            return;
        }

        const fileArray = Array.from(files);
        setUploadingImages(fileArray.map(f => f.name));

        // Upload each file to Cloudinary (auto-converted to WebP)
        const uploadedPaths: string[] = [];
        for (let i = 0; i < fileArray.length; i++) {
            const file = fileArray[i];
            try {
                const url = await uploadImageDirect(file, (pct) => {
                    setUploadingImages(prev =>
                        prev.map((name, idx) => idx === i ? `${file.name} (${pct}%)` : name)
                    );
                });
                uploadedPaths.push(url);
            } catch (error) {
                console.error('Upload error:', error);
                alert(error instanceof Error ? error.message : `Failed to upload ${file.name}`);
                break;
            }
        }

        setUploadingImages([]);

        if (uploadedPaths.length > 0) {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...uploadedPaths]
            }));
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
                        <label className="flex items-center gap-2 mt-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isNegotiable}
                                onChange={(e) => setFormData({ ...formData, isNegotiable: e.target.checked })}
                                className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Price is Negotiable</span>
                        </label>
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
                <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Property Images</h2>
                    <span className="inline-flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold px-2 py-0.5 rounded-full">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Auto WebP Optimized
                    </span>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Upload Images (Max 5)
                    </label>
                    <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        multiple
                        onChange={handleImageUpload}
                        disabled={formData.images.length >= 5 || uploadingImages.length > 0}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900 dark:file:text-primary-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Accepted: JPG, PNG, WEBP, GIF · Max 10MB · Auto-converted to WebP · {formData.images.length}/5 uploaded
                    </p>
                </div>

                {/* Upload progress */}
                {uploadingImages.length > 0 && (
                    <div className="mt-3 space-y-2">
                        {uploadingImages.map((name, i) => (
                            <div key={i} className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-2.5">
                                <svg className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                <span className="text-xs text-blue-700 dark:text-blue-300 font-medium truncate flex-1">{name}</span>
                                <span className="text-xs text-blue-500 font-semibold flex-shrink-0">Uploading to Cloudinary…</span>
                            </div>
                        ))}
                    </div>
                )}

                {formData.images.length > 0 && (
                    <div className="mt-4">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Uploaded Images (WebP):</p>
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
                                    <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded font-mono">
                                        {index === 0 ? '⭐ Main' : `#${index + 1}`}
                                    </span>
                                    {imagePath.includes('cloudinary') && (
                                        <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                                            WebP
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

            {/* Custom Sections */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Custom Sections</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add your own sections to the property page</p>
                    </div>
                    <button
                        type="button"
                        onClick={addCustomSection}
                        className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
                    >
                        + Add Section
                    </button>
                </div>

                <div className="space-y-6">
                    {formData.customSections.map((section) => (
                        <div key={section.id} className="border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                            {/* Section Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <input
                                    type="text"
                                    value={section.title}
                                    onChange={(e) => updateCustomSection(section.id, { title: e.target.value })}
                                    placeholder="Section Title"
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-primary-500"
                                />
                                <select
                                    value={section.type}
                                    onChange={(e) => updateCustomSection(section.id, {
                                        type: e.target.value as 'keyvalue' | 'text',
                                        content: e.target.value === 'keyvalue' ? [] : ''
                                    })}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="keyvalue">Key-Value Table</option>
                                    <option value="text">Text Paragraph</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (confirm(`Delete section "${section.title}"?`)) {
                                            removeCustomSection(section.id);
                                        }
                                    }}
                                    className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                                >
                                    Delete
                                </button>
                            </div>

                            {/* Key-Value Content */}
                            {section.type === 'keyvalue' && Array.isArray(section.content) && (
                                <div className="space-y-2">
                                    {(section.content as PropertyDetail[]).map((row, rowIndex) => (
                                        <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-12 gap-2">
                                            <div className="md:col-span-5">
                                                <input
                                                    type="text"
                                                    value={row.key}
                                                    onChange={(e) => updateCustomSectionRow(section.id, rowIndex, 'key', e.target.value)}
                                                    placeholder="Key (e.g., Floor Type)"
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
                                                />
                                            </div>
                                            <div className="md:col-span-5">
                                                <input
                                                    type="text"
                                                    value={row.value}
                                                    onChange={(e) => updateCustomSectionRow(section.id, rowIndex, 'value', e.target.value)}
                                                    placeholder="Value (e.g., Vitrified Tiles)"
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <button
                                                    type="button"
                                                    onClick={() => removeCustomSectionRow(section.id, rowIndex)}
                                                    className="w-full px-3 py-2 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-600 dark:text-red-300 rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addCustomSectionRow(section.id)}
                                        className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-colors text-sm"
                                    >
                                        + Add Row
                                    </button>
                                </div>
                            )}

                            {/* Text Content */}
                            {section.type === 'text' && (
                                <textarea
                                    value={typeof section.content === 'string' ? section.content : ''}
                                    onChange={(e) => updateCustomSection(section.id, { content: e.target.value })}
                                    placeholder="Write your section content here..."
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                />
                            )}
                        </div>
                    ))}

                    {formData.customSections.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No custom sections yet. Click &quot;+ Add Section&quot; to create one.
                        </div>
                    )}
                </div>
            </div>

            {/* Section Order & Names */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Section Order & Names</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Reorder sections, toggle visibility, and rename headings on the property page</p>
                </div>

                <div className="space-y-2">
                    {formData.sectionOrder.map((sectionId, index) => (
                        <div key={sectionId} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            {/* Reorder buttons */}
                            <div className="flex flex-col gap-1">
                                <button
                                    type="button"
                                    onClick={() => moveSectionUp(index)}
                                    disabled={index === 0}
                                    className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Move up"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => moveSectionDown(index)}
                                    disabled={index === formData.sectionOrder.length - 1}
                                    className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Move down"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>

                            {/* Section name (editable) */}
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={formData.sectionNames[sectionId] || getSectionDisplayName(sectionId)}
                                    onChange={(e) => updateSectionName(sectionId, e.target.value)}
                                    className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            {/* Type badge */}
                            <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full whitespace-nowrap">
                                {allBuiltInSections.includes(sectionId) ? 'Built-in' : 'Custom'}
                            </span>

                            {/* Remove from order (hide) */}
                            <button
                                type="button"
                                onClick={() => toggleSectionInOrder(sectionId)}
                                className="p-2 text-red-400 hover:text-red-600 transition-colors"
                                title="Hide this section"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.44 6.44m7.072 7.072l3.534 3.535M6.44 6.44L3 3m3.44 3.44l4.242 4.242m5.416 5.416L21 21" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>

                {/* Hidden sections - show button to re-add */}
                {allSectionIds.filter(id => !formData.sectionOrder.includes(id)).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Hidden Sections</p>
                        <div className="flex flex-wrap gap-2">
                            {allSectionIds.filter(id => !formData.sectionOrder.includes(id)).map(sectionId => (
                                <button
                                    key={sectionId}
                                    type="button"
                                    onClick={() => toggleSectionInOrder(sectionId)}
                                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-600 dark:hover:text-primary-300 transition-colors flex items-center gap-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Show {getSectionDisplayName(sectionId)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Property Highlights Editor */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Property Highlights</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Auto-generated from property data. Add custom highlights to override or supplement.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, customHighlights: [...prev.customHighlights, { label: '', value: '' }] }))}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                        + Add Highlight
                    </button>
                </div>

                {formData.customHighlights.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                        <p className="text-gray-500 dark:text-gray-400">Using auto-generated highlights (size, price, rooms, etc.)</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Click "+ Add Highlight" to add custom highlights that will replace the auto-generated ones</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {formData.customHighlights.map((h: { label: string; value: string }, index: number) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex-1 grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Label (e.g., Property Type)"
                                        value={h.label}
                                        onChange={(e) => {
                                            const updated = [...formData.customHighlights];
                                            updated[index] = { ...updated[index], label: e.target.value };
                                            setFormData(prev => ({ ...prev, customHighlights: updated }));
                                        }}
                                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Value (e.g., 3 BHK Apartment)"
                                        value={h.value}
                                        onChange={(e) => {
                                            const updated = [...formData.customHighlights];
                                            updated[index] = { ...updated[index], value: e.target.value };
                                            setFormData(prev => ({ ...prev, customHighlights: updated }));
                                        }}
                                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const updated = formData.customHighlights.filter((_: any, i: number) => i !== index);
                                        setFormData(prev => ({ ...prev, customHighlights: updated }));
                                    }}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, customHighlights: [] }))}
                            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                        >
                            Clear all &amp; use auto-generated
                        </button>
                    </div>
                )}
            </div>

            {/* FAQ Editor */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Auto-generated from property data. Add custom FAQs to override or supplement.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, customFaqs: [...prev.customFaqs, { q: '', a: '' }] }))}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                        + Add FAQ
                    </button>
                </div>

                {formData.customFaqs.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                        <p className="text-gray-500 dark:text-gray-400">Using auto-generated FAQs (area info, pricing, connectivity)</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Click "+ Add FAQ" to add custom FAQs that will replace the auto-generated ones</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {formData.customFaqs.map((faq: { q: string; a: string }, index: number) => (
                            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <span className="text-xs font-bold text-primary-600 dark:text-primary-400 mt-1">Q{index + 1}</span>
                                    <input
                                        type="text"
                                        placeholder="Question"
                                        value={faq.q}
                                        onChange={(e) => {
                                            const updated = [...formData.customFaqs];
                                            updated[index] = { ...updated[index], q: e.target.value };
                                            setFormData(prev => ({ ...prev, customFaqs: updated }));
                                        }}
                                        className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const updated = formData.customFaqs.filter((_: any, i: number) => i !== index);
                                            setFormData(prev => ({ ...prev, customFaqs: updated }));
                                        }}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                                <textarea
                                    placeholder="Answer"
                                    value={faq.a}
                                    onChange={(e) => {
                                        const updated = [...formData.customFaqs];
                                        updated[index] = { ...updated[index], a: e.target.value };
                                        setFormData(prev => ({ ...prev, customFaqs: updated }));
                                    }}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                />
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, customFaqs: [] }))}
                            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                        >
                            Clear all &amp; use auto-generated
                        </button>
                    </div>
                )}
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

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isVerified}
                            onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                            className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-gray-900 dark:text-white font-medium">Physically Verified</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isBachelorFriendly}
                            onChange={(e) => setFormData({ ...formData, isBachelorFriendly: e.target.checked })}
                            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-gray-900 dark:text-white font-medium">Bachelor Friendly</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isPetFriendly}
                            onChange={(e) => setFormData({ ...formData, isPetFriendly: e.target.checked })}
                            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-gray-900 dark:text-white font-medium">Pet Friendly</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isVegetarianOnly}
                            onChange={(e) => setFormData({ ...formData, isVegetarianOnly: e.target.checked })}
                            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-gray-900 dark:text-white font-medium">Vegetarians Only</span>
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
