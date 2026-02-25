'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShortlist } from './ShortlistProvider';

interface FloatingShortlistButtonProps {
    propertyId: string;
}

export default function FloatingShortlistButton({ propertyId }: FloatingShortlistButtonProps) {
    const { shortlistedIds, toggleShortlist, isLoaded, isLoggedIn } = useShortlist();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const router = useRouter();

    if (!isLoaded) return null;

    const isShortlisted = shortlistedIds.has(propertyId);

    const handleClick = () => {
        if (!isLoggedIn) {
            setShowAuthModal(true);
            return;
        }
        toggleShortlist(propertyId);
    };

    return (
        <>
            <button
                onClick={handleClick}
                className={`fixed bottom-20 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group ${isShortlisted
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-gray-700'
                    }`}
                title={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
            >
                <svg
                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${isShortlisted ? 'text-white' : 'text-red-500'
                        }`}
                    fill={isShortlisted ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                </svg>
                <span className="text-sm font-semibold">
                    {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                </span>
            </button>

            {/* Auth Modal */}
            {showAuthModal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={() => setShowAuthModal(false)}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                        style={{ animation: 'modalSlideIn 0.3s ease-out' }}
                    >
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full">
                                <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                            Save Your Favorites
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-center text-sm mb-6">
                            Sign in to shortlist properties and access them anytime from your account.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => router.push('/login')}
                                className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => router.push('/register')}
                                className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-xl transition-all"
                            >
                                Create Account
                            </button>
                        </div>

                        <button
                            onClick={() => setShowAuthModal(false)}
                            className="w-full mt-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        >
                            Maybe later
                        </button>
                    </div>

                    <style jsx>{`
                        @keyframes modalSlideIn {
                            from {
                                opacity: 0;
                                transform: scale(0.95) translateY(10px);
                            }
                            to {
                                opacity: 1;
                                transform: scale(1) translateY(0);
                            }
                        }
                    `}</style>
                </div>
            )}
        </>
    );
}
