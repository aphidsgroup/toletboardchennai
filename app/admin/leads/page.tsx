'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
    propertyId: string | null;
    propertyTitle: string | null;
    createdAt: string;
}

export default function AdminLeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('/api/leads')
            .then(res => res.json())
            .then(data => {
                setLeads(data.leads || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filtered = leads.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.phone.includes(search) ||
        (l.preferredArea && l.preferredArea.toLowerCase().includes(search.toLowerCase()))
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lead Responses</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {leads.length} total lead{leads.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <input
                    type="text"
                    placeholder="Search by name, phone, or area..."
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-gray-600 dark:text-gray-400">
                            {search ? 'No leads match your search' : 'No lead responses yet'}
                        </p>
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
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Property</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Message</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filtered.map((lead) => (
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
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-[150px] truncate">
                                            {lead.propertyTitle || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-[200px]">
                                            {lead.message ? (
                                                <span className="truncate block" title={lead.message}>{lead.message}</span>
                                            ) : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                                            {new Date(lead.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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
