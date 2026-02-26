'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    whatsappNumber: string | null;
    wantsWhatsappUpdates: boolean;
    createdAt: string;
    shortlists: { id: string; propertyId: string; property: { title: string; slug: string } }[];
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('/api/manager/users')
            .then(res => res.json())
            .then(data => {
                setUsers(data.users || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.phone.includes(search) ||
        (u.whatsappNumber && u.whatsappNumber.includes(search))
    );

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 flex justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <Link href="/admin" className="text-sm text-primary-600 dark:text-primary-400 hover:underline mb-1 inline-block">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Registered Users</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {users.length} total user{users.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <input
                    type="text"
                    placeholder="Search by name or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 w-full sm:w-72"
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <p className="text-gray-600 dark:text-gray-400">
                            {search ? 'No users match your search' : 'No registered users yet'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-750">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Name</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Phone</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">WhatsApp</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">WA Updates</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Shortlists</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filtered.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                                            {user.email && <div className="text-xs text-gray-500">{user.email}</div>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <a href={`tel:+91${user.phone}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                                                +91 {user.phone}
                                            </a>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                            {user.whatsappNumber ? (
                                                <a href={`https://wa.me/91${user.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline">
                                                    +91 {user.whatsappNumber}
                                                </a>
                                            ) : '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {user.wantsWhatsappUpdates ? (
                                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                    Yes
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                                                    No
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {user.shortlists.length > 0 ? (
                                                <div className="space-y-1">
                                                    {user.shortlists.slice(0, 3).map(s => (
                                                        <a
                                                            key={s.id}
                                                            href={`/p/${s.property.slug}`}
                                                            target="_blank"
                                                            className="block text-xs text-primary-600 dark:text-primary-400 hover:underline truncate max-w-[200px]"
                                                        >
                                                            {s.property.title}
                                                        </a>
                                                    ))}
                                                    {user.shortlists.length > 3 && (
                                                        <span className="text-xs text-gray-400">+{user.shortlists.length - 3} more</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs">None</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                                            {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
