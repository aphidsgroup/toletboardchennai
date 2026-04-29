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
    const [selectedId, setSelectedId] = useState<string | null>(null);
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

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this lead response?')) return;
        try {
            const res = await fetch(`/api/admin/lead-responses/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setLeads(leads.filter(l => l.id !== id));
                if (selectedId === id) setSelectedId(null);
            } else {
                alert('Failed to delete lead');
            }
        } catch (e) {
            alert('Error deleting lead');
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 flex justify-center min-h-[400px] items-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    const selectedLead = leads.find(l => l.id === selectedId);

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <Link href="/admin" className="text-sm text-primary-600 dark:text-primary-400 hover:underline mb-1 inline-block">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lead Responses</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {leads.length} total lead{leads.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <input
                    type="text"
                    placeholder="Search by name, phone, or area..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 w-full sm:w-72 shadow-sm"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
                {/* List Side */}
                <div className="lg:col-span-4 space-y-4">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider px-2">Responses ({filtered.length})</h2>
                    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                        {filtered.length === 0 ? (
                            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl text-center border border-dashed border-gray-200 dark:border-gray-800">
                                <p className="text-gray-500">No responses match your search.</p>
                            </div>
                        ) : (
                            filtered.map(lead => (
                                <button
                                    key={lead.id}
                                    onClick={() => setSelectedId(lead.id)}
                                    className={`w-full text-left p-4 rounded-2xl transition-all border-2 ${selectedId === lead.id 
                                        ? 'bg-primary-50 dark:bg-primary-900/10 border-primary-500' 
                                        : 'bg-white dark:bg-gray-900 border-transparent shadow-sm hover:shadow-md'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${lead.lookingFor === 'rent' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                            {lead.lookingFor}
                                        </span>
                                        <span className="text-[10px] text-gray-500">
                                            {new Date(lead.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="font-bold text-gray-900 dark:text-white truncate">{lead.name}</div>
                                    <div className="text-xs text-gray-500 mt-1 truncate">{lead.phone} • {lead.preferredArea || lead.propertyType || 'No Area Specified'}</div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Detail Side */}
                <div className="lg:col-span-8">
                    {selectedLead ? (
                        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-fade-in sticky top-24">
                            <div className="p-6 sm:p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Response Details</h3>
                                    <button 
                                        onClick={() => handleDelete(selectedLead.id)}
                                        className="px-6 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-all flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        Delete
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <section className="space-y-4">
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2">Customer Info</h4>
                                        <DetailItem label="Full Name" value={selectedLead.name} />
                                        <DetailItem label="Phone Number" value={<a href={`tel:${selectedLead.phone}`} className="text-primary-600 hover:underline">{selectedLead.phone}</a>} />
                                        <DetailItem label="Email Address" value={selectedLead.email} />
                                    </section>

                                    <section className="space-y-4">
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2">Requirements</h4>
                                        <DetailItem label="Looking For" value={selectedLead.lookingFor.toUpperCase()} />
                                        <DetailItem label="Property Type" value={selectedLead.propertyType} />
                                        <DetailItem label="Budget Range" value={selectedLead.budgetRange} />
                                        <DetailItem label="Preferred Area" value={selectedLead.preferredArea} />
                                    </section>
                                </div>

                                {(selectedLead.message || selectedLead.propertyTitle) && (
                                    <div className="mt-8 space-y-6">
                                        {selectedLead.propertyTitle && (
                                            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl">
                                                <h4 className="text-xs font-black text-gray-400 uppercase mb-2">Inquired Property</h4>
                                                <p className="text-gray-900 dark:text-white font-medium">{selectedLead.propertyTitle}</p>
                                            </div>
                                        )}
                                        {selectedLead.message && (
                                            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl">
                                                <h4 className="text-xs font-black text-gray-400 uppercase mb-2">Message Details</h4>
                                                <p className="text-gray-900 dark:text-white font-medium whitespace-pre-wrap">{selectedLead.message}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center min-h-[400px]">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/></svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Response Selected</h3>
                            <p className="text-gray-500 max-w-xs mt-1">Select a response from the list on the left to review its full details.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function DetailItem({ label, value }: { label: string, value: React.ReactNode }) {
    if (!value) return null;
    return (
        <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase">{label}</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{value}</div>
        </div>
    );
}
