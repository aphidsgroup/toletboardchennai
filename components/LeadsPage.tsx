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
    const [showForm, setShowForm] = useState(false);
    const [editLead, setEditLead] = useState<Lead|null>(null);
    const [noteModal, setNoteModal] = useState<string|null>(null);
    const [noteText, setNoteText] = useState('');
    const [editingNote, setEditingNote] = useState<{leadId:string;index:number}|null>(null);
    const [editNoteText, setEditNoteText] = useState('');
    const [showImport, setShowImport] = useState(false);

    const fetchLeads = () => {
        const params = new URLSearchParams({ type: leadType });
        if (filterStatus) params.set('status', filterStatus);
        if (search) params.set('q', search);
        fetch(`/api/admin/leads?${params}`).then(r=>r.json()).then(d=>{ setLeads(d.leads||[]); setStatusCounts(d.statusCounts||[]); setLoading(false); }).catch(()=>setLoading(false));
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
        await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' });
        fetchLeads();
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
                        <button onClick={()=>setShowImport(true)} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            Import Sheet
                        </button>
                        <button onClick={()=>setShowForm(true)} className="btn-premium px-3 py-2 rounded-xl text-xs font-semibold">+ Add Lead</button>
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

            {/* Lead Cards */}
            {filtered.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-md">
                    <p className="text-gray-500 dark:text-gray-400">{search||filterStatus ? 'No leads match your filters' : 'No leads yet — click "+ Add Lead" to add one'}</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filtered.map(lead => {
                        const notes: {date:string;note:string;by:string}[] = lead.notes ? JSON.parse(lead.notes) : [];
                        return (
                        <div key={lead.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5 border border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <h3 className="font-bold text-gray-900 dark:text-white">{lead.name}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(lead.status)}`}>{STATUSES.find(s=>s.value===lead.status)?.label||lead.status}</span>
                                        <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">{sourceLabel(lead.source)}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                                        <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>{lead.phone}</a>
                                        {lead.email && <span className="inline-flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>{lead.email}</span>}
                                        <a href={`https://wa.me/${lead.whatsappNumber||lead.phone}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-green-600 hover:underline"><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.4 0-4.637-.856-6.358-2.282l-.446-.37-3.07 1.03 1.03-3.07-.37-.446A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>WhatsApp</a>
                                    </div>
                                    {leadType==='owner' && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{lead.propertyAddress && `${lead.propertyAddress}`} {lead.propertyType && `· ${lead.propertyType}`} {lead.expectedRent && `· ₹${lead.expectedRent.toLocaleString('en-IN')}/mo`}</div>}
                                    {leadType==='tenant' && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{lead.preferredArea && `${lead.preferredArea}`} {lead.bhkPreference && `· ${lead.bhkPreference}`} {lead.budgetRange && `· Budget: ${lead.budgetRange}`} {lead.lookingFor && `· ${lead.lookingFor}`}</div>}
                                    {lead.message && <p className="text-xs text-gray-500 mt-1 truncate max-w-md italic" title={lead.message}>&quot;{lead.message}&quot;</p>}
                                    {lead.assignedTo && <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">Assigned: {lead.assignedTo}</p>}
                                    {lead.followUpDate && <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Follow-up: {new Date(lead.followUpDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>}
                                    {notes.length > 0 && <div className="mt-2 space-y-1">{notes.map((n: any,i: number)=>{
                                        const realIdx = i;
                                        const isEditing = editingNote?.leadId === lead.id && editingNote?.index === realIdx;
                                        return (<div key={i} className="flex items-start gap-1 group">
                                            {isEditing ? (
                                                <div className="flex-1 flex gap-1">
                                                    <input value={editNoteText} onChange={e=>setEditNoteText(e.target.value)} className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                                                    <button onClick={()=>saveEditedNote(lead.id, realIdx)} className="px-2 py-1 text-xs bg-primary-500 text-white rounded font-semibold">Save</button>
                                                    <button onClick={()=>setEditingNote(null)} className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">Cancel</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="flex-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-750 rounded-lg px-2 py-1">{n.note} <span className="text-gray-400">— {n.by}, {new Date(n.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span></p>
                                                    <button onClick={()=>{setEditingNote({leadId:lead.id,index:realIdx});setEditNoteText(n.note);}} className="p-0.5 opacity-60 text-gray-400 hover:text-gray-600 transition-all" title="Edit note"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
                                                    <button onClick={()=>deleteNote(lead.id, realIdx)} className="p-0.5 opacity-60 text-red-400 hover:text-red-600 transition-all" title="Delete note"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                                                </>
                                            )}
                                        </div>);
                                    })}</div>}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <select value={lead.status} onChange={e=>updateLead(lead.id,{status:e.target.value})} className="flex-1 min-w-[130px] px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        {STATUSES.map(s=>(<option key={s.value} value={s.value}>{s.label}</option>))}
                                    </select>
                                    <button onClick={()=>setEditLead(lead)} className="p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors" title="Edit Lead"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
                                    <button onClick={()=>{setNoteModal(lead.id);setNoteText('');}} className="p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors" title="Add Note"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/></svg></button>
                                    <button onClick={()=>switchType(lead.id)} className="p-2.5 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors" title={`Move to ${leadType==='owner'?'Tenant':'Owner'} Leads`}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg></button>
                                    {role === 'admin' ? (
                                        <button onClick={()=>deleteLead(lead.id)} className="p-2.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors" title="Delete"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                                    ) : lead.status !== 'junk' ? (
                                        <button onClick={()=>updateLead(lead.id,{status:'junk'})} className="px-3 py-2.5 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">Junk</button>
                                    ) : null}
                                </div>
                            </div>
                            {/* Note input inline */}
                            {noteModal===lead.id && (
                                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                                    <input value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Add a follow-up note..." className="flex-1 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"/>
                                    <div className="flex gap-2">
                                        <button onClick={()=>addNote(lead.id)} className="flex-1 sm:flex-none px-4 py-3 bg-primary-500 text-white rounded-xl text-sm font-semibold">Save</button>
                                        <button onClick={()=>setNoteModal(null)} className="flex-1 sm:flex-none px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl text-sm">Cancel</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );})}
                </div>
            )}
                </div>
            )}

            {/* Add Lead Modal */}
            {showForm && <AddLeadModal leadType={leadType} onClose={()=>setShowForm(false)} onAdded={()=>{setShowForm(false);fetchLeads();}} />}
            {/* Edit Lead Modal */}
            {editLead && <EditLeadModal lead={editLead} leadType={leadType} role={role} onClose={()=>setEditLead(null)} onSaved={()=>{setEditLead(null);fetchLeads();}} />}
            {/* Import Sheet Modal */}
            {showImport && <LeadsImportModal leadType={leadType} onClose={()=>setShowImport(false)} onImported={()=>{setShowImport(false);fetchLeads();}} />}
        </div>
    );
}

function AddLeadModal({ leadType, onClose, onAdded }: { leadType:string; onClose:()=>void; onAdded:()=>void }) {
    const [form, setForm] = useState<any>({ leadType, source:'whatsapp', name:'', phone:'', email:'', whatsappNumber:'', propertyAddress:'', propertyType:'', expectedRent:'', lookingFor:'rent', budgetRange:'', preferredArea:'', bhkPreference:'', message:'', assignedTo:'' });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true);
        await fetch('/api/admin/leads', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) });
        setSaving(false); onAdded();
    };

    const set = (k:string,v:string) => setForm({...form,[k]:v});

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={e=>e.stopPropagation()}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add {leadType==='owner'?'Owner':'Tenant'} Lead</h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Name *</label><input required value={form.name} onChange={e=>set('name',e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"/></div>
                        <div><label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Phone *</label><input required value={form.phone} onChange={e=>set('phone',e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"/></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Email</label><input value={form.email} onChange={e=>set('email',e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"/></div>
                        <div><label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Source</label>
                            <select value={form.source} onChange={e=>set('source',e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white">
                                {SOURCES.map(s=>(<option key={s} value={s}>{sourceLabel(s)}</option>))}
                            </select>
                        </div>
                    </div>
                    {leadType==='owner' ? (
                        <>
                            <div><label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Property Address</label><input value={form.propertyAddress} onChange={e=>set('propertyAddress',e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"/></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Property Type</label><input value={form.propertyType} onChange={e=>set('propertyType',e.target.value)} placeholder="Apartment, Villa..." className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"/></div>
                                <div><label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Expected Rent (₹)</label><input type="number" value={form.expectedRent} onChange={e=>set('expectedRent',e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"/></div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Preferred Area</label><input value={form.preferredArea} onChange={e=>set('preferredArea',e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"/></div>
                                <div><label className="text-xs font-semibold text-gray-600 dark:text-gray-400">BHK Preference</label><input value={form.bhkPreference} onChange={e=>set('bhkPreference',e.target.value)} placeholder="2 BHK, 3 BHK..." className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"/></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Budget Range</label><input value={form.budgetRange} onChange={e=>set('budgetRange',e.target.value)} placeholder="10K-15K" className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"/></div>
                                <div><label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Looking For</label>
                                    <select value={form.lookingFor} onChange={e=>set('lookingFor',e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"><option value="rent">Rent</option><option value="lease">Lease</option></select>
                                </div>
                            </div>
                        </>
                    )}
                    <div><label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Notes / Message</label><textarea value={form.message} onChange={e=>set('message',e.target.value)} rows={2} className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"/></div>
                    <div><label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Assign To</label><input value={form.assignedTo} onChange={e=>set('assignedTo',e.target.value)} placeholder="Manager name" className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"/></div>
                    <div className="flex gap-2 pt-2">
                        <button type="submit" disabled={saving} className="flex-1 btn-premium py-2.5 rounded-xl font-semibold">{saving?'Saving...':'Add Lead'}</button>
                        <button type="button" onClick={onClose} className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold">Cancel</button>
                    </div>
                </form>
            </div>
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
