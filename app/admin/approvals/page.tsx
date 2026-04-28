'use client';
import { useState, useEffect } from 'react';

interface ChangeRequest {
    id: string; type: string; entityType: string; entityId: string; entityTitle: string;
    changes: string | null; reason: string | null; requestedBy: string;
    status: string; reviewedBy: string | null; reviewNote: string | null;
    createdAt: string; updatedAt: string;
}

const TYPE_LABELS: Record<string, string> = {
    edit_property: 'Edit Property', delete_property: 'Delete Property',
    edit_lead: 'Edit Lead', delete_lead: 'Delete Lead',
    status_lead: 'Change Lead Status', switch_lead: 'Switch Lead Type',
};

export default function ApprovalsPage() {
    const [requests, setRequests] = useState<ChangeRequest[]>([]);
    const [filter, setFilter] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchRequests = () => {
        setLoading(true);
        fetch(`/api/admin/change-requests?status=${filter}`).then(r => r.json()).then(d => { setRequests(d.requests || []); setLoading(false); });
    };
    useEffect(() => { fetchRequests(); }, [filter]);

    const handleAction = async (id: string, status: 'approved' | 'rejected') => {
        const note = status === 'rejected' ? prompt('Reason for rejection (optional):') : null;
        await fetch(`/api/admin/change-requests/${id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, reviewedBy: 'Admin', reviewNote: note }),
        });
        fetchRequests();
    };

    const formatChanges = (changes: string | null) => {
        if (!changes) return null;
        try {
            const obj = JSON.parse(changes);
            return Object.entries(obj).filter(([, v]) => v !== null && v !== undefined && v !== '').map(([k, v]) => (
                <div key={k} className="flex gap-2 text-xs">
                    <span className="font-semibold text-gray-600 dark:text-gray-400 min-w-[120px]">{k}:</span>
                    <span className="text-gray-900 dark:text-white truncate max-w-xs">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                </div>
            ));
        } catch { return <span className="text-xs text-gray-500">{changes}</span>; }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Approval Queue</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Review and approve manager change requests</p>
                </div>
                <div className="flex gap-1 bg-gray-200 dark:bg-gray-700 rounded-xl p-1">
                    {['pending', 'approved', 'rejected', 'all'].map(s => (
                        <button key={s} onClick={() => setFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${filter === s ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                        >{s}</button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>
            ) : requests.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-12 text-center">
                    <svg className="w-14 h-14 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No {filter} requests</h3>
                    <p className="text-gray-500 text-sm">All caught up!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {requests.map(cr => (
                        <div key={cr.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-5 py-4 flex items-start justify-between gap-4 cursor-pointer" onClick={() => setExpandedId(expandedId === cr.id ? null : cr.id)}>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${cr.type.includes('delete') ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : cr.type.includes('edit') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                                            {TYPE_LABELS[cr.type] || cr.type}
                                        </span>
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${cr.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : cr.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {cr.status}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{cr.entityTitle}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        By {cr.requestedBy} · {new Date(cr.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    {cr.reason && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 italic">Reason: {cr.reason}</p>}
                                </div>
                                {cr.status === 'pending' && (
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button onClick={(e) => { e.stopPropagation(); handleAction(cr.id, 'approved'); }}
                                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors">
                                            Approve
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleAction(cr.id, 'rejected'); }}
                                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors">
                                            Reject
                                        </button>
                                    </div>
                                )}
                                {cr.status !== 'pending' && cr.reviewedBy && (
                                    <span className="text-xs text-gray-500 shrink-0">Reviewed by {cr.reviewedBy}</span>
                                )}
                            </div>
                            {expandedId === cr.id && cr.changes && (
                                <div className="px-5 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">Proposed Changes</p>
                                    <div className="space-y-1 bg-gray-50 dark:bg-gray-750 rounded-lg p-3">{formatChanges(cr.changes)}</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
