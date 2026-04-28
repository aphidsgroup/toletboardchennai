'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CHENNAI_AREAS } from '@/lib/chennai-areas';

const TENANT_TYPES = [
    { id: 'family-veg', label: 'Family (Veg Only)' },
    { id: 'family-nonveg', label: 'Family (Veg/Non-Veg)' },
    { id: 'bachelor-female', label: 'Bachelor (Female)' },
    { id: 'bachelor-male', label: 'Bachelor (Male)' },
];

const PROPERTY_TYPES = [
    { id: 'apartment', label: 'Apartment' },
    { id: 'villa', label: 'Villa' },
    { id: 'independent-house', label: 'Independent House' },
    { id: 'commercial', label: 'Commercial Space' },
];

const BEDROOM_OPTIONS = [
    { id: '1-bhk', label: '1 BHK' },
    { id: '2-bhk', label: '2 BHK' },
    { id: '3-bhk', label: '3 BHK' },
    { id: '4-plus-bhk', label: '4+ BHK' },
    { id: 'studio', label: 'Studio/Other' },
];

const BUDGET_RANGES = [
    'Below ₹10,000',
    '₹10,000 - ₹20,000',
    '₹20,000 - ₹30,000',
    '₹30,000 - ₹50,000',
    '₹50,000 - ₹1,00,000',
    'Above ₹1,00,000',
];

export default function TenantFormPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [areaSearch, setAreaSearch] = useState('');
    const [showAreaDropdown, setShowAreaDropdown] = useState(false);
    const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        whatsappNumber: '',
        email: '',
        wantsWhatsappUpdates: false,
        tenantType: '',
        preferredAreas: '',
        propertyType: '',
        budgetRange: '',
        bedrooms: '',
        moveInDate: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelect = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleArea = (area: string) => {
        setSelectedAreas(prev => {
            if (prev.includes(area)) {
                return prev.filter(a => a !== area);
            }
            if (prev.length >= 5) return prev;
            return [...prev, area];
        });
    };

    useEffect(() => {
        setFormData(prev => ({ ...prev, preferredAreas: selectedAreas.join(', ') }));
    }, [selectedAreas]);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        const isRepeated = (str: string) => /^(.)\1+$/.test(str.toLowerCase().trim());
        const hasExcessiveRepetition = (str: string) => /(.)\1{3,}/.test(str.toLowerCase().trim());
        const isJunkName = (name: string) => {
            const junkKeywords = ['test', 'demo', 'junk', 'fake', 'admin', 'development', 'mobile app', 'agency', 'service', 'company', '9999', '0000'];
            const lower = name.toLowerCase();
            return junkKeywords.some(k => lower.includes(k)) || hasExcessiveRepetition(name);
        };

        if (formData.name.trim().length < 3) newErrors.name = 'Name must be at least 3 characters';
        if (isRepeated(formData.name) || isJunkName(formData.name)) newErrors.name = 'Please enter a valid full name';
        
        if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Please enter a valid 10-digit WhatsApp number';
        if (isRepeated(formData.phone)) newErrors.phone = 'Please enter a valid phone number';
        
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        } else if (formData.email.toLowerCase().includes('toletboardchennai.com')) {
            newErrors.email = 'This email address is reserved for system use';
        }

        if (!formData.tenantType) newErrors.tenantType = 'Please select your tenant profile';
        if (selectedAreas.length === 0) newErrors.preferredAreas = 'Please select at least one area';
        if (!formData.propertyType) newErrors.propertyType = 'Please select preferred property type';
        if (!formData.budgetRange) newErrors.budgetRange = 'Please select your budget';
        if (!formData.bedrooms) newErrors.bedrooms = 'Please select BHK requirement';
        if (!formData.moveInDate) newErrors.moveInDate = 'Please select move-in date';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const res = await fetch('/api/forms/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    formType: 'tenant',
                    ...formData,
                    whatsappNumber: formData.whatsappNumber || formData.phone,
                }),
            });
            if (res.ok) {
                setSubmitted(true);
            }
        } catch (error) {
            console.error('Submission failed:', error);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 max-w-md w-full text-center animate-scale-in">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Form Submitted!</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Thank you for your interest! We'll contact you soon with suitable rental options.
                    </p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="w-full btn-premium py-4 rounded-2xl font-bold"
                    >
                        Submit Another
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6">
            <div className="max-w-xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        Looking for Rental Property?
                    </h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                        Help us find the perfect home for you in Chennai.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-6 sm:p-10 border border-gray-100 dark:border-gray-800">
                    {/* Basic Info */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Your Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                className={`w-full px-4 py-3 rounded-xl border transition-all bg-gray-50 dark:bg-gray-800 outline-none ${errors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500'}`}
                            />
                            {errors.name && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                WhatsApp Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="10-digit WhatsApp number"
                                className={`w-full px-4 py-3 rounded-xl border transition-all bg-gray-50 dark:bg-gray-800 outline-none ${errors.phone ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500'}`}
                            />
                            {errors.phone && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider">{errors.phone}</p>}
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="wantsWhatsappUpdates"
                                checked={formData.wantsWhatsappUpdates}
                                onChange={(e) => setFormData(prev => ({ ...prev, wantsWhatsappUpdates: e.target.checked }))}
                                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                            />
                            <label htmlFor="wantsWhatsappUpdates" className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                                Want to receive property updates on WhatsApp? <span className="text-red-500">*</span>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Email address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email address"
                                className={`w-full px-4 py-3 rounded-xl border transition-all bg-gray-50 dark:bg-gray-800 outline-none ${errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500'}`}
                            />
                            {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{errors.email}</p>}
                        </div>
                    </div>

                    {/* Tenant Type */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">
                            Tenant Type <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {TENANT_TYPES.map((type) => (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => handleSelect('tenantType', type.label)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${formData.tenantType === type.label
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                            : errors.tenantType ? 'border-red-500 bg-red-50/50' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-primary-200'
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${formData.tenantType === type.label ? 'border-primary-500 bg-primary-500' : 'border-gray-300'}`}>
                                        {formData.tenantType === type.label && <div className="w-2 h-2 bg-white rounded-full" />}
                                    </div>
                                    <span className="text-sm font-semibold">{type.label}</span>
                                </button>
                            ))}
                        </div>
                        {errors.tenantType && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-wider">{errors.tenantType}</p>}
                    </div>

                    {/* Preferred Areas */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Preferred Areas (Max 5) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                            <div className="flex flex-wrap gap-2 mb-3">
                                {selectedAreas.map(area => (
                                    <span key={area} className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2 animate-scale-in">
                                        {area}
                                        <button 
                                            type="button"
                                            onClick={() => toggleArea(area)}
                                            className="hover:text-primary-900 dark:hover:text-white"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </span>
                                ))}
                                {selectedAreas.length === 0 && (
                                    <span className="text-xs text-gray-400 italic">No areas selected yet</span>
                                )}
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder={selectedAreas.length >= 5 ? "Max areas reached" : "Search areas..."}
                                    disabled={selectedAreas.length >= 5}
                                    value={areaSearch}
                                    onChange={(e) => {
                                        setAreaSearch(e.target.value);
                                        setShowAreaDropdown(true);
                                    }}
                                    onFocus={() => setShowAreaDropdown(true)}
                                    className={`w-full px-4 py-3 rounded-xl border transition-all bg-gray-50 dark:bg-gray-800 outline-none ${errors.preferredAreas ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500'}`}
                                />
                                {errors.preferredAreas && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{errors.preferredAreas}</p>}
                                {showAreaDropdown && areaSearch && (
                                    <div className="absolute z-50 w-full mt-2 max-h-60 overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl custom-scrollbar animate-fade-in">
                                        {CHENNAI_AREAS.filter(a => 
                                            a.toLowerCase().includes(areaSearch.toLowerCase()) && 
                                            !selectedAreas.includes(a)
                                        ).slice(0, 50).map(area => (
                                            <button
                                                key={area}
                                                type="button"
                                                onClick={() => {
                                                    toggleArea(area);
                                                    setAreaSearch('');
                                                    setShowAreaDropdown(false);
                                                }}
                                                className="w-full text-left px-4 py-3 hover:bg-primary-50 dark:hover:bg-primary-900/10 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0"
                                            >
                                                {area}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Property Type */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">
                            Property Type <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-3">
                            {PROPERTY_TYPES.map((type, idx) => (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => handleSelect('propertyType', type.label)}
                                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border-2 transition-all ${formData.propertyType === type.label
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                            : errors.propertyType ? 'border-red-500 bg-red-50/50' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 hover:border-primary-200'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${formData.propertyType === type.label ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                    <span className={`text-sm font-bold ${formData.propertyType === type.label ? 'text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400'}`}>
                                        {type.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                        {errors.propertyType && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-wider">{errors.propertyType}</p>}
                    </div>

                    {/* Budget */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Budget Range <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="budgetRange"
                            required
                            value={formData.budgetRange}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-xl border transition-all bg-gray-50 dark:bg-gray-800 outline-none ${errors.budgetRange ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500'}`}
                        >
                            <option value="">Select budget range</option>
                            {BUDGET_RANGES.map(range => (
                                <option key={range} value={range}>{range}</option>
                            ))}
                        </select>
                        {errors.budgetRange && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{errors.budgetRange}</p>}
                    </div>

                    {/* Bedrooms */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">
                            Number of Bedrooms <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-3">
                            {BEDROOM_OPTIONS.map((opt, idx) => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => handleSelect('bedrooms', opt.label)}
                                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border-2 transition-all ${formData.bedrooms === opt.label
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                            : errors.bedrooms ? 'border-red-500 bg-red-50/50' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 hover:border-primary-200'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${formData.bedrooms === opt.label ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                    <span className={`text-sm font-bold ${formData.bedrooms === opt.label ? 'text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400'}`}>
                                        {opt.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                        {errors.bedrooms && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-wider">{errors.bedrooms}</p>}
                    </div>

                    {/* Move-in Date */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Preferred Move-in Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="moveInDate"
                            required
                            value={formData.moveInDate}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-xl border transition-all bg-gray-50 dark:bg-gray-800 outline-none ${errors.moveInDate ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500'}`}
                        />
                        {errors.moveInDate && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{errors.moveInDate}</p>}
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-premium py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Submit</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <p className="text-center text-xs text-gray-400 mt-8">
                    Privacy Secured • Tolet Board Chennai
                </p>
            </div>
        </main>
    );
}
