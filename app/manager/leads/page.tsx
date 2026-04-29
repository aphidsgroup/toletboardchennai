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

export default function ManagerLeadsPage() {
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

    const getSmartData = (lead: Lead) => {
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/manager" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">Manual Leads</h1>
                    </div>
                    <div className="flex-1 max-w-md relative group hidden sm:block">
                        <input
                            type="text"
                            placeholder="Search name, phone, area..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary-500 transition-all"
                        />
                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map(lead => {
                        const smart = getSmartData(lead);
                        return (
                            <div
                                key={lead.id}
                                onClick={() => setSelectedId(lead.id)}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${smart.lookingFor === 'rent' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                        {smart.lookingFor}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400">
                                        {new Date(lead.createdAt).toLocaleDateString('en-IN', {day:'numeric',month:'short'})}
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">{lead.name}</h3>
                                <p className="text-xs text-gray-500 mb-4">{lead.phone}</p>
                                <div className="space-y-1.5 border-t border-gray-50 dark:border-gray-700 pt-3">
                                    <div className="flex justify-between text-[11px]"><span className="text-gray-400">Area:</span><span className="font-semibold text-gray-700 dark:text-gray-300">{smart.area}</span></div>
                                    <div className="flex justify-between text-[11px]"><span className="text-gray-400">Budget:</span><span className="font-semibold text-gray-700 dark:text-gray-300">{smart.budget}</span></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal */}
            {selectedId && (() => {
                const lead = leads.find(l => l.id === selectedId);
                if (!lead) return null;
                const smart = getSmartData(lead);

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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                {Object.entries(data).map(([key, value]) => {
                                    if (key === 'signature') return null;
                                    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                    return (
                                        <div key={key} className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                                            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">{formattedKey}</span>
                                            <span className="block text-sm font-semibold text-gray-900 dark:text-white">{String(value)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    } catch (e) {
                        return <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm italic">"{message}"</div>;
                    }
                };

                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                <h3 className="font-bold text-gray-900 dark:text-white ml-2">Lead Details</h3>
                                <button onClick={() => setSelectedId(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{lead.name}</h2>
                                <a href={`tel:${lead.phone}`} className="text-primary-600 font-semibold mb-6 block hover:underline">{lead.phone}</a>
                                
                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div><div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Requirements</div>
                                        <div className="space-y-3">
                                            <DetailItem label="Area" value={smart.area} />
                                            <DetailItem label="Type" value={smart.type} />
                                            <DetailItem label="Budget" value={smart.budget} />
                                        </div>
                                    </div>
                                    <div><div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Submission</div>
                                        <div className="space-y-3">
                                            <DetailItem label="Date" value={new Date(lead.createdAt).toLocaleString('en-IN')} />
                                            <DetailItem label="Looking For" value={smart.lookingFor} />
                                        </div>
                                    </div>
                                </div>

                                {lead.message && (
                                    <div>
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Original Form Data</div>
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

function DetailItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800">
            <div className="text-[9px] font-bold text-gray-400 uppercase">{label}</div>
            <div className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">{value}</div>
        </div>
    );
}
