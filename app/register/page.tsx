'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/';

    // Step 1: Registration form | Step 2: WhatsApp prompt
    const [step, setStep] = useState<1 | 2>(1);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // WhatsApp step state
    const [whatsappSame, setWhatsappSame] = useState<'yes' | 'no' | null>(null);
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [wantsUpdates, setWantsUpdates] = useState<boolean | null>(null);
    const [savingWa, setSavingWa] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        const clean = formData.phone.replace(/\D/g, '').replace(/^91/, '');
        if (clean.length !== 10) {
            setError('Please enter a valid 10-digit phone number');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/user/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    password: formData.password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Registration failed');
                return;
            }

            setStep(2);
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    async function handleWhatsappSave() {
        setSavingWa(true);
        try {
            const waNumber = whatsappSame === 'yes'
                ? formData.phone.replace(/\D/g, '').replace(/^91/, '')
                : whatsappNumber.replace(/\D/g, '').replace(/^91/, '');

            await fetch('/api/auth/user/register', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    whatsappNumber: waNumber || null,
                    wantsWhatsappUpdates: wantsUpdates === true,
                }),
            });
        } catch {
            // Non-critical
        } finally {
            setSavingWa(false);
            router.push(redirectTo);
            router.refresh();
        }
    }

    function handleSkipWhatsapp() {
        router.push(redirectTo);
        router.refresh();
    }

    if (step === 2) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Stay Updated on WhatsApp</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Get alerts when new properties are listed</p>
                        </div>

                        <div className="mb-5">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Is your WhatsApp number the same as your registered number?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setWhatsappSame('yes')}
                                    className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${whatsappSame === 'yes'
                                        ? 'bg-green-500 text-white shadow-md'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    Yes, same number
                                </button>
                                <button
                                    onClick={() => setWhatsappSame('no')}
                                    className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${whatsappSame === 'no'
                                        ? 'bg-green-500 text-white shadow-md'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    No, different
                                </button>
                            </div>
                        </div>

                        {whatsappSame === 'no' && (
                            <div className="mb-5">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                    WhatsApp Number
                                </label>
                                <div className="flex overflow-hidden rounded-xl">
                                    <span className="inline-flex items-center px-3 bg-gray-100 dark:bg-gray-600 border border-r-0 border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 font-medium flex-shrink-0">
                                        +91
                                    </span>
                                    <input
                                        type="tel"
                                        required
                                        maxLength={10}
                                        value={whatsappNumber}
                                        onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                                        className="flex-1 min-w-0 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                        placeholder="98765 43210"
                                    />
                                </div>
                            </div>
                        )}

                        {whatsappSame !== null && (
                            <div className="mb-6">
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Receive new property alerts on WhatsApp?
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setWantsUpdates(true)}
                                        className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${wantsUpdates === true
                                            ? 'bg-green-500 text-white shadow-md'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        Yes, notify me
                                    </button>
                                    <button
                                        onClick={() => setWantsUpdates(false)}
                                        className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${wantsUpdates === false
                                            ? 'bg-gray-400 text-white shadow-md'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        No thanks
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            {wantsUpdates !== null && (
                                <button
                                    onClick={handleWhatsappSave}
                                    disabled={savingWa || (whatsappSame === 'no' && whatsappNumber.length !== 10)}
                                    className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {savingWa ? 'Saving...' : 'Continue'}
                                </button>
                            )}
                            <button
                                onClick={handleSkipWhatsapp}
                                className="w-full py-3 px-4 text-gray-500 dark:text-gray-400 font-medium text-sm hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                            >
                                Skip & Continue Browsing →
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
                    {/* Persuasive Header */}
                    <div className="text-center mb-6">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Your First Visit From Home Starts Here
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            We personally shoot <strong>free 360° virtual tours</strong> of every listed property so you can experience it from home before stepping out. Sign up to unlock full property views, get alerts for new listings matching your needs, and shortlist your favourites — all from your couch.
                        </p>
                    </div>

                    {/* Why Sign Up - Value Props */}
                    <div className="bg-primary-50/60 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
                        <p className="text-xs font-bold text-primary-700 dark:text-primary-300 uppercase tracking-wide mb-2.5">Why Sign Up?</p>
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <li className="flex items-start gap-2">
                                <span className="flex-shrink-0">🏠</span>
                                <span><strong>First Visit From Home</strong> — Walk through properties in 360° without travelling</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="flex-shrink-0">🎥</span>
                                <span><strong>Free 360° Tours</strong> — We put real effort into shooting every property for you</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="flex-shrink-0">🔔</span>
                                <span><strong>Personalized Alerts</strong> — Get notified when new listings match your requirements</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="flex-shrink-0">⭐</span>
                                <span><strong>Shortlist & Compare</strong> — Save and compare properties in one place</span>
                            </li>
                        </ul>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="Your full name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Phone Number *
                            </label>
                            <div className="flex overflow-hidden rounded-xl">
                                <span className="inline-flex items-center px-3 bg-gray-100 dark:bg-gray-600 border border-r-0 border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 font-medium flex-shrink-0">
                                    +91
                                </span>
                                <input
                                    type="tel"
                                    required
                                    maxLength={10}
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                                    className="flex-1 min-w-0 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder="98765 43210"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Password *
                            </label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="At least 6 characters"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Confirm Password *
                            </label>
                            <input
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <p className="text-center text-xs text-gray-500 dark:text-gray-400 italic">
                            Takes only 30 seconds!
                        </p>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link href={`/login${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
