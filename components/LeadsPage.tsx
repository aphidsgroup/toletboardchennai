'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import LeadsImportModal from './LeadsImportModal';

const STATUSES = [
    { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    { value: 'follow_up', label: 'Follow Up', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    { value: 'site_visit_scheduled', label: 'Visit Scheduled', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    { value: 'site_visit_done', label: 'Visit Done', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
    { value: 'negotiation', label: 'Negotiation', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    { value: 'closed_won', label: 'Closed Won', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    { value: 'closed_lost', label: 'Closed Lost', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    { value: 'closed_outside', label: 'Closed Outside', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
    { value: 'not_interested', label: 'Not Interested', color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
    { value: 'junk', label: 'Junk', color: 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-500' },
];
const SOURCES = ['website','whatsapp','meta_ad','instagram','referral','walk_in','other'];
const sourceLabel = (s: string) => s.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase());

interface Lead { id:string; leadType:string; source:string; name:string; phone:string; email:string|null; whatsappNumber:string|null; propertyAddress:string|null; propertyType:string|null; expectedRent:number|null; lookingFor:string|null; budgetRange:string|null; preferredArea:string|null; bhkPreference:string|null; status:string; assignedTo:string|null; followUpDate:string|null; notes:string|null; closedVia:string|null; message:string|null; createdAt:string; }

export default function LeadsPage({ leadType, backHref, title, role = 'admin' }: { leadType: 'owner'|'tenant'; backHref: string; title: string; role?: 'admin'|'manager' }) {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [statusCounts, setStatusCounts] = useState<{status:string;_count:number}[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [editLead, setEditLead] = useState<Lead|null>(null);
    const [noteModal, setNoteModal] = useState<string|null>(null);
    const [noteText, setNoteText] = useState('');
    const [editingNote, setEditingNote] = useState<{leadId:string;index:number}|null>(null);
    const [editNoteText, setEditNoteText] = useState('');
    const [showImport, setShowImport] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const fetchLeads = () => {
        const params = new URLSearchParams({ type: leadType });
        if (filterStatus) params.set('status', filterStatus);
        if (search) params.set('q', search);
        fetch(`/api/admin/leads?${params}`).then(r=>r.json()).then(d=>{ setLeads(d.leads||[]); setStatusCounts(d.statusCounts||[]); setLoading(false); }).catch(()=>setLoading(false));
    };

    const getSmartData = (lead: Lead) => {
        let data: any = {};
        if (lead.message) {
            try {
                const jsonStr = lead.message.replace('Onboarding Details: ', '').trim();
                data = JSON.parse(jsonStr);
            } catch(e) {}
        }
        return {
            address: lead.propertyAddress || data.propertyAddress || data.address || '—',
            type: lead.propertyType || data.propertyType || data.type || '—',
            rent: lead.expectedRent ? `₹${Number(lead.expectedRent).toLocaleString('en-IN')}/mo` : (data.monthlyRent || data.expectedRent ? `₹${Number(data.monthlyRent || data.expectedRent).toLocaleString('en-IN')}/mo` : '—'),
            area: lead.preferredArea || data.preferredAreas || data.preferredArea || data.area || '—',
            budget: lead.budgetRange || data.budgetRange || data.budget || '—',
            bhk: lead.bhkPreference || data.bedrooms || data.bhkPreference || data.bhkType || data.bhk || '—',
            lookingFor: lead.lookingFor || data.lookingFor || data.tenantType || '—'
        };
    };

    useEffect(()=>{ fetchLeads(); }, [filterStatus]); // eslint-disable-line

    const submitChangeRequest = async (type: string, entityId: string, entityTitle: string, changes?: any) => {
        await fetch('/api/admin/change-requests', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, entityType: 'lead', entityId, entityTitle, changes, requestedBy: 'Manager' }),
        });
        alert('Change request submitted for admin approval.');
    };

    const updateLead = async (id: string, data: any) => {
        if (role === 'manager') {
            const lead = leads.find(l => l.id === id);
            if (data.status) await submitChangeRequest('status_lead', id, lead?.name || '', data);
            else await submitChangeRequest('edit_lead', id, lead?.name || '', data);
            return;
        }
        await fetch(`/api/admin/leads/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        fetchLeads();
    };

    const deleteLead = async (id: string) => {
        if (!confirm('Delete this lead?')) return;
        const res = await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' });
        if (res.ok) {
            fetchLeads();
            if (selectedId === id) setSelectedId(null);
        } else {
            alert('Failed to delete lead');
        }
    };

    const switchType = async (id: string) => {
        const newType = leadType === 'owner' ? 'tenant' : 'owner';
        if (!confirm(`Move this lead to ${newType} leads?`)) return;
        if (role === 'manager') {
            const lead = leads.find(l => l.id === id);
            await submitChangeRequest('switch_lead', id, lead?.name || '', { leadType: newType });
            return;
        }
        await updateLead(id, { leadType: newType });
    };

    const addNote = async (id: string) => {
        if (!noteText.trim()) return;
        await fetch(`/api/admin/leads/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ addNote: { note: noteText, by: role === 'manager' ? 'Manager' : 'Admin' } }) });
        setNoteModal(null); setNoteText(''); fetchLeads();
    };

    const saveEditedNote = async (leadId: string, noteIndex: number) => {
        if (!editNoteText.trim()) return;
        const lead = leads.find(l => l.id === leadId);
        if (!lead) return;
        const notes: any[] = lead.notes ? JSON.parse(lead.notes) : [];
        const updatedNotes = [...notes];
        updatedNotes[noteIndex] = { ...updatedNotes[noteIndex], note: editNoteText };
        if (role === 'manager') {
            await fetch('/api/admin/change-requests', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'edit_lead', entityType: 'lead', entityId: leadId, entityTitle: lead.name, changes: { notes: JSON.stringify(updatedNotes) }, requestedBy: 'Manager', reason: `Edit note #${noteIndex + 1}` }),
            });
            alert('Note edit request submitted for admin approval.');
        } else {
            await fetch(`/api/admin/leads/${leadId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes: JSON.stringify(updatedNotes) }) });
        }
        setEditingNote(null); setEditNoteText(''); fetchLeads();
    };

    const deleteNote = async (leadId: string, noteIndex: number) => {
        const lead = leads.find(l => l.id === leadId);
        if (!lead) return;
        const notes: any[] = lead.notes ? JSON.parse(lead.notes) : [];
        const deletedNote = notes[noteIndex];
        if (role === 'manager') {
            await fetch('/api/admin/change-requests', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'edit_lead', entityType: 'lead', entityId: leadId, entityTitle: lead.name, changes: { notes: JSON.stringify(notes.filter((_, i) => i !== noteIndex)) }, requestedBy: 'Manager', reason: `Delete note: "${deletedNote?.note}"` }),
            });
            alert('Note delete request submitted for admin approval.');
        } else {
            if (!confirm('Delete this note?')) return;
            const updatedNotes = notes.filter((_, i) => i !== noteIndex);
            await fetch(`/api/admin/leads/${leadId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes: JSON.stringify(updatedNotes) }) });
            fetchLeads();
        }
    };

    const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchLeads(); };

    const getCount = (s: string) => statusCounts.find(c=>c.status===s)?._count || 0;
    const totalCount = statusCounts.reduce((a,c)=>a+c._count,0);
    const filtered = leads.filter(l=> l.name.toLowerCase().includes(search.toLowerCase()) || l.phone.includes(search) || (l.preferredArea||'').toLowerCase().includes(search.toLowerCase()) || (l.propertyAddress||'').toLowerCase().includes(search.toLowerCase()));
    const statusColor = (s: string) => STATUSES.find(st=>st.value===s)?.color || 'bg-gray-100 text-gray-600';

    const exportCSV = () => {
        if (leads.length === 0) return;
        const headers = ['ID', 'Name', 'Phone', 'Email', 'WhatsApp', 'Source', 'Status', 'Assigned To', 'Follow Up Date'];
        if (leadType === 'owner') headers.push('Property Address', 'Property Type', 'Expected Rent');
        else headers.push('Preferred Area', 'BHK Preference', 'Budget Range', 'Looking For');
        headers.push('Notes', 'Created At');

        const csvRows = [headers.join(',')];
        leads.forEach(l => {
            const escape = (str: string | null | undefined | number) => `"${(str || '').toString().replace(/"/g, '""')}"`;
            const notes = l.notes ? JSON.parse(l.notes).map((n:any)=>`${n.note} (${n.by})`).join('; ') : '';
            const row = [
                escape(l.id), escape(l.name), escape(l.phone), escape(l.email), escape(l.whatsappNumber), escape(l.source), escape(l.status), escape(l.assignedTo), escape(l.followUpDate ? new Date(l.followUpDate).toLocaleDateString() : '')
            ];
            if (leadType === 'owner') {
                row.push(escape(l.propertyAddress), escape(l.propertyType), escape(l.expectedRent));
            } else {
                row.push(escape(l.preferredArea), escape(l.bhkPreference), escape(l.budgetRange), escape(l.lookingFor));
            }
            row.push(escape(notes), escape(l.createdAt));
            csvRows.push(row.join(','));
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${leadType}-leads.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"/></div>;

    return (
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
            {/* Header */}
            <div className="flex flex-col gap-3 mb-5">
                <div className="flex items-center justify-between">
                    <div>
                        <Link href={backHref} className="text-sm text-primary-600 dark:text-primary-400 hover:underline mb-0.5 inline-block">← Back</Link>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">{title}</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{totalCount} lead{totalCount!==1?'s':''}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                        <div className="flex gap-1.5">
                            <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Export CSV
                            </button>
                            <button onClick={()=>setShowImport(true)} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                Import Sheet
                            </button>
                        </div>
                        <Link 
                            href={`/forms/${leadType === 'owner' ? 'owner' : 'tenant'}`}
                            className="btn-premium px-3 py-2 rounded-xl text-xs font-semibold w-full block text-center"
                        >
                            + Add Lead
                        </Link>
                    </div>
                </div>

                {/* Search — full width on mobile */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input type="text" inputMode="search" placeholder="Search name, phone, area..." value={search} onChange={e=>setSearch(e.target.value)} className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"/>
                    <button type="submit" className="px-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-semibold">Go</button>
                </form>
            </div>

            {/* Status Pills — horizontally scrollable on mobile */}
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1 -mx-3 sm:mx-0 px-3 sm:px-0 snap-x scrollbar-none">
                <button onClick={()=>setFilterStatus('')} className={`flex-shrink-0 snap-start px-3 py-2 rounded-full text-xs font-semibold transition-all ${!filterStatus ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>All ({totalCount})</button>
                {STATUSES.slice(0,7).map(s=>(
                    <button key={s.value} onClick={()=>setFilterStatus(s.value)} className={`flex-shrink-0 snap-start px-3 py-2 rounded-full text-xs font-semibold transition-all ${filterStatus===s.value ? 'ring-2 ring-primary-500 ' : ''}${s.color}`}>{s.label} ({getCount(s.value)})</button>
                ))}
            </div>

            {/* Content Area - Horizontal Cards */}
            <div className="flex flex-col gap-4 animate-fade-in">
                {filtered.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 p-12 rounded-3xl text-center shadow-sm border border-dashed border-gray-200 dark:border-gray-700">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">{search||filterStatus ? 'No leads match your filters' : 'No leads yet — click "+ Add Lead" to add one'}</p>
                    </div>
                ) : (
                    filtered.map(lead => {
                        const smart = getSmartData(lead);
                        return (
                            <div
                                key={lead.id}
                                onClick={() => setSelectedId(lead.id)}
                                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer group p-6"
                            >
                                <div className="flex flex-col gap-5">
                                    {/* Top: Header with Badges and Name */}
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusColor(lead.status)}`}>
                                                    {STATUSES.find(s=>s.value===lead.status)?.label||lead.status}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400 bg-gray-50 dark:bg-gray-900 px-2 py-0.5 rounded-md">
                                                    {sourceLabel(lead.source)}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">{lead.name}</h3>
                                            <p className="text-base text-gray-500 font-medium">{lead.phone}</p>
                                        </div>
                                        {role === 'admin' && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); deleteLead(lead.id); }}
                                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                                title="Delete Lead"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                            </button>
                                        )}
                                    </div>

                                    {/* Middle: Details Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 border-y border-gray-50 dark:border-gray-700/50">
                                        {leadType === 'owner' ? (
                                            <>
                                                <div className="md:col-span-1">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Property Info</span>
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{smart.type}</span>
                                                </div>
                                                <div className="md:col-span-1">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Expected Rent</span>
                                                    <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{smart.rent}</span>
                                                </div>
                                                <div className="md:col-span-1">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Location</span>
                                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 line-clamp-1">{smart.address}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="md:col-span-1">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Requirement</span>
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{smart.bhk}</span>
                                                </div>
                                                <div className="md:col-span-1">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Budget</span>
                                                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{smart.budget}</span>
                                                </div>
                                                <div className="md:col-span-1">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Preferred Area</span>
                                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 line-clamp-1">{smart.area}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Bottom: Date */}
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                        Lead Created On {new Date(lead.createdAt).toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'})}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Lead Details Modal */}
            {selectedId && (() => {
                const selectedLead = filtered.find(l => l.id === selectedId);
                if (!selectedLead) return null;
                const notes: {date:string;note:string;by:string}[] = selectedLead.notes ? JSON.parse(selectedLead.notes) : [];
                const smart = getSmartData(selectedLead);

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
                        // Sort keys to prioritize important ones
                        const priorityKeys = ['purposeOfRental', 'commercialTenantTypes', 'propertyAddress', 'propertyType', 'expectedRent', 'preferredArea', 'budgetRange', 'bhkPreference'];
                        const sortedEntries = Object.entries(data).sort(([a], [b]) => {
                            const aIdx = priorityKeys.indexOf(a);
                            const bIdx = priorityKeys.indexOf(b);
                            if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
                            if (aIdx !== -1) return -1;
                            if (bIdx !== -1) return 1;
                            return a.localeCompare(b);
                        });

                        return (
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-800">
                                {prefix && <h5 className="text-sm font-bold text-gray-900 dark:text-white mb-4">{prefix}</h5>}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {sortedEntries.map(([key, value]) => {
                                        if (key === 'signature' || !value) return null;
                                        
                                        let displayValue = '';
                                        if (Array.isArray(value)) {
                                            displayValue = value.join(', ');
                                        } else if (typeof value === 'boolean') {
                                            displayValue = value ? 'Yes' : 'No';
                                        } else if (typeof value === 'object' && value !== null) {
                                            displayValue = JSON.stringify(value);
                                        } else {
                                            displayValue = String(value);
                                        }

                                        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                        return (
                                            <div key={key} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm col-span-1 sm:col-span-2">
                                                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{formattedKey}</span>
                                                <span className="block text-sm font-bold text-gray-900 dark:text-white break-words">{displayValue || '—'}</span>
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
                            
                            {/* Modal Header & Action Bar */}
                            <div className="bg-gray-50 dark:bg-gray-800/80 p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3 shrink-0">
                                <div className="flex items-center gap-2">
                                    <select value={selectedLead.status} onChange={e=>updateLead(selectedLead.id,{status:e.target.value})} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-sm font-bold text-gray-700 dark:text-gray-300 min-w-[140px] shadow-sm">
                                        {STATUSES.map(s=>(<option key={s.value} value={s.value}>{s.label}</option>))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={()=>setEditLead(selectedLead)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg> Edit
                                    </button>
                                    <button onClick={()=>switchType(selectedLead.id)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg> Move
                                    </button>
                                    {role === 'admin' ? (
                                        <button onClick={()=>deleteLead(selectedLead.id)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg> Delete
                                        </button>
                                    ) : selectedLead.status !== 'junk' && (
                                        <button onClick={()=>updateLead(selectedLead.id,{status:'junk'})} className="px-3 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">Junk</button>
                                    )}
                                    <button onClick={() => setSelectedId(null)} className="ml-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
                                <div className="flex flex-col sm:flex-row gap-6 justify-between items-start mb-8">
                                    <div>
                                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{selectedLead.name}</h3>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                                            <a href={`tel:${selectedLead.phone}`} className="inline-flex items-center gap-1.5 text-primary-600 dark:text-primary-400 font-semibold hover:underline bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>{selectedLead.phone}</a>
                                            <a href={`https://wa.me/${selectedLead.whatsappNumber||selectedLead.phone}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-green-600 font-semibold hover:underline bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.4 0-4.637-.856-6.358-2.282l-.446-.37-3.07 1.03 1.03-3.07-.37-.446A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>WhatsApp</a>
                                            {selectedLead.email && <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>{selectedLead.email}</span>}
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col gap-1.5 items-end">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg">{sourceLabel(selectedLead.source)}</span>
                                        {selectedLead.assignedTo && <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/10 px-3 py-1.5 rounded-lg">👤 {selectedLead.assignedTo}</span>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
                                    {leadType === 'owner' ? (
                                        <>
                                            <section className="space-y-4">
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 pb-2">Property Details</h4>
                                                <div><div className="text-[10px] font-bold text-gray-400 uppercase">Address</div><div className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{smart.address}</div></div>
                                                <div><div className="text-[10px] font-bold text-gray-400 uppercase">Property Type</div><div className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{smart.type}</div></div>
                                            </section>
                                            <section className="space-y-4">
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 pb-2">Financials & Timing</h4>
                                                <div><div className="text-[10px] font-bold text-gray-400 uppercase">Expected Rent</div><div className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{smart.rent}</div></div>
                                                <div><div className="text-[10px] font-bold text-gray-400 uppercase">Follow-up Date</div><div className="text-sm font-semibold text-orange-600 dark:text-orange-400 mt-1">{selectedLead.followUpDate ? new Date(selectedLead.followUpDate).toLocaleDateString('en-IN') : '—'}</div></div>
                                            </section>
                                        </>
                                    ) : (
                                        <>
                                            <section className="space-y-4">
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 pb-2">Requirements</h4>
                                                <div><div className="text-[10px] font-bold text-gray-400 uppercase">Preferred Area</div><div className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{smart.area}</div></div>
                                                <div><div className="text-[10px] font-bold text-gray-400 uppercase">BHK / Type</div><div className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{smart.bhk}</div></div>
                                            </section>
                                            <section className="space-y-4">
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 pb-2">Financials & Timing</h4>
                                                <div><div className="text-[10px] font-bold text-gray-400 uppercase">Budget Range</div><div className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{smart.budget}</div></div>
                                                <div><div className="text-[10px] font-bold text-gray-400 uppercase">Looking For</div><div className="text-sm font-semibold text-gray-900 dark:text-white mt-1 capitalize">{smart.lookingFor}</div></div>
                                                <div><div className="text-[10px] font-bold text-gray-400 uppercase">Follow-up Date</div><div className="text-sm font-semibold text-orange-600 dark:text-orange-400 mt-1">{selectedLead.followUpDate ? new Date(selectedLead.followUpDate).toLocaleDateString('en-IN') : '—'}</div></div>
                                            </section>
                                        </>
                                    )}
                                </div>

                                {selectedLead.message && (
                                    <div className="mb-10">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 pb-2 mb-4">Original Message / Requirements</h4>
                                        {renderMessage(selectedLead.message)}
                                    </div>
                                )}

                                {/* Notes Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Internal Notes</h4>
                                        <button onClick={()=>{setNoteModal(selectedLead.id);setNoteText('');}} className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 bg-primary-50 dark:bg-primary-900/10 px-3 py-1.5 rounded-lg">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg> Add Note
                                        </button>
                                    </div>
                                    
                                    {noteModal === selectedLead.id && (
                                        <div className="mb-6 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-primary-200 dark:border-primary-900/50">
                                            <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} rows={3} placeholder="Type a new note..." className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white mb-3 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"/>
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={()=>setNoteModal(null)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                                                <button onClick={()=>addNote(selectedLead.id)} className="px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-bold hover:bg-primary-600 transition-colors shadow-sm">Save Note</button>
                                            </div>
                                        </div>
                                    )}

                                    {notes.length === 0 ? (
                                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 text-center border border-dashed border-gray-200 dark:border-gray-700">
                                            <p className="text-sm text-gray-500 italic">No internal notes added yet.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {notes.map((n: any, i: number) => {
                                                const isEditing = editingNote?.leadId === selectedLead.id && editingNote?.index === i;
                                                return (
                                                    <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm group hover:shadow-md transition-all">
                                                        {isEditing ? (
                                                            <div className="flex flex-col gap-3">
                                                                <textarea value={editNoteText} onChange={e=>setEditNoteText(e.target.value)} rows={3} className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                                                                <div className="flex justify-end gap-2">
                                                                    <button onClick={()=>setEditingNote(null)} className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                                                                    <button onClick={()=>saveEditedNote(selectedLead.id, i)} className="px-4 py-2 text-sm bg-primary-500 text-white rounded-xl font-bold hover:bg-primary-600 transition-colors shadow-sm">Save Changes</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{n.note}</p>
                                                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-[10px] text-gray-500">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded font-semibold uppercase tracking-wider">{n.by}</span>
                                                                        <span>{new Date(n.date).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</span>
                                                                    </div>
                                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-3">
                                                                        <button onClick={()=>{setEditingNote({leadId:selectedLead.id,index:i});setEditNoteText(n.note);}} className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-bold flex items-center gap-1">
                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg> Edit
                                                                        </button>
                                                                        <button onClick={()=>deleteNote(selectedLead.id, i)} className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-bold flex items-center gap-1">
                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg> Delete
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
            {/* Add Lead Modal */}
            {/* Edit Lead Modal */}
            {editLead && <EditLeadModal lead={editLead} leadType={leadType} role={role} onClose={()=>setEditLead(null)} onSaved={()=>{setEditLead(null);fetchLeads();}} />}
            {/* Import Sheet Modal */}
            {showImport && <LeadsImportModal leadType={leadType} onClose={()=>setShowImport(false)} onImported={()=>{setShowImport(false);fetchLeads();}} />}
        </div>
    );
}

function EditLeadModal({ lead, leadType, role = 'admin', onClose, onSaved }: { lead: Lead; leadType: string; role?: string; onClose: ()=>void; onSaved: ()=>void }) {
    const [form, setForm] = useState<any>({
        name: lead.name, phone: lead.phone, email: lead.email||'', whatsappNumber: lead.whatsappNumber||'',
        propertyAddress: lead.propertyAddress||'', propertyType: lead.propertyType||'', expectedRent: lead.expectedRent?.toString()||'',
        lookingFor: lead.lookingFor||'rent', budgetRange: lead.budgetRange||'', preferredArea: lead.preferredArea||'',
        bhkPreference: lead.bhkPreference||'', message: lead.message||'', assignedTo: lead.assignedTo||'',
        source: lead.source, followUpDate: lead.followUpDate ? lead.followUpDate.slice(0,10) : '',
    });
    const [saving, setSaving] = useState(false);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true);
        if (role === 'manager') {
            await fetch('/api/admin/change-requests', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'edit_lead', entityType: 'lead', entityId: lead.id, entityTitle: lead.name, changes: form, requestedBy: 'Manager' }),
            });
            alert('Edit request submitted for admin approval.');
        } else {
            await fetch(`/api/admin/leads/${lead.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        }
        setSaving(false); onSaved();
    };
    const set = (k:string,v:string) => setForm({...form,[k]:v});
    const inputCls = "w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white";
    const labelCls = "text-xs font-semibold text-gray-600 dark:text-gray-400";
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={e=>e.stopPropagation()}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Edit Lead</h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className={labelCls}>Name *</label><input required value={form.name} onChange={e=>set('name',e.target.value)} className={inputCls}/></div>
                        <div><label className={labelCls}>Phone *</label><input required value={form.phone} onChange={e=>set('phone',e.target.value)} className={inputCls}/></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className={labelCls}>Email</label><input value={form.email} onChange={e=>set('email',e.target.value)} className={inputCls}/></div>
                        <div><label className={labelCls}>Source</label><select value={form.source} onChange={e=>set('source',e.target.value)} className={inputCls}>{SOURCES.map(s=>(<option key={s} value={s}>{sourceLabel(s)}</option>))}</select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className={labelCls}>Assign To</label><input value={form.assignedTo} onChange={e=>set('assignedTo',e.target.value)} className={inputCls}/></div>
                        <div><label className={labelCls}>Follow-up Date</label><input type="date" value={form.followUpDate} onChange={e=>set('followUpDate',e.target.value)} className={inputCls}/></div>
                    </div>
                    {leadType==='owner' ? (<>
                        <div><label className={labelCls}>Property Address</label><input value={form.propertyAddress} onChange={e=>set('propertyAddress',e.target.value)} className={inputCls}/></div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className={labelCls}>Property Type</label><input value={form.propertyType} onChange={e=>set('propertyType',e.target.value)} className={inputCls}/></div>
                            <div><label className={labelCls}>Expected Rent</label><input type="number" value={form.expectedRent} onChange={e=>set('expectedRent',e.target.value)} className={inputCls}/></div>
                        </div>
                    </>) : (<>
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className={labelCls}>Preferred Area</label><input value={form.preferredArea} onChange={e=>set('preferredArea',e.target.value)} className={inputCls}/></div>
                            <div><label className={labelCls}>BHK Preference</label><input value={form.bhkPreference} onChange={e=>set('bhkPreference',e.target.value)} className={inputCls}/></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className={labelCls}>Budget Range</label><input value={form.budgetRange} onChange={e=>set('budgetRange',e.target.value)} className={inputCls}/></div>
                            <div><label className={labelCls}>Looking For</label><select value={form.lookingFor} onChange={e=>set('lookingFor',e.target.value)} className={inputCls}><option value="rent">Rent</option><option value="lease">Lease</option></select></div>
                        </div>
                    </>)}
                    <div><label className={labelCls}>Notes / Message</label><textarea value={form.message} onChange={e=>set('message',e.target.value)} rows={2} className={inputCls}/></div>
                    <div className="flex gap-2 pt-2">
                        <button type="submit" disabled={saving} className="flex-1 btn-premium py-2.5 rounded-xl font-semibold">{saving?'Saving...':'Save Changes'}</button>
                        <button type="button" onClick={onClose} className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
