'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AccountPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ name: string; phone: string } | null>(null);
    const [loading, setLoading] = useState(true);

    // Password change state
    const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
    const [pwError, setPwError] = useState('');
    const [pwSuccess, setPwSuccess] = useState('');
    const [pwSaving, setPwSaving] = useState(false);

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.user && data.user.role === 'user') {
                    setUser(data.user);
                } else {
                    router.push('/login');
                }
            })
            .catch(() => router.push('/login'))
            .finally(() => setLoading(false));
    }, [router]);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwError('');
        setPwSuccess('');

        if (pwForm.newPw !== pwForm.confirm) {
            setPwError('New passwords do not match');
            return;
        }
        if (pwForm.newPw.length < 6) {
            setPwError('New password must be at least 6 characters');
            return;
        }

        setPwSaving(true);
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw }),
            });
            const data = await res.json();
            if (!res.ok) {
                setPwError(data.error || 'Failed to change password');
            } else {
                setPwSuccess('Password changed successfully!');
                setPwForm({ current: '', newPw: '', confirm: '' });
            }
        } catch {
            setPwError('Something went wrong');
        } finally {
            setPwSaving(false);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
        router.refresh();
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
            </main>
        );
    }

    if (!user) return null;

    return (
        <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
            <div className="container mx-auto px-4 py-8 max-w-lg">
                {/* Header */}
                <div className="mb-6">
                    <Link href="/" className="text-sm text-primary-600 dark:text-primary-400 hover:underline mb-2 inline-block">
                        ← Back to Home
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Account</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your account settings</p>
                </div>

                {/* Profile Info */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                            {user.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{user.name}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">+91 {user.phone}</p>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 mb-6">
                    <Link
                        href="/shortlist"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="font-medium text-gray-900 dark:text-white">My Shortlisted Properties</span>
                        <svg className="w-5 h-5 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>

                {/* Change Password */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Change Password</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Update your account password</p>

                    {pwError && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
                            {pwError}
                        </div>
                    )}
                    {pwSuccess && (
                        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 text-sm">
                            {pwSuccess}
                        </div>
                    )}

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1.5">Current Password</label>
                            <input
                                type="password"
                                required
                                value={pwForm.current}
                                onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="Enter current password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1.5">New Password</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={pwForm.newPw}
                                onChange={(e) => setPwForm({ ...pwForm, newPw: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="Min 6 characters"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1.5">Confirm New Password</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={pwForm.confirm}
                                onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="Re-enter new password"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={pwSaving}
                            className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {pwSaving ? 'Changing...' : 'Change Password'}
                        </button>
                    </form>
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full py-3 px-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-semibold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                    Sign Out
                </button>
            </div>
        </main>
    );
}
