'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface ManagerPermissions {
    viewLeads: boolean;
    viewUsers: boolean;
    viewProperties: boolean;
}

interface Manager {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    permissions: string | null;
    createdAt: string;
}

const defaultPermissions: ManagerPermissions = {
    viewLeads: true,
    viewUsers: true,
    viewProperties: true,
};

function parsePermissions(raw: string | null): ManagerPermissions {
    try {
        return raw ? JSON.parse(raw) : defaultPermissions;
    } catch {
        return defaultPermissions;
    }
}

export default function AdminManagersPage() {
    const [managers, setManagers] = useState<Manager[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createForm, setCreateForm] = useState({ name: '', email: '', password: '' });
    const [createError, setCreateError] = useState('');
    const [creating, setCreating] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchManagers = useCallback(async () => {
        const res = await fetch('/api/admin/managers');
        const data = await res.json();
        setManagers(data.managers || []);
        setLoading(false);
    }, []);

    useEffect(() => { fetchManagers(); }, [fetchManagers]);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setCreating(true);
        setCreateError('');

        const res = await fetch('/api/admin/managers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(createForm),
        });

        const data = await res.json();
        if (!res.ok) {
            setCreateError(data.error);
        } else {
            setManagers(prev => [data.manager, ...prev]);
            setCreateForm({ name: '', email: '', password: '' });
            setShowCreateForm(false);
        }
        setCreating(false);
    }

    async function toggleActive(id: string, currentActive: boolean) {
        const res = await fetch('/api/admin/managers', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, isActive: !currentActive }),
        });
        if (res.ok) {
            setManagers(prev => prev.map(m => m.id === id ? { ...m, isActive: !currentActive } : m));
        }
    }

    async function togglePermission(id: string, currentPermsRaw: string | null, permKey: keyof ManagerPermissions) {
        const perms = parsePermissions(currentPermsRaw);
        const updated = { ...perms, [permKey]: !perms[permKey] };

        const res = await fetch('/api/admin/managers', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, permissions: updated }),
        });

        if (res.ok) {
            setManagers(prev => prev.map(m =>
                m.id === id ? { ...m, permissions: JSON.stringify(updated) } : m
            ));
        }
    }

    async function deleteManager(id: string) {
        if (!confirm('Are you sure you want to delete this manager?')) return;

        const res = await fetch('/api/admin/managers', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });

        if (res.ok) {
            setManagers(prev => prev.filter(m => m.id !== id));
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 flex justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <Link href="/admin" className="text-sm text-primary-600 dark:text-primary-400 hover:underline mb-1 inline-block">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Managers</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Create, activate/deactivate, and control permissions</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl shadow-md transition-all text-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Manager
                </button>
            </div>

            {/* Create Form */}
            {showCreateForm && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Create New Manager</h2>
                    {createError && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
                            {createError}
                        </div>
                    )}
                    <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <input
                            type="text"
                            required
                            placeholder="Name"
                            value={createForm.name}
                            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
                        />
                        <input
                            type="email"
                            required
                            placeholder="Email"
                            value={createForm.email}
                            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
                        />
                        <input
                            type="password"
                            required
                            minLength={6}
                            placeholder="Password (min 6 chars)"
                            value={createForm.password}
                            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
                        />
                        <div className="sm:col-span-3 flex gap-3">
                            <button
                                type="submit"
                                disabled={creating}
                                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
                            >
                                {creating ? 'Creating...' : 'Create Manager'}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowCreateForm(false); setCreateError(''); }}
                                className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Manager List */}
            {managers.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-12 text-center">
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-400">No managers yet. Create one to get started.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {managers.map((manager) => {
                        const perms = parsePermissions(manager.permissions);
                        const isExpanded = expandedId === manager.id;

                        return (
                            <div key={manager.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
                                {/* Main Row */}
                                <div className="p-4 flex items-center gap-4">
                                    {/* Active Toggle */}
                                    <button
                                        onClick={() => toggleActive(manager.id, manager.isActive)}
                                        className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${manager.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                                            }`}
                                        title={manager.isActive ? 'Active — click to deactivate' : 'Inactive — click to activate'}
                                    >
                                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${manager.isActive ? 'translate-x-6' : 'translate-x-0'
                                            }`} />
                                    </button>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                                {manager.name}
                                            </h3>
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${manager.isActive
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {manager.isActive ? 'Active' : 'Disabled'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{manager.email}</p>
                                    </div>

                                    {/* Permission badges (compact) */}
                                    <div className="hidden sm:flex items-center gap-1.5">
                                        {Object.entries(perms).map(([key, val]) => (
                                            <span
                                                key={key}
                                                className={`px-2 py-0.5 text-xs rounded-full font-medium ${val
                                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                        : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 line-through'
                                                    }`}
                                            >
                                                {key.replace('view', '')}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Expand / Actions */}
                                    <button
                                        onClick={() => setExpandedId(isExpanded ? null : manager.id)}
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 pt-0 border-t border-gray-100 dark:border-gray-700">
                                        <div className="pt-4">
                                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                                Dashboard Access Controls
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                                {([
                                                    { key: 'viewLeads' as keyof ManagerPermissions, label: 'View Lead Responses', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                                                    { key: 'viewUsers' as keyof ManagerPermissions, label: 'View Registered Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
                                                    { key: 'viewProperties' as keyof ManagerPermissions, label: 'View Properties', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5' },
                                                ]).map(({ key, label, icon }) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => togglePermission(manager.id, manager.permissions, key)}
                                                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${perms[key]
                                                                ? 'border-green-400 bg-green-50 dark:bg-green-900/10 dark:border-green-700'
                                                                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 opacity-60'
                                                            }`}
                                                    >
                                                        <svg className={`w-5 h-5 flex-shrink-0 ${perms[key] ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                                                        </svg>
                                                        <div>
                                                            <span className={`text-sm font-medium ${perms[key] ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                                                {label}
                                                            </span>
                                                            <span className={`block text-xs ${perms[key] ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                                                                {perms[key] ? '✓ Enabled' : '✗ Disabled'}
                                                            </span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    Created {new Date(manager.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                                <button
                                                    onClick={() => deleteManager(manager.id)}
                                                    className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
                                                >
                                                    Delete Manager
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
