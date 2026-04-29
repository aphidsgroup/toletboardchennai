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
                    <Link href="/admin" className="text-sm text-primary-600 dark:text-primary-400 hover:underline mb-1 inline-block font-semibold">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lead Responses</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {leads.length} total response{leads.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Search name, phone, or area..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 w-full sm:w-80 shadow-sm transition-all group-hover:border-primary-400"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                {filtered.length === 0 ? (
                    <div className="col-span-full bg-white dark:bg-gray-800 p-12 rounded-3xl text-center shadow-sm border border-dashed border-gray-200 dark:border-gray-700">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">{search ? 'No responses match your search' : 'No lead responses found'}</p>
                    </div>
                ) : (
                    filtered.map(lead => {
                        // Smart Data Extraction for cards
                        let data: any = {};
                        if (lead.message) {
                            try {
                                const jsonStr = lead.message.replace('Onboarding Details: ', '').trim();
                                data = JSON.parse(jsonStr);
                            } catch(e) {}
                        }
                        const smart = {
                            area: lead.preferredArea || data.preferredArea || data.area || '—',
                            budget: lead.budgetRange || data.budgetRange || data.budget || '—',
                            lookingFor: lead.lookingFor || data.lookingFor || '—'
                        };

                        return (
                            <div
                                key={lead.id}
                                onClick={() => setSelectedId(lead.id)}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${smart.lookingFor === 'rent' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'}`}>
                                        {smart.lookingFor}
                                    </span>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDelete(lead.id); }}
                                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                        title="Delete Response"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                    </button>
                                </div>
                                
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors line-clamp-1">{lead.name}</h3>
                                <p className="text-sm text-gray-500 mb-4 font-medium">{lead.phone}</p>
                                
                                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
                                    <div className="flex justify-between text-xs"><span className="text-gray-400">Area:</span><span className="font-semibold text-gray-700 dark:text-gray-300 truncate ml-2 max-w-[120px]">{smart.area}</span></div>
                                    <div className="flex justify-between text-xs"><span className="text-gray-400">Budget:</span><span className="font-semibold text-gray-700 dark:text-gray-300">{smart.budget}</span></div>
                                    <div className="flex justify-between text-xs"><span className="text-gray-400">Date:</span><span className="font-semibold text-gray-700 dark:text-gray-300">{new Date(lead.createdAt).toLocaleDateString('en-IN', {day:'numeric',month:'short'})}</span></div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Lead Response Details Modal */}
            {selectedId && (() => {
                const lead = leads.find(l => l.id === selectedId);
                if (!lead) return null;

                // Smart Data Extraction
                const getLeadData = () => {
                    let data: any = {};
                    if (lead.message) {
                        try {
                            const jsonStr = lead.message.replace('Onboarding Details: ', '').trim();
                            data = JSON.parse(jsonStr);
                        } catch(e) {}
                    }
                    return {
                        area: lead.preferredArea || data.preferredArea || data.area || '—',
                        type: lead.propertyType || data.propertyType || data.type || '—',
                        budget: lead.budgetRange || data.budgetRange || data.budget || '—',
                        lookingFor: lead.lookingFor || data.lookingFor || '—'
                    };
                };
                const smart = getLeadData();

                const renderMessage = (message: string) => {
                    let jsonStr = message;
                    let prefix = '';
                    if (message.startsWith('Onboarding Details: ')) {
                        jsonStr = message.replace('Onboarding Details: ', '').trim();
                        prefix = 'Onboarding Details';
                    } else if (message.trim().startsWith('{')) {
                        jsonStr = message.trim();
                    }
                    
                    try {
                        const data = JSON.parse(jsonStr);
                        return (
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-800">
                                {prefix && <h5 className="text-sm font-bold text-gray-900 dark:text-white mb-4">{prefix}</h5>}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {Object.entries(data).map(([key, value]) => {
                                        if (key === 'signature') return null;
                                        let displayValue = String(value);
                                        if (typeof value === 'boolean') displayValue = value ? 'Yes' : 'No';
                                        if (Array.isArray(value)) displayValue = value.join(', ');
                                        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                        return (
                                            <div key={key} className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">{formattedKey}</span>
                                                <span className="block text-sm font-semibold text-gray-900 dark:text-white truncate" title={displayValue}>{displayValue || '—'}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    } catch (e) {
                        return (
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 sm:p-6 rounded-2xl text-sm text-gray-700 dark:text-gray-300 italic border border-gray-100 dark:border-gray-800">
                                &quot;{message}&quot;
                            </div>
                        );
                    }
                };

                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up relative">
                            {/* Modal Header */}
                            <div className="bg-gray-50 dark:bg-gray-800/80 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white ml-2">Response Details</h3>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleDelete(lead.id)}
                                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg> Delete
                                    </button>
                                    <button onClick={() => setSelectedId(null)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
                                <div className="flex flex-col sm:flex-row gap-6 justify-between items-start mb-8">
                                    <div>
                                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{lead.name}</h3>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                                            <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1.5 text-primary-600 dark:text-primary-400 font-semibold hover:underline bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>{lead.phone}</a>
                                            {lead.email && <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>{lead.email}</span>}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg tracking-widest ${lead.lookingFor === 'rent' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'}`}>
                                            {lead.lookingFor}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
                                    <section className="space-y-4">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 pb-2">Customer Info</h4>
                                        <DetailItem label="Full Name" value={lead.name} />
                                        <DetailItem label="Phone Number" value={lead.phone} />
                                        <DetailItem label="Email Address" value={lead.email} />
                                        <DetailItem label="Source" value="Manual Form Submission" />
                                    </section>

                                    <section className="space-y-4">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2">Requirements</h4>
                                        <DetailItem label="Looking For" value={smart.lookingFor.toUpperCase()} />
                                        <DetailItem label="Property Type" value={smart.type} />
                                        <DetailItem label="Budget Range" value={smart.budget} />
                                        <DetailItem label="Preferred Area" value={smart.area} />
                                    </section>
                                </div>

                                {lead.propertyTitle && (
                                    <div className="mb-10 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Inquired Property</h4>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">{lead.propertyTitle}</p>
                                        {lead.propertyId && <Link href={`/p/${lead.propertyId}`} className="text-sm text-primary-600 hover:underline mt-2 inline-block font-semibold">View Property Details →</Link>}
                                    </div>
                                )}

                                {lead.message && (
                                    <div className="mb-10">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 pb-2 mb-4">Original Message / Requirements</h4>
                                        {renderMessage(lead.message)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

function DetailItem({ label, value }: { label: string, value: React.ReactNode }) {
    if (!value) return null;
    return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{value}</div>
        </div>
    );
}
