'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface HeaderProps {
    brandName?: string;
}

interface UserInfo {
    name: string;
    phone: string;
    role: 'user' | 'manager' | 'admin';
}

export default function Header({ brandName = 'Tolet Board Chennai' }: HeaderProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState<UserInfo | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Check auth status on mount
    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.ok ? res.json() : null)
            .then(data => { if (data?.user) setUser(data.user); })
            .catch(() => { });
    }, []);

    // Close menu on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    async function handleLogout() {
        await fetch('/api/auth/logout', { method: 'POST' });
        setUser(null);
        setMenuOpen(false);
        window.location.href = '/';
    }

    return (
        <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-14">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5">
                        <img
                            src="/logo.png"
                            alt={brandName}
                            className="w-9 h-9 rounded-full object-cover"
                        />
                        <span className="text-lg font-bold text-gray-900 dark:text-white hidden sm:inline">
                            {brandName}
                        </span>
                    </Link>

                    {/* Right side: Menu toggle */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            aria-label="Open menu"
                        >
                            {menuOpen ? (
                                <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>

                        {/* Dropdown Menu */}
                        {menuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden animate-fade-in z-50">
                                {/* User info at top if logged in */}
                                {user && (
                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.role === 'user' ? `+91 ${user.phone}` : user.phone}</p>
                                    </div>
                                )}

                                {/* Common links */}
                                <nav className="py-2">
                                    <MenuLink href="/" icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" onClick={() => setMenuOpen(false)}>
                                        Home
                                    </MenuLink>
                                    <MenuLink href="/list" icon="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" onClick={() => setMenuOpen(false)}>
                                        Browse Properties
                                    </MenuLink>

                                    {/* Before Login */}
                                    {!user && (
                                        <>
                                            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                                            <MenuLink href="/login" icon="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" onClick={() => setMenuOpen(false)}>
                                                Login
                                            </MenuLink>
                                            <MenuLink href="/register" icon="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" onClick={() => setMenuOpen(false)}>
                                                Sign Up
                                            </MenuLink>
                                        </>
                                    )}

                                    {/* After Login - User */}
                                    {user?.role === 'user' && (
                                        <>
                                            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                                            <MenuLink href="/shortlist" icon="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" onClick={() => setMenuOpen(false)}>
                                                My Shortlist
                                            </MenuLink>
                                        </>
                                    )}

                                    {/* After Login - Manager */}
                                    {user?.role === 'manager' && (
                                        <>
                                            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                                            <MenuLink href="/manager" icon="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" onClick={() => setMenuOpen(false)}>
                                                Manager Dashboard
                                            </MenuLink>
                                        </>
                                    )}

                                    {/* After Login - Admin */}
                                    {user?.role === 'admin' && (
                                        <>
                                            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                                            <MenuLink href="/admin" icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" onClick={() => setMenuOpen(false)}>
                                                Admin Panel
                                            </MenuLink>
                                        </>
                                    )}

                                    {/* Logout */}
                                    {user && (
                                        <>
                                            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Logout
                                            </button>
                                        </>
                                    )}
                                </nav>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

// Reusable menu link component
function MenuLink({ href, icon, onClick, children }: { href: string; icon: string; onClick: () => void; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
            {children}
        </Link>
    );
}
