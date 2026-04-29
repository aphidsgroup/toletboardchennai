'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Lead { id:string; name:string; phone:string; email:string|null; lookingFor:string; propertyType:string|null; budgetRange:string|null; preferredArea:string|null; message:string|null; createdAt:string; }
interface User { id:string; name:string; email:string|null; phone:string; whatsappNumber:string|null; createdAt:string; shortlists:{id:string;propertyId:string;property:{title:string;slug:string}}[]; }
interface PropertyItem { id:string; title:string; slug:string; areaName:string; dealType:string; usageType:string; priceInr:number; isPublished:boolean; isRentedOut?:boolean; createdAt:string; }
interface OnboardingSubmission { id:string; formType:string; status:string; name:string; phone:string; email:string|null; createdAt:string; tenantType?:string; preferredAreas?:string; propertyType?:string; budgetRange?:string; bedrooms?:string; moveInDate?:string; propertyAddress?:string; }
interface Permissions { viewLeads:boolean; viewUsers:boolean; viewProperties:boolean; addProperties:boolean; editProperties:boolean; }

export default function ManagerDashboard() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [properties, setProperties] = useState<PropertyItem[]>([]);
    const [submissions, setSubmissions] = useState<OnboardingSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'leads'|'users'|'properties'|'forms'>('leads');
    const [selectedLeadId, setSelectedLeadId] = useState<string|null>(null);
    const [authorized, setAuthorized] = useState(true);
    const [permissions, setPermissions] = useState<Permissions>({ viewLeads:true, viewUsers:true, viewProperties:true, addProperties:false, editProperties:false });

    useEffect(() => {
        fetch('/api/auth/me').then(r=>r.json()).then(data => {
            if (!data.user || (data.user.role !== 'manager' && data.user.role !== 'admin')) {
                setAuthorized(false); window.location.href = '/manager/login'; return;
            }
            const perms = data.user.role === 'admin'
                ? { viewLeads:true, viewUsers:true, viewProperties:true, addProperties:true, editProperties:true }
                : (data.user.permissions || { viewLeads:true, viewUsers:true, viewProperties:true, addProperties:false, editProperties:false });
            setPermissions(perms);
            const fetches:Promise<void>[] = [];
            if (perms.viewLeads) fetches.push(fetch('/api/leads').then(r=>r.json()).then(d=>setLeads(d.leads||[])));
            if (perms.viewUsers) fetches.push(fetch('/api/manager/users').then(r=>r.json()).then(d=>setUsers(d.users||[])));
            if (perms.viewProperties) fetches.push(fetch('/api/manager/properties').then(r=>r.json()).then(d=>setProperties(d.properties||[])));
            fetches.push(fetch('/api/admin/onboarding').then(r=>r.json()).then(d=>setSubmissions(d.submissions||[])));
            Promise.all(fetches).then(()=>setLoading(false));
            if (!perms.viewLeads && perms.viewUsers) setTab('users');
            else if (!perms.viewLeads && !perms.viewUsers && perms.viewProperties) setTab('properties');
        }).catch(()=>{ setAuthorized(false); window.location.href='/manager/login'; });
    }, []);

    if (!authorized || loading) return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
        </main>
    );

    const noAccess = !permissions.viewLeads && !permissions.viewUsers && !permissions.viewProperties;

    const requestDeletion = async (prop:PropertyItem) => {
        const reason = prompt(`Why should "${prop.title}" be deleted?`);
        if (reason === null) return;
        await fetch('/api/admin/change-requests', { method:'POST', headers:{'Content-Type':'application/json'},
            body:JSON.stringify({ type:'delete_property', entityType:'property', entityId:prop.id, entityTitle:prop.title, requestedBy:'Manager', reason }) });
        alert('Deletion request sent to admin.');
    };

    const toggleRentedOut = async (prop:PropertyItem) => {
        const newVal = !prop.isRentedOut;
        await fetch('/api/admin/change-requests', { method:'POST', headers:{'Content-Type':'application/json'},
            body:JSON.stringify({ type:'edit_property', entityType:'property', entityId:prop.id, entityTitle:prop.title, changes:{ isRentedOut:newVal, isPublished:!newVal }, requestedBy:'Manager' }) });
        alert('Change request sent to admin.');
    };

    const tabs = [
        ...(permissions.viewLeads ? [{ key:'leads' as const, label:'Leads', count:leads.length, icon:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' }] : []),
        ...(permissions.viewUsers ? [{ key:'users' as const, label:'Users', count:users.length, icon:'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' }] : []),
        ...(permissions.viewProperties ? [{ key:'properties' as const, label:'Properties', count:properties.length, icon:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' }] : []),
        { key:'forms' as const, label:'Forms', count:submissions.length, icon:'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    ];

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
            {/* Top Header */}
            <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between px-4 h-14">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white text-base">Manager</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {tab === 'leads' && permissions.viewLeads && (
                            <>
                                <a href="/manager/leads" className="flex items-center gap-1 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-semibold rounded-lg">Leads</a>
                                <a href="/manager/leads/owner" className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-lg">Owner Leads</a>
                                <a href="/manager/leads/tenant" className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-semibold rounded-lg">Tenant Leads</a>
                            </>
                        )}
                        {tab === 'properties' && permissions.viewProperties && permissions.addProperties && (
                            <a href="/manager/properties/new" className="flex items-center gap-1 px-3 py-1.5 bg-primary-500 text-white text-xs font-semibold rounded-lg">+ Add</a>
                        )}
                        <button onClick={async()=>{await fetch('/api/auth/logout',{method:'POST'});window.location.href='/manager/login';}} className="p-2 text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                        </button>
                    </div>
                </div>
            </header>

            <div className="px-4 py-4 max-w-2xl mx-auto">
                {noAccess ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-12 text-center mt-8">
                        <p className="text-gray-500">No features enabled. Contact your admin.</p>
                    </div>
                ) : (
                    <>
                        {/* Summary cards */}
                        <div className="grid grid-cols-3 gap-3 mb-5">
                            {permissions.viewLeads && <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm text-center"><div className="text-2xl font-extrabold text-primary-600">{leads.length}</div><div className="text-xs text-gray-500 mt-0.5">Responses</div></div>}
                            {permissions.viewUsers && <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm text-center"><div className="text-2xl font-extrabold text-indigo-600">{users.length}</div><div className="text-xs text-gray-500 mt-0.5">Users</div></div>}
                            {permissions.viewProperties && <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm text-center"><div className="text-2xl font-extrabold text-emerald-600">{properties.length}</div><div className="text-xs text-gray-500 mt-0.5">Properties</div></div>}
                        </div>

                        {/* Leads Tab */}
                        {tab === 'leads' && permissions.viewLeads && (
                            <div className="space-y-3">
                                {leads.length === 0 ? <EmptyState text="No lead responses yet" /> : leads.map(lead => (
                                    <div 
                                        key={lead.id} 
                                        onClick={() => setSelectedLeadId(lead.id)}
                                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 cursor-pointer hover:shadow-md transition-shadow group"
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-3">
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">{lead.name}</div>
                                                {lead.email && <div className="text-xs text-gray-500 mt-0.5 truncate">{lead.email}</div>}
                                            </div>
                                            <span className={`flex-shrink-0 px-2 py-1 rounded-md text-[10px] font-black uppercase ${lead.lookingFor==='rent' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'}`}>{lead.lookingFor}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 dark:text-gray-400 mb-4">
                                            <div className="truncate"><span className="text-gray-400">Area:</span> {lead.preferredArea || '—'}</div>
                                            <div><span className="text-gray-400">Budget:</span> {lead.budgetRange || '—'}</div>
                                            <div><span className="text-gray-400">Type:</span> {lead.propertyType || '—'}</div>
                                            <div><span className="text-gray-400">Date:</span> {new Date(lead.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
                                        </div>
                                        <div className="flex gap-2" onClick={e=>e.stopPropagation()}>
                                            <a href={`tel:${lead.phone}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg text-xs font-bold">
                                                Call
                                            </a>
                                            <a href={`https://wa.me/${lead.phone}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-xs font-bold">
                                                WhatsApp
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Users Tab */}
                        {tab === 'users' && permissions.viewUsers && (
                            <div className="space-y-3">
                                {users.length === 0 ? <EmptyState text="No registered users yet" /> : users.map(user => (
                                    <div key={user.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <div className="font-semibold text-gray-900 dark:text-white">{user.name}</div>
                                                {user.email && <div className="text-xs text-gray-500 truncate">{user.email}</div>}
                                            </div>
                                            <span className="text-xs text-gray-400">{new Date(user.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
                                        </div>
                                        {user.shortlists.length > 0 && (
                                            <div className="mb-3">
                                                <div className="text-xs font-semibold text-gray-500 mb-1">Shortlisted ({user.shortlists.length})</div>
                                                <div className="space-y-1">
                                                    {user.shortlists.map(s=>(
                                                        <a key={s.id} href={`/p/${s.property.slug}`} target="_blank" className="block text-xs text-primary-600 truncate">{s.property.title}</a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <a href={`tel:${user.phone}`} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl text-sm font-semibold">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                                                Call
                                            </a>
                                            {user.whatsappNumber && (
                                                <a href={`https://wa.me/${user.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl text-sm font-semibold">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.4 0-4.637-.856-6.358-2.282l-.446-.37-3.07 1.03 1.03-3.07-.37-.446A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                                                    WhatsApp
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Properties Tab */}
                        {tab === 'properties' && permissions.viewProperties && (
                            <div className="space-y-3">
                                {properties.length === 0 ? <EmptyState text="No properties found" /> : properties.map(prop => (
                                    <div key={prop.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-gray-900 dark:text-white text-sm leading-snug">{prop.title}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{prop.areaName} · {new Date(prop.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${prop.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{prop.isPublished ? 'Live' : 'Draft'}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${prop.dealType==='rent' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{prop.dealType}</span>
                                            </div>
                                        </div>
                                        <div className="text-sm font-bold text-primary-600 dark:text-primary-400 mb-3">
                                            ₹{prop.priceInr?.toLocaleString('en-IN')}/mo
                                        </div>
                                        {permissions.editProperties && (
                                            <div className="grid grid-cols-3 gap-2">
                                                <a href={`/manager/properties/${prop.id}/edit`} className="flex items-center justify-center gap-1 py-2.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl text-xs font-semibold">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                                    Edit
                                                </a>
                                                <button onClick={()=>toggleRentedOut(prop)} className={`flex items-center justify-center py-2.5 rounded-xl text-xs font-semibold ${prop.isRentedOut ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                                    {prop.isRentedOut ? 'Unhide' : 'Rented Out'}
                                                </button>
                                                <button onClick={()=>requestDeletion(prop)} className="flex items-center justify-center py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold">
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Forms Tab */}
                        {tab === 'forms' && (
                            <div className="space-y-4">
                                <div className="bg-primary-50 dark:bg-primary-900/10 rounded-2xl p-4 border border-primary-100 dark:border-primary-900/20 mb-2">
                                    <h3 className="text-sm font-bold text-primary-800 dark:text-primary-300 mb-3 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                                        Shareable Form Links
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-2.5 rounded-xl text-xs shadow-sm">
                                            <span className="font-semibold text-gray-600 dark:text-gray-400">Tenant Form:</span>
                                            <div className="flex items-center gap-2">
                                                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">/forms/tenant</code>
                                                <button onClick={() => { navigator.clipboard.writeText(window.location.origin + '/forms/tenant'); alert('Copied!'); }} className="text-primary-600 font-bold">Copy</button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-2.5 rounded-xl text-xs shadow-sm">
                                            <span className="font-semibold text-gray-600 dark:text-gray-400">Owner Form:</span>
                                            <div className="flex items-center gap-2">
                                                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">/forms/owner</code>
                                                <button onClick={() => { navigator.clipboard.writeText(window.location.origin + '/forms/owner'); alert('Copied!'); }} className="text-primary-600 font-bold">Copy</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {submissions.length === 0 ? <EmptyState text="No form submissions yet" /> : submissions.map(sub => (
                                        <div key={sub.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded ${sub.formType === 'tenant' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                                        {sub.formType}
                                                    </span>
                                                    <div className="font-bold text-gray-900 dark:text-white mt-1">{sub.name}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] text-gray-400">{new Date(sub.createdAt).toLocaleDateString()}</div>
                                                    <div className={`text-[10px] font-bold ${sub.status === 'pending' ? 'text-amber-500' : 'text-green-500'}`}>
                                                        {sub.status.toUpperCase()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500 mb-3 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                                                    {sub.phone}
                                                </div>
                                                {sub.preferredAreas && (
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                                                        {sub.preferredAreas}
                                                    </div>
                                                )}
                                            </div>
                                            <Link href={`/manager/forms?id=${sub.id}`} className="block w-full text-center py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300">
                                                Review & Verify
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Sticky Bottom Tab Bar */}
            {!noAccess && (
                <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-bottom">
                    <div className="flex">
                        {tabs.map(t => (
                            <button key={t.key} onClick={()=>setTab(t.key)} className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${tab===t.key ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={t.icon}/></svg>
                                <span className="text-xs font-semibold">{t.label}</span>
                                <span className={`text-xs px-1.5 rounded-full ${tab===t.key ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>{t.count}</span>
                            </button>
                        ))}
                    </div>
                </nav>
            )}
            {/* Lead Detail Modal */}
            {selectedLeadId && (() => {
                const lead = leads.find(l => l.id === selectedLeadId);
                if (!lead) return null;

                const getSmartData = () => {
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
                const smart = getSmartData();

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
                            <div className="bg-gray-50 dark:bg-gray-800/80 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white ml-2">Lead Details</h3>
                                <button onClick={() => setSelectedLeadId(null)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
                                <div className="flex flex-col sm:flex-row gap-6 justify-between items-start mb-8">
                                    <div>
                                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{lead.name}</h3>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                                            <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1.5 text-primary-600 dark:text-primary-400 font-semibold hover:underline bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-lg">{lead.phone}</a>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg tracking-widest ${smart.lookingFor === 'rent' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'}`}>
                                            {smart.lookingFor}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
                                    <section className="space-y-4">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 pb-2">Requirements</h4>
                                        <DetailItem label="Looking For" value={smart.lookingFor.toUpperCase()} />
                                        <DetailItem label="Property Type" value={smart.type} />
                                        <DetailItem label="Budget Range" value={smart.budget} />
                                        <DetailItem label="Preferred Area" value={smart.area} />
                                    </section>
                                    <section className="space-y-4">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 pb-2">Submission</h4>
                                        <DetailItem label="Date" value={new Date(lead.createdAt).toLocaleString('en-IN')} />
                                        <DetailItem label="Source" value="Manual Form Submission" />
                                    </section>
                                </div>

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
        </main>
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

function EmptyState({ text }:{ text:string }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-10 text-center border border-gray-100 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-sm">{text}</p>
        </div>
    );
}
