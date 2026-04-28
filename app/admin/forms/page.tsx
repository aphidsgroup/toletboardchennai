'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface OnboardingSubmission {
    id: string;
    formType: string;
    status: string;
    name: string;
    phone: string;
    whatsappNumber: string | null;
    email: string | null;
    wantsWhatsappUpdates: boolean;
    tenantType: string | null;
    preferredAreas: string | null;
    propertyType: string | null;
    budgetRange: string | null;
    bedrooms: string | null;
    moveInDate: string | null;
    propertyAddress: string | null;
    propertyDetails: string | null;
    createdAt: string;
}

function FormsDashboardContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'submissions' | 'manage'>('submissions');
    const [submissions, setSubmissions] = useState<OnboardingSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(searchParams.get('id'));

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/onboarding');
            const data = await res.json();
            setSubmissions(data.submissions || []);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'verify' | 'delete') => {
        if (action === 'delete' && !confirm('Are you sure you want to delete this submission?')) return;
        
        try {
            const res = await fetch('/api/admin/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, action }),
            });
            if (res.ok) {
                alert(action === 'verify' ? 'Successfully verified and converted to Lead!' : 'Deleted successfully.');
                fetchSubmissions();
                if (id === selectedId) setSelectedId(null);
            }
        } catch (error) {
            alert('Action failed.');
        }
    };

    const selectedSub = submissions.find(s => s.id === selectedId);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Onboarding Forms</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage forms and verify incoming requests.</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex">
                        <button 
                            onClick={() => setActiveTab('submissions')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'submissions' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Submissions
                        </button>
                        <button 
                            onClick={() => setActiveTab('manage')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'manage' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Manage Forms
                        </button>
                    </div>
                    <button 
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        Back
                    </button>
                </div>
            </div>

            {activeTab === 'manage' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                    <FormManagementCard 
                        title="Tenant Onboarding Form" 
                        description="Used for tenants looking for a property to rent/lease."
                        link="/forms/tenant"
                    />
                    <FormManagementCard 
                        title="Property Onboarding Form" 
                        description="Used for property owners to submit details for listing."
                        link="/forms/owner"
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
                    {/* List Side */}
                    <div className="lg:col-span-4 space-y-4">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider px-2">Submissions ({submissions.length})</h2>
                        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                            {submissions.length === 0 ? (
                                <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl text-center border border-dashed border-gray-200 dark:border-gray-800">
                                    <p className="text-gray-500">No submissions yet.</p>
                                </div>
                            ) : (
                                submissions.map(sub => (
                                    <button
                                        key={sub.id}
                                        onClick={() => setSelectedId(sub.id)}
                                        className={`w-full text-left p-4 rounded-2xl transition-all border-2 ${selectedId === sub.id 
                                            ? 'bg-primary-50 dark:bg-primary-900/10 border-primary-500' 
                                            : 'bg-white dark:bg-gray-900 border-transparent shadow-sm hover:shadow-md'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${sub.formType === 'tenant' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {sub.formType}
                                            </span>
                                            <span className={`text-[10px] font-bold ${sub.status === 'pending' ? 'text-amber-500' : 'text-green-500'}`}>
                                                {sub.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="font-bold text-gray-900 dark:text-white truncate">{sub.name}</div>
                                        <div className="text-xs text-gray-500 mt-1">{new Date(sub.createdAt).toLocaleDateString()}</div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Detail Side */}
                    <div className="lg:col-span-8">
                        {selectedSub ? (
                            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-fade-in">
                                <div className="p-6 sm:p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Submission Details</h3>
                                        <div className="flex gap-2">
                                            {selectedSub.status === 'pending' && (
                                                <button 
                                                    onClick={() => handleAction(selectedSub.id, 'verify')}
                                                    className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all"
                                                >
                                                    Verify & Convert to Lead
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleAction(selectedSub.id, 'delete')}
                                                className="px-6 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <section className="space-y-4">
                                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2">Customer Profile</h4>
                                            <DetailItem label="Full Name" value={selectedSub.name} />
                                            <DetailItem label="Phone Number" value={selectedSub.phone} />
                                            <DetailItem label="Email Address" value={selectedSub.email} />
                                            <DetailItem label="WhatsApp Number" value={selectedSub.whatsappNumber} />
                                            <DetailItem label="WhatsApp Updates" value={selectedSub.wantsWhatsappUpdates ? 'Opted In' : 'Opted Out'} />
                                        </section>

                                        <section className="space-y-4">
                                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2">Request Info</h4>
                                            <DetailItem label="Form Type" value={selectedSub.formType.toUpperCase()} />
                                            <DetailItem label="Tenant Type" value={selectedSub.tenantType} />
                                            <DetailItem label="Property Type" value={selectedSub.propertyType} />
                                            <DetailItem label="BHK / Bedrooms" value={selectedSub.bedrooms} />
                                            <DetailItem label="Budget Range" value={selectedSub.budgetRange} />
                                            <DetailItem label="Preferred Move-in" value={selectedSub.moveInDate ? new Date(selectedSub.moveInDate).toLocaleDateString() : null} />
                                        </section>
                                    </div>

                                    <div className="mt-8 space-y-6">
                                        {selectedSub.preferredAreas && (
                                            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl">
                                                <h4 className="text-xs font-black text-gray-400 uppercase mb-2">Preferred Areas</h4>
                                                <p className="text-gray-900 dark:text-white font-medium">{selectedSub.preferredAreas}</p>
                                            </div>
                                        )}
                                        {selectedSub.propertyAddress && (
                                            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl">
                                                <h4 className="text-xs font-black text-gray-400 uppercase mb-2">Property Address</h4>
                                                <p className="text-gray-900 dark:text-white font-medium">{selectedSub.propertyAddress}</p>
                                            </div>
                                        )}
                                        {selectedSub.propertyDetails && (
                                            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl">
                                                <h4 className="text-xs font-black text-gray-400 uppercase mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Full Onboarding Details</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                                    {(() => {
                                                        try {
                                                            let details = selectedSub.propertyDetails;
                                                            // Handle potential double stringification from previous bug
                                                            if (typeof details === 'string' && (details.startsWith('{') || details.startsWith('"'))) {
                                                                try {
                                                                    const parsed = JSON.parse(details);
                                                                    details = typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
                                                                } catch (e) {
                                                                    // Fallback if it's not JSON
                                                                }
                                                            }

                                                            if (typeof details !== 'object' || details === null) {
                                                                return <p className="text-gray-900 dark:text-white font-medium whitespace-pre-wrap col-span-full">{selectedSub.propertyDetails}</p>;
                                                            }

                                                            return (
                                                                <>
                                                                    <DetailItem label="Purpose" value={Array.isArray(details.purposeOfRental) ? details.purposeOfRental.join(', ') : details.purposeOfRental} />
                                                                    <DetailItem label="Total Area" value={details.totalSqft ? `${details.totalSqft} Sq Ft` : null} />
                                                                    <DetailItem label="BHK" value={details.bhkType} />
                                                                    <DetailItem label="Parking" value={details.parkingType} />
                                                                    <DetailItem label="Car Parks" value={details.carParkingCount} />
                                                                    <DetailItem label="Monthly Rent" value={details.monthlyRent ? `₹${Number(details.monthlyRent).toLocaleString('en-IN')}` : null} />
                                                                    <DetailItem label="Security Deposit" value={details.securityDeposit ? `₹${Number(details.securityDeposit).toLocaleString('en-IN')}` : null} />
                                                                    <DetailItem label="Maintenance" value={details.maintenanceFee === 'Yes' ? `₹${Number(details.maintenanceAmount).toLocaleString('en-IN')}` : (details.maintenanceFee === 'No' ? 'No' : null)} />
                                                                    <DetailItem label="Min. Lease" value={details.minimumLease ? `${details.minimumLease} Years` : null} />
                                                                    <DetailItem label="Tenant Preferences" value={Array.isArray(details.tenantPreferences) ? details.tenantPreferences.join(', ') : details.tenantPreferences} />
                                                                    <DetailItem label="Commercial Types" value={Array.isArray(details.commercialTenantTypes) ? details.commercialTenantTypes.join(', ') : details.commercialTenantTypes} />
                                                                    
                                                                    {details.signature && (
                                                                        <div className="col-span-full mt-6">
                                                                            <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Digital Signature</div>
                                                                            <div className="bg-white rounded-xl p-4 border border-gray-200 inline-block">
                                                                                <img src={details.signature} alt="Signature" className="h-24 object-contain" />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            );
                                                        } catch (e) {
                                                            return <p className="text-gray-900 dark:text-white font-medium whitespace-pre-wrap col-span-full">{selectedSub.propertyDetails}</p>;
                                                        }
                                                    })()}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center min-h-[400px]">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/></svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Submission Selected</h3>
                                <p className="text-gray-500 max-w-xs mt-1">Select a submission from the list on the left to review its full details and verify.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function DetailItem({ label, value }: { label: string, value: any }) {
    if (!value) return null;
    return (
        <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase">{label}</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{value}</div>
        </div>
    );
}

function FormManagementCard({ title, description, link }: { title: string, description: string, link: string }) {
    const fullLink = typeof window !== 'undefined' ? window.location.origin + link : link;
    
    return (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/10 rounded-2xl flex items-center justify-center text-primary-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                </div>
                <div className="flex gap-2">
                    <Link href={link} target="_blank" className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-primary-500 hover:text-white transition-all shadow-sm" title="Preview Form">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    </Link>
                    <button onClick={() => { navigator.clipboard.writeText(fullLink); alert('Link copied to clipboard!'); }} className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-primary-500 hover:text-white transition-all shadow-sm" title="Copy Link">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                    </button>
                </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">{description}</p>
            
            <div className="flex flex-col gap-3">
                <button 
                    onClick={() => alert('Form editor is currently in code-only mode. You can edit the form files directly in the codebase for maximum logic control.')}
                    className="w-full py-4 bg-primary-500 text-white rounded-2xl font-bold hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    Open Form Editor
                </button>
                <div className="text-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Public Link: </span>
                    <span className="text-[10px] font-bold text-primary-500 font-mono">{fullLink.replace(/^https?:\/\//, '')}</span>
                </div>
            </div>
        </div>
    );
}

export default function FormsDashboard() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>}>
            <FormsDashboardContent />
        </Suspense>
    );
}
