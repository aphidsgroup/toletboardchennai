'use client';

import { useState, useEffect } from 'react';

export default function LeadPopupForm({ popupTitle, popupSubtitle }: {
    popupTitle?: string;
    popupSubtitle?: string;
}) {
    const [show, setShow] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        lookingFor: 'rent',
        propertyType: '',
        budgetRange: '',
        preferredArea: '',
        message: '',
    });

    useEffect(() => {
        // Check if popup was already shown
        const alreadyShown = localStorage.getItem('lead_popup_shown');
        if (alreadyShown) return;

        const timer = setTimeout(() => {
            setShow(true);
            localStorage.setItem('lead_popup_shown', 'true');
        }, 5000); // 5 seconds

        return () => clearTimeout(timer);
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            setSubmitted(true);
        } catch {
            // Still mark as submitted to close the popup
            setSubmitted(true);
        } finally {
            setLoading(false);
        }
    }

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
                {/* Close button */}
                <button
                    onClick={() => setShow(false)}
                    className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
                >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {submitted ? (
                    /* Success state */
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Thank You!</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">We&apos;ll get back to you shortly with the best options.</p>
                        <button
                            onClick={() => setShow(false)}
                            className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl"
                        >
                            Continue Browsing
                        </button>
                    </div>
                ) : (
                    /* Form */
                    <div className="p-6">
                        <div className="text-center mb-5">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                {popupTitle || 'Looking for a Property?'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {popupSubtitle || 'Tell us what you need and we\'ll find the best options for you'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    required
                                    placeholder="Your Name *"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
                                />
                                <input
                                    type="tel"
                                    required
                                    placeholder="Phone Number *"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            <input
                                type="email"
                                placeholder="Email (optional)"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
                            />

                            <div className="flex rounded-xl bg-gray-100 dark:bg-gray-700 p-1">
                                {['rent', 'lease'].map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, lookingFor: type, budgetRange: '' })}
                                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${formData.lookingFor === type
                                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                            : 'text-gray-500'
                                            }`}
                                    >
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </button>
                                ))}
                            </div>

                            <select
                                value={formData.propertyType}
                                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Property Type (optional)</option>
                                <option value="Apartment">Apartment / Flat</option>
                                <option value="Independent House">Independent House</option>
                                <option value="Villa">Villa</option>
                                <option value="Office">Office Space</option>
                                <option value="Shop">Shop / Retail</option>
                                <option value="PG">PG / Co-living</option>
                                <option value="Other">Other</option>
                            </select>

                            <div className="grid grid-cols-2 gap-3">
                                <select
                                    value={formData.budgetRange}
                                    onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                                    className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">Budget Range</option>
                                    {formData.lookingFor === 'lease' ? (
                                        <>
                                            <option value="Under ₹5L">Under ₹5L</option>
                                            <option value="₹5L - ₹10L">₹5L - ₹10L</option>
                                            <option value="₹10L - ₹25L">₹10L - ₹25L</option>
                                            <option value="₹25L - ₹50L">₹25L - ₹50L</option>
                                            <option value="₹50L - ₹1Cr">₹50L - ₹1Cr</option>
                                            <option value="Above ₹1Cr">Above ₹1Cr</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="Under ₹10K">Under ₹10K</option>
                                            <option value="₹10K - ₹25K">₹10K - ₹25K</option>
                                            <option value="₹25K - ₹50K">₹25K - ₹50K</option>
                                            <option value="₹50K - ₹1L">₹50K - ₹1L</option>
                                            <option value="Above ₹1L">Above ₹1L</option>
                                        </>
                                    )}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Preferred Area"
                                    value={formData.preferredArea}
                                    onChange={(e) => setFormData({ ...formData, preferredArea: e.target.value })}
                                    className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            <textarea
                                placeholder="Any specific requirements?"
                                rows={2}
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 resize-none"
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                {loading ? 'Submitting...' : 'Submit Enquiry'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
