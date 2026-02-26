'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Lead {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    lookingFor: string;
    propertyType: string | null;
    budgetRange: string | null;
    preferredArea: string | null;
    message: string | null;
    createdAt: string;
}

interface User {
    id: string;
    name: string;
    email: string | null;
    phone: string;
    whatsappNumber: string | null;
    createdAt: string;
    shortlists: { id: string; propertyId: string; property: { title: string; slug: string } }[];
}

interface Permissions {
    viewLeads: boolean;
    viewUsers: boolean;
    viewProperties: boolean;
}

export default function ManagerDashboard() {
    const router = useRouter();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'leads' | 'users'>('leads');
    const [authorized, setAuthorized] = useState(true);
    const [permissions, setPermissions] = useState<Permissions>({
        viewLeads: true,
        viewUsers: true,
        viewProperties: true,
    });

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (!data.user || (data.user.role !== 'manager' && data.user.role !== 'admin')) {
                    setAuthorized(false);
                    router.push('/login');
                    return;
                }

                // Set permissions (admin gets all)
                if (data.user.role === 'admin') {
                    setPermissions({ viewLeads: true, viewUsers: true, viewProperties: true });
                } else if (data.user.permissions) {
                    setPermissions(data.user.permissions);
                }

                // Fetch data based on permissions
                const perms = data.user.role === 'admin'
                    ? { viewLeads: true, viewUsers: true, viewProperties: true }
                    : (data.user.permissions || { viewLeads: true, viewUsers: true, viewProperties: true });

                const fetches: Promise<void>[] = [];

                if (perms.viewLeads) {
                    fetches.push(
                        fetch('/api/leads').then(r => r.json()).then(d => setLeads(d.leads || []))
                    );
                }
                if (perms.viewUsers) {
                    fetches.push(
                        fetch('/api/manager/users').then(r => r.json()).then(d => setUsers(d.users || []))
                    );
                }

                Promise.all(fetches).then(() => setLoading(false));

                // Set default tab to first permitted
                if (!perms.viewLeads && perms.viewUsers) setTab('users');
            })
            .catch(() => {
                setAuthorized(false);
                router.push('/login');
            });
    }, [router]);

    if (!authorized || loading) {
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
            </main>
        );
    }

    const noAccess = !permissions.viewLeads && !permissions.viewUsers;

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Manager Dashboard</h1>

                {noAccess ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-12 text-center">
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Access</h2>
                        <p className="text-gray-500 dark:text-gray-400">Your admin has not enabled any dashboard features for your account.</p>
                    </div>
                ) : (
                    <>
                        {/* Tab Toggle — only show tabs the manager has permission for */}
                        <div className="flex rounded-xl bg-gray-200 dark:bg-gray-700 p-1 mb-6 max-w-md">
                            {permissions.viewLeads && (
                                <button
                                    onClick={() => setTab('leads')}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'leads'
                                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400'
                                        }`}
                                >
                                    Lead Responses ({leads.length})
                                </button>
                            )}
                            {permissions.viewUsers && (
                                <button
                                    onClick={() => setTab('users')}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'users'
                                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400'
                                        }`}
                                >
                                    Users ({users.length})
                                </button>
                            )}
                        </div>

                        {/* Leads Tab */}
                        {tab === 'leads' && permissions.viewLeads && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
                                {leads.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                        No lead responses yet
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 dark:bg-gray-750">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Name</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Phone</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Looking For</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Type</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Budget</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Area</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {leads.map((lead) => (
                                                    <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                                        <td className="px-4 py-3">
                                                            <div className="font-medium text-gray-900 dark:text-white">{lead.name}</div>
                                                            {lead.email && <div className="text-xs text-gray-500">{lead.email}</div>}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <a href={`tel:${lead.phone}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                                                                {lead.phone}
                                                            </a>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${lead.lookingFor === 'rent'
                                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                                : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                                }`}>
                                                                {lead.lookingFor}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{lead.propertyType || '—'}</td>
                                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{lead.budgetRange || '—'}</td>
                                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{lead.preferredArea || '—'}</td>
                                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                                                            {new Date(lead.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Users Tab */}
                        {tab === 'users' && permissions.viewUsers && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
                                {users.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                        No registered users yet
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 dark:bg-gray-750">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Name</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Phone</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">WhatsApp</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Shortlists</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Joined</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {users.map((user) => (
                                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{user.name}</td>
                                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{user.phone}</td>
                                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{user.whatsappNumber || '—'}</td>
                                                        <td className="px-4 py-3">
                                                            {user.shortlists.length > 0 ? (
                                                                <div className="space-y-1">
                                                                    {user.shortlists.map(s => (
                                                                        <a
                                                                            key={s.id}
                                                                            href={`/p/${s.property.slug}`}
                                                                            target="_blank"
                                                                            className="block text-xs text-primary-600 dark:text-primary-400 hover:underline truncate max-w-[200px]"
                                                                        >
                                                                            {s.property.title}
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400 text-xs">None</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                                                            {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
