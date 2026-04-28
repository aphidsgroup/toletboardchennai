'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PricingLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isOwner = pathname === '/pricing/owners';

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
            <div className="container mx-auto px-4 py-10 max-w-6xl">
                <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:underline mb-6">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back to Home
                </Link>

                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-100 dark:bg-primary-900/30 rounded-full text-sm font-medium text-primary-700 dark:text-primary-300 mb-4">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Transparent Pricing — No Hidden Charges
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
                        Choose Your <span className="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">Property Marketing</span> Plan
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-base">
                        From zero-cost exclusive listings to premium spotlight campaigns — pick the package that fits your property and budget.
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex justify-center mb-10">
                    <div className="inline-flex bg-gray-200 dark:bg-gray-800 rounded-xl p-1">
                        <Link href="/pricing/owners" className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${isOwner ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>
                            🏠 For Property Owners
                        </Link>
                        <Link href="/pricing/tenants" className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${!isOwner ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>
                            🔑 For Tenants
                        </Link>
                    </div>
                </div>

                {children}
            </div>
        </main>
    );
}
