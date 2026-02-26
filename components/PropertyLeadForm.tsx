'use client';

import { useState, useEffect } from 'react';

interface PropertyLeadFormProps {
    propertyId: string;
    propertyTitle: string;
}

export default function PropertyLeadForm({ propertyId, propertyTitle }: PropertyLeadFormProps) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Auto-fill from session
    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    if (data.user.name) setName(data.user.name);
                    if (data.user.phone) setPhone(data.user.phone);
                }
            })
            .catch(() => { });
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const cleanPhone = phone.replace(/\D/g, '').replace(/^91/, '');
        if (cleanPhone.length !== 10) {
            setError('Please enter a valid 10-digit phone number');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    phone: cleanPhone,
                    lookingFor: 'rent',
                    message: `Interested in: ${propertyTitle}`,
                    propertyId,
                }),
            });

            if (!res.ok) {
                setError('Failed to submit. Please try again.');
                return;
            }

            setSubmitted(true);
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    if (submitted) {
        return (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-green-800 dark:text-green-300 mb-1">Request Submitted!</h3>
                <p className="text-sm text-green-600 dark:text-green-400">We&apos;ll call you back shortly regarding this property.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Get a Callback</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">We&apos;ll contact you about this property</p>
                </div>
            </div>

            {error && (
                <div className="mb-3 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
                <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                    placeholder="Your Name"
                />
                <div className="flex overflow-hidden rounded-xl">
                    <span className="inline-flex items-center px-3 bg-gray-100 dark:bg-gray-600 border border-r-0 border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 font-medium flex-shrink-0">
                        +91
                    </span>
                    <input
                        type="tel"
                        required
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 min-w-0 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                        placeholder="98765 43210"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gray-900 hover:bg-black text-primary-400 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                    {loading ? 'Submitting...' : '📞 Request Callback'}
                </button>
            </form>
        </div>
    );
}
