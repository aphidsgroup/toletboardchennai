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

interface PropertyItem {
    id: string;
    title: string;
    slug: string;
    areaName: string;
    dealType: string;
    usageType: string;
    priceInr: number;
    isPublished: boolean;
    createdAt: string;
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
    const [properties, setProperties] = useState<PropertyItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'leads' | 'users' | 'properties'>('leads');
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

                if (perms.viewProperties) {
                    fetches.push(
                        fetch('/api/manager/properties').then(r => r.json()).then(d => setProperties(d.properties || []))
                    );
                }

                Promise.all(fetches).then(() => setLoading(false));

                // Set default tab to first permitted
                if (!perms.viewLeads && perms.viewUsers) setTab('users');
                else if (!perms.viewLeads && !perms.viewUsers && perms.viewProperties) setTab('properties');
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

    const noAccess = !permissions.viewLeads && !permissions.viewUsers && !permissions.viewProperties;

    const requestDeletion = async (prop: PropertyItem) => {
        const reason = prompt(`Why should "${prop.title}" be deleted?`);
        if (reason === null) return;
        await fetch('/api/admin/change-requests', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'delete_property', entityType: 'property', entityId: prop.id, entityTitle: prop.title, requestedBy: 'Manager', reason }),
        });
        alert('Deletion request sent to admin for approval.');
    };

    const toggleRentedOut = async (prop: PropertyItem) => {
        const newVal = !(prop as any).isRentedOut;
        await fetch('/api/admin/change-requests', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'edit_property', entityType: 'property', entityId: prop.id, entityTitle: prop.title, changes: { isRentedOut: newVal, isPublished: !newVal }, requestedBy: 'Manager' }),
        });
        alert('Rented out change request sent to admin for approval.');
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Top Header */}
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manager Dashboard</h1>
                    <button onClick={async()=>{await fetch('/api/auth/logout',{method:'POST'});window.location.href='/login';}} className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">Logout</button>
                </div>

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
                        {/* Tab Bar with contextual actions */}
                        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                            <div className="flex rounded-xl bg-gray-200 dark:bg-gray-700 p-1">
                                {permissions.viewLeads && (
                                    <button
                                        onClick={() => setTab('leads')}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'leads'
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
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'users'
                                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400'
                                            }`}
                                    >
                                        Users ({users.length})
                                    </button>
                                )}
                                {permissions.viewProperties && (
                                    <button
                                        onClick={() => setTab('properties')}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'properties'
                                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400'
                                            }`}
                                    >
                                        Properties ({properties.length})
                                    </button>
                                )}
                            </div>

                            {/* Contextual action buttons — change based on active tab */}
                            <div className="flex items-center gap-2">
                                {tab === 'leads' && permissions.viewLeads && (
                                    <>
                                        <a href="/manager/leads/owner" className="px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                                            <svg className="w-3.5 h-3.5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                                            Owner Leads
                                        </a>
                                        <a href="/manager/leads/tenant" className="px-3 py-2 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors">
                                            <svg className="w-3.5 h-3.5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                            Tenant Leads
                                        </a>
                                    </>
                                )}
                                {tab === 'properties' && permissions.viewProperties && (
                                    <a href="/manager/properties/new" className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-lg shadow hover:shadow-md transition-all">
                                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                                        Add Property
                                    </a>
                                )}
                            </div>
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

                        {/* Properties Tab */}
                        {tab === 'properties' && permissions.viewProperties && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
                                {properties.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                        No properties found
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 dark:bg-gray-750">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Property</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Area</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Type</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Status</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {properties.map((prop) => (
                                                    <tr key={prop.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                                        <td className="px-4 py-3">
                                                            <div className="font-medium text-gray-900 dark:text-white">{prop.title}</div>
                                                            <div className="text-xs text-gray-500">
                                                                {new Date(prop.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{prop.areaName}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${prop.dealType === 'rent'
                                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                                    : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                                }`}>
                                                                {prop.dealType}
                                                            </span>
                                                            <span className="ml-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                                                {prop.usageType}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${prop.isPublished
                                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                                }`}>
                                                                {prop.isPublished ? 'Published' : 'Draft'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <a
                                                                    href={`/manager/properties/${prop.id}/edit`}
                                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-semibold rounded-lg hover:bg-primary-100 transition-colors"
                                                                >
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                    Edit
                                                                </a>
                                                                <button
                                                                    onClick={() => toggleRentedOut(prop)}
                                                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${(prop as any).isRentedOut
                                                                        ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100'
                                                                        : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100'
                                                                    }`}
                                                                >
                                                                    {(prop as any).isRentedOut ? 'Unhide' : 'Rented Out'}
                                                                </button>
                                                                <button
                                                                    onClick={() => requestDeletion(prop)}
                                                                    className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors"
                                                                >
                                                                    Request Delete
                                                                </button>
                                                            </div>
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
