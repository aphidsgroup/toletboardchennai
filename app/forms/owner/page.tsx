'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const PROPERTY_TYPES = [
    { id: 'apartment', label: 'Apartment' },
    { id: 'villa', label: 'Villa' },
    { id: 'independent-house', label: 'Independent House' },
    { id: 'commercial', label: 'Commercial Space' },
];

const TENANT_PREFERENCES = [
    'Any', 'Family (Veg Only)', 'Family (Veg/Non-Veg)', 'Bachelor (Female Only)', 'Bachelor (Male/Female)'
];

const COMMERCIAL_TENANT_TYPES = [
    'Any', 'Corporate Office', 'Retail/Showroom', 'Banks/ATM', 'Warehouse/Godown', 'Startup/Co-working', 'Cafe/Restaurant', 'Clinic/Diagnostic Centre'
];

export default function OwnerOnboardingForm() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        propertyAddress: '',
        propertyType: '',
        purposeOfRental: [] as string[],
        totalSqft: '',
        bhkType: '',
        parkingType: '',
        carParkingCount: '',
        monthlyRent: '',
        securityDeposit: '',
        maintenanceFee: '',
        maintenanceAmount: '',
        minimumLease: '',
        tenantPreferences: [] as string[],
        commercialTenantTypes: [] as string[],
        agreedToTerms: false,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const signatureRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleArrayItem = (name: 'purposeOfRental' | 'tenantPreferences' | 'commercialTenantTypes', value: string) => {
        setFormData(prev => {
            const current = prev[name];
            if (current.includes(value)) {
                return { ...prev, [name]: current.filter(item => item !== value) };
            }
            return { ...prev, [name]: [...current, value] };
        });
    };

    const validateStep = (currentStep: number) => {
        const newErrors: Record<string, string> = {};
        
        const isRepeated = (str: string) => /^(.)\1+$/.test(str.toLowerCase().trim());

        if (currentStep === 1) {
            if (formData.name.trim().length < 3) newErrors.name = 'Name must be at least 3 characters';
            if (isRepeated(formData.name)) newErrors.name = 'Please enter a valid name';
            
            if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Please enter a valid 10-digit WhatsApp number';
            if (isRepeated(formData.phone)) newErrors.phone = 'Please enter a valid phone number';
            
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
            
            if (formData.propertyAddress.trim().length < 15) newErrors.propertyAddress = 'Please enter a more detailed property address';
            if (isRepeated(formData.propertyAddress.replace(/\s/g, ''))) newErrors.propertyAddress = 'Please enter a valid address';
            
            if (!formData.propertyType) newErrors.propertyType = 'Please select a property type';
        }

        if (currentStep === 2) {
            if (formData.purposeOfRental.length === 0) newErrors.purposeOfRental = 'Select at least one purpose';
            if (Number(formData.totalSqft) < 100) newErrors.totalSqft = 'Invalid square footage';
            if (Number(formData.monthlyRent) < 1000) newErrors.monthlyRent = 'Monthly rent seems too low';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(step + 1);
        }
    };

    // Signature Logic
    useEffect(() => {
        const canvas = signatureRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
    }, [step]);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = signatureRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.beginPath();
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = signatureRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const clearSignature = () => {
        const canvas = signatureRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const signatureData = signatureRef.current?.toDataURL();
            const res = await fetch('/api/forms/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    formType: 'owner',
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                    propertyAddress: formData.propertyAddress,
                    propertyType: formData.propertyType,
                    propertyDetails: JSON.stringify({
                        ...formData,
                        signature: signatureData
                    }),
                }),
            });

            if (res.ok) setSubmitted(true);
        } catch (error) {
            console.error('Submission failed:', error);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 max-w-md w-full text-center animate-scale-in">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Onboarding Submitted!</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Our team will verify the details and initiate the 360° virtual tour photography.
                    </p>
                    <button onClick={() => window.location.reload()} className="w-full btn-premium py-4 rounded-2xl font-bold">Submit Another</button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6">
            <div className="max-w-xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Property Onboarding Form</h1>
                    <div className="flex gap-1 mt-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${step >= i ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-800'}`} />
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-6 sm:p-10 border border-gray-100 dark:border-gray-800">
                    
                    {/* Step 1: Owner & Property Basics */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fade-in">
                            <InputField label="Owner Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} required placeholder="Enter your full name" />
                            <InputField label="WhatsApp Number" name="phone" value={formData.phone} onChange={handleChange} error={errors.phone} required placeholder="10-digit WhatsApp number" type="tel" />
                            <InputField label="Email Address" name="email" value={formData.email} onChange={handleChange} error={errors.email} required placeholder="Enter your email" type="email" />
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Exact Property Address *</label>
                                <textarea name="propertyAddress" required value={formData.propertyAddress} onChange={handleChange} placeholder="Enter the full address including landmark" rows={3} className={`w-full px-4 py-3 rounded-xl border transition-all bg-gray-50 dark:bg-gray-800 outline-none resize-none ${errors.propertyAddress ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 dark:border-gray-700'}`} />
                                {errors.propertyAddress && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{errors.propertyAddress}</p>}
                            </div>
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Property Type *</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {PROPERTY_TYPES.map(t => (
                                        <SelectionCard key={t.id} label={t.label} active={formData.propertyType === t.label} onClick={() => setFormData(p => ({ ...p, propertyType: t.label }))} />
                                    ))}
                                </div>
                                {errors.propertyType && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{errors.propertyType}</p>}
                            </div>
                            <NavButtons step={step} onNext={handleNext} setStep={setStep} nextDisabled={!formData.name || !formData.phone || !formData.email || !formData.propertyAddress || !formData.propertyType} />
                        </div>
                    )}

                    {/* Step 2: Rental Details */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Purpose of Rental *</label>
                                <div className="flex flex-col gap-3">
                                    {['Residential Rental', 'Commercial Rental'].map(p => (
                                        <CheckboxItem key={p} label={p} checked={formData.purposeOfRental.includes(p)} onChange={() => toggleArrayItem('purposeOfRental', p)} />
                                    ))}
                                </div>
                                {errors.purposeOfRental && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{errors.purposeOfRental}</p>}
                            </div>
                            <InputField label="Total Square Feet" name="totalSqft" value={formData.totalSqft} onChange={handleChange} error={errors.totalSqft} required placeholder="Enter area in sq ft" type="number" />
                            
                            {formData.purposeOfRental.includes('Residential Rental') && (
                                <InputField label="BHK Type" name="bhkType" value={formData.bhkType} onChange={handleChange} required placeholder="e.g., 2BHK, 3BHK, or describe" />
                            )}

                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Parking Type *</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Private Parking', 'Open Parking'].map(p => (
                                        <SelectionCard key={p} label={p} active={formData.parkingType === p} onClick={() => setFormData(prev => ({ ...prev, parkingType: p }))} />
                                    ))}
                                </div>
                            </div>
                            <InputField label="Total Number of Car Parking" name="carParkingCount" value={formData.carParkingCount} onChange={handleChange} required placeholder="Enter number of cars" type="number" />
                            <InputField label="Monthly Rent" name="monthlyRent" value={formData.monthlyRent} onChange={handleChange} error={errors.monthlyRent} required placeholder="Enter monthly rent in INR" type="number" />
                            <NavButtons step={step} onNext={handleNext} setStep={setStep} nextDisabled={formData.purposeOfRental.length === 0 || !formData.totalSqft || !formData.parkingType || !formData.carParkingCount || !formData.monthlyRent} />
                        </div>
                    )}

                    {/* Step 3: Finance & Lease */}
                    {step === 3 && (
                        <div className="space-y-6 animate-fade-in">
                            <InputField label="Security Deposit / Advance" name="securityDeposit" value={formData.securityDeposit} onChange={handleChange} required placeholder="Enter security deposit in INR" type="number" />
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Maintenance Fee *</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Yes', 'No'].map(v => (
                                        <SelectionCard key={v} label={v} active={formData.maintenanceFee === v} onClick={() => setFormData(p => ({ ...p, maintenanceFee: v }))} />
                                    ))}
                                </div>
                            </div>
                            {formData.maintenanceFee === 'Yes' && (
                                <InputField label="Maintenance Amount Per Month" name="maintenanceAmount" value={formData.maintenanceAmount} onChange={handleChange} required placeholder="Enter monthly maintenance in INR" type="number" />
                            )}
                            <InputField label="Minimum Lease Period" name="minimumLease" value={formData.minimumLease} onChange={handleChange} required placeholder="Enter minimum lease in years" type="number" />
                            <NavButtons step={step} onNext={handleNext} setStep={setStep} nextDisabled={!formData.securityDeposit || !formData.maintenanceFee || (formData.maintenanceFee === 'Yes' && !formData.maintenanceAmount) || !formData.minimumLease} />
                        </div>
                    )}

                    {/* Step 4: Preferences */}
                    {step === 4 && (
                        <div className="space-y-6 animate-fade-in">
                            {!formData.purposeOfRental.includes('Commercial Rental') && (
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Tenant Preference *</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {TENANT_PREFERENCES.map(p => (
                                            <CheckboxItem key={p} label={p} checked={formData.tenantPreferences.includes(p)} onChange={() => toggleArrayItem('tenantPreferences', p)} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {formData.purposeOfRental.includes('Commercial Rental') && (
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Preferred Tenant Type *</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {COMMERCIAL_TENANT_TYPES.map(p => (
                                            <CheckboxItem key={p} label={p} checked={formData.commercialTenantTypes.includes(p)} onChange={() => toggleArrayItem('commercialTenantTypes', p)} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            <NavButtons step={step} onNext={handleNext} setStep={setStep} />
                        </div>
                    )}

                    {/* Step 5: Terms & Signature */}
                    {step === 5 && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl space-y-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs">Terms & Conditions</h4>
                                <p><span className="font-bold text-gray-800 dark:text-gray-200">Service Fee:</span> A 50% fee of one month's rent is due on 'Advance Day'.</p>
                                <p><span className="font-bold text-gray-800 dark:text-gray-200">Shoot Authorization:</span> You authorize 360° virtual tour photography of the premises.</p>
                                <p><span className="font-bold text-gray-800 dark:text-gray-200">Unique Digital Tracking:</span> All virtual tour links are tracked to immutable records of leads.</p>
                                <p><span className="font-bold text-gray-800 dark:text-gray-200">Anti-Bypass Protection:</span> Re-verification within 100 days of introduction ensures bypass penalties of 100% of service fee.</p>
                            </div>
                            <CheckboxItem label="I agree to the Terms & Conditions above" checked={formData.agreedToTerms} onChange={() => setFormData(p => ({ ...p, agreedToTerms: !p.agreedToTerms }))} />
                            
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Sign the Agreement *</label>
                                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800 overflow-hidden relative group">
                                    <canvas ref={signatureRef} width={500} height={200} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseOut={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} className="w-full h-40 cursor-crosshair touch-none" />
                                    <button type="button" onClick={clearSignature} className="absolute bottom-4 right-4 text-xs font-bold text-red-500 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">Clear</button>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 border-b border-gray-300 dark:border-gray-600 mb-8 mx-12">
                                        <span className="text-xs uppercase tracking-widest font-medium">Sign the Agreement Digitally</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button type="button" onClick={() => setStep(4)} className="flex-1 py-4 rounded-2xl font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">Back</button>
                                <button type="submit" disabled={loading || !formData.agreedToTerms} className="flex-[2] btn-premium py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                                    {loading ? 'Submitting...' : 'Submit Onboarding'}
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </main>
    );
}

function InputField({ label, error, ...props }: any) {
    return (
        <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{label} *</label>
            <div className="relative">
                <input {...props} className={`w-full px-4 py-3 rounded-xl border transition-all bg-gray-50 dark:bg-gray-800 outline-none ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500'}`} />
                {error && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{error}</p>}
            </div>
        </div>
    );
}

function SelectionCard({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
    return (
        <button type="button" onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${active ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 hover:border-primary-200'}`}>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${active ? 'border-primary-500 bg-primary-500' : 'border-gray-300'}`}>
                {active && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
            <span className={`text-sm font-semibold ${active ? 'text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400'}`}>{label}</span>
        </button>
    );
}

function CheckboxItem({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) {
    return (
        <button type="button" onClick={onChange} className="flex items-center gap-3 cursor-pointer text-left group">
            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${checked ? 'bg-primary-500 border-primary-500' : 'border-gray-200 dark:border-gray-700 group-hover:border-primary-300'}`}>
                {checked && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </div>
            <span className={`text-sm font-semibold transition-colors ${checked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{label}</span>
        </button>
    );
}

function NavButtons({ step, setStep, nextDisabled, onNext }: { step: number, setStep: (s: number) => void, nextDisabled?: boolean, onNext?: () => void }) {
    return (
        <div className="flex gap-4 pt-4">
            {step > 1 && <button type="button" onClick={() => setStep(step - 1)} className="flex-1 py-4 rounded-2xl font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 transition-all hover:bg-gray-200">Back</button>}
            <button type="button" onClick={onNext || (() => setStep(step + 1))} disabled={nextDisabled} className="flex-[2] btn-premium py-4 rounded-2xl font-bold transition-all disabled:opacity-50">Next</button>
        </div>
    );
}
