'use client';
import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

// ── Column auto-mapping ───────────────────────────────────────────────────────
// Maps common Google Sheets / Excel header names → our lead fields
const FIELD_ALIASES: Record<string, string> = {
    // name
    name: 'name', 'owner name': 'name', 'customer name': 'name', 'client name': 'name',
    'full name': 'name', 'contact name': 'name', 'tenant name': 'name',
    // phone
    phone: 'phone', mobile: 'phone', 'mobile number': 'phone', 'phone number': 'phone',
    contact: 'phone', 'contact number': 'phone', 'cell': 'phone', number: 'phone',
    // email
    email: 'email', 'email address': 'email', 'e-mail': 'email',
    // whatsapp
    whatsapp: 'whatsappNumber', 'whatsapp number': 'whatsappNumber', wa: 'whatsappNumber',
    // owner fields
    address: 'propertyAddress', 'property address': 'propertyAddress', location: 'propertyAddress',
    'flat no': 'propertyAddress', 'flat number': 'propertyAddress',
    'property type': 'propertyType', type: 'propertyType',
    rent: 'expectedRent', 'expected rent': 'expectedRent', 'asking rent': 'expectedRent',
    'rent amount': 'expectedRent', price: 'expectedRent',
    // tenant fields
    'looking for': 'lookingFor', requirement: 'lookingFor', 'property requirement': 'lookingFor',
    budget: 'budgetRange', 'budget range': 'budgetRange', 'rent budget': 'budgetRange',
    area: 'preferredArea', 'preferred area': 'preferredArea', locality: 'preferredArea',
    bhk: 'bhkPreference', 'bhk preference': 'bhkPreference', 'no of bhk': 'bhkPreference',
    'no. of bhk': 'bhkPreference', bedrooms: 'bhkPreference',
    // common
    message: 'message', notes: 'message', remarks: 'message', comments: 'message',
    source: 'source', 'lead source': 'source',
    status: 'status', 'lead status': 'status',
    'assigned to': 'assignedTo', assignee: 'assignedTo',
};

const OWNER_FIELDS = [
    { key: 'name', label: 'Name', required: true },
    { key: 'phone', label: 'Phone', required: true },
    { key: 'email', label: 'Email' },
    { key: 'whatsappNumber', label: 'WhatsApp' },
    { key: 'propertyAddress', label: 'Property Address' },
    { key: 'propertyType', label: 'Property Type' },
    { key: 'expectedRent', label: 'Expected Rent' },
    { key: 'message', label: 'Notes/Message' },
    { key: 'source', label: 'Source' },
    { key: 'status', label: 'Status' },
    { key: 'assignedTo', label: 'Assigned To' },
];

const TENANT_FIELDS = [
    { key: 'name', label: 'Name', required: true },
    { key: 'phone', label: 'Phone', required: true },
    { key: 'email', label: 'Email' },
    { key: 'whatsappNumber', label: 'WhatsApp' },
    { key: 'lookingFor', label: 'Looking For' },
    { key: 'budgetRange', label: 'Budget Range' },
    { key: 'preferredArea', label: 'Preferred Area' },
    { key: 'bhkPreference', label: 'BHK Preference' },
    { key: 'message', label: 'Notes/Message' },
    { key: 'source', label: 'Source' },
    { key: 'status', label: 'Status' },
    { key: 'assignedTo', label: 'Assigned To' },
];

function autoMap(headers: string[]): Record<string, string> {
    const map: Record<string, string> = {};
    for (const h of headers) {
        const normalized = h.toLowerCase().trim();
        const field = FIELD_ALIASES[normalized];
        if (field && !Object.values(map).includes(field)) {
            map[h] = field;
        }
    }
    return map;
}

interface Props {
    leadType: 'owner' | 'tenant';
    onClose: () => void;
    onImported: () => void;
}

export default function LeadsImportModal({ leadType, onClose, onImported }: Props) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [step, setStep] = useState<'upload' | 'map' | 'preview' | 'done'>('upload');
    const [headers, setHeaders] = useState<string[]>([]);
    const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
    const [columnMap, setColumnMap] = useState<Record<string, string>>({});
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
    const [fileError, setFileError] = useState('');

    const fields = leadType === 'owner' ? OWNER_FIELDS : TENANT_FIELDS;

    const handleFile = (file: File) => {
        setFileError('');
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!['csv', 'xlsx', 'xls', 'ods'].includes(ext || '')) {
            setFileError('Unsupported file type. Please upload CSV, XLSX, XLS, or ODS.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const wb = XLSX.read(data, { type: 'array' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const json: Record<string, string>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

                if (json.length === 0) { setFileError('File is empty or has no data rows.'); return; }
                if (json.length > 500) { setFileError('Too many rows. Maximum 500 per import.'); return; }

                const hdrs = Object.keys(json[0]);
                setHeaders(hdrs);
                setRawRows(json);
                setColumnMap(autoMap(hdrs));
                setStep('map');
            } catch {
                setFileError('Could not parse file. Make sure it\'s a valid CSV or Excel file.');
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    // Build mapped rows from columnMap
    const mappedRows = rawRows.map(row => {
        const mapped: Record<string, string> = {};
        for (const [col, field] of Object.entries(columnMap)) {
            if (field && row[col] !== undefined) mapped[field] = String(row[col]);
        }
        return mapped;
    }).filter(r => r.name || r.phone); // at least one key field

    const handleImport = async () => {
        setImporting(true);
        try {
            const res = await fetch('/api/admin/leads/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rows: mappedRows, leadType }),
            });
            const data = await res.json();
            if (!res.ok) { setFileError(data.error || 'Import failed'); setImporting(false); return; }
            setResult(data);
            setStep('done');
        } catch {
            setFileError('Network error during import.');
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            Import {leadType === 'owner' ? 'Owner' : 'Tenant'} Leads from Sheet
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Upload a Google Sheets export or Excel file (CSV, XLSX, XLS, ODS)</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    {['upload', 'map', 'preview', 'done'].map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === s ? 'bg-primary-500 text-white' : ['upload', 'map', 'preview', 'done'].indexOf(step) > i ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                                {['upload', 'map', 'preview', 'done'].indexOf(step) > i ? '✓' : i + 1}
                            </div>
                            <span className={`text-xs capitalize font-medium ${step === s ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`}>{s}</span>
                            {i < 3 && <div className="w-6 h-px bg-gray-300 dark:bg-gray-600" />}
                        </div>
                    ))}
                </div>

                <div className="overflow-y-auto flex-1 p-6">
                    {fileError && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-sm">{fileError}</div>
                    )}

                    {/* ── STEP 1: Upload ── */}
                    {step === 'upload' && (
                        <div>
                            <div
                                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all"
                                onDrop={handleDrop}
                                onDragOver={(e) => e.preventDefault()}
                                onClick={() => fileRef.current?.click()}
                            >
                                <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center">
                                    <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                </div>
                                <p className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">Drop your file here or click to browse</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Supports: CSV, XLSX, XLS, ODS &middot; Max 500 rows</p>
                                <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.ods" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                            </div>

                            {/* Tips */}
                            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                                <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-2">💡 How to export from Google Sheets:</p>
                                <ol className="text-xs text-blue-600 dark:text-blue-300 space-y-1 list-decimal list-inside">
                                    <li>Open your Google Sheet with leads data</li>
                                    <li>Go to <strong>File → Download → CSV (.csv)</strong> or Excel (.xlsx)</li>
                                    <li>Upload that downloaded file here</li>
                                </ol>
                                <p className="text-xs text-blue-500 dark:text-blue-400 mt-2">
                                    <strong>Recommended columns:</strong> Name, Phone, Email, {leadType === 'owner' ? 'Property Address, Property Type, Expected Rent' : 'Preferred Area, Budget Range, BHK Preference, Looking For'}, Notes, Source
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2: Map columns ── */}
                    {step === 'map' && (
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                <strong>{rawRows.length} rows</strong> detected. Map your spreadsheet columns to lead fields below. Unmatched columns will be ignored.
                            </p>

                            <div className="space-y-3 mb-6">
                                {fields.map(field => (
                                    <div key={field.key} className="flex items-center gap-3">
                                        <div className={`w-36 flex-shrink-0 text-xs font-semibold ${field.required ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {field.label} {field.required && <span className="text-red-500">*</span>}
                                        </div>
                                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                        <select
                                            value={Object.entries(columnMap).find(([, v]) => v === field.key)?.[0] || ''}
                                            onChange={e => {
                                                const newMap = { ...columnMap };
                                                // Remove any existing mapping to this field
                                                for (const k of Object.keys(newMap)) {
                                                    if (newMap[k] === field.key) delete newMap[k];
                                                }
                                                // Set new mapping
                                                if (e.target.value) newMap[e.target.value] = field.key;
                                                setColumnMap(newMap);
                                            }}
                                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="">— not mapped —</option>
                                            {headers.map(h => (
                                                <option key={h} value={h}>{h}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setStep('upload')} className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">← Back</button>
                                <button
                                    onClick={() => setStep('preview')}
                                    disabled={!Object.values(columnMap).includes('name') || !Object.values(columnMap).includes('phone')}
                                    className="flex-1 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white font-semibold rounded-xl text-sm transition-colors disabled:cursor-not-allowed"
                                >
                                    Preview Import →
                                </button>
                            </div>
                            {(!Object.values(columnMap).includes('name') || !Object.values(columnMap).includes('phone')) && (
                                <p className="text-xs text-red-500 mt-2">⚠ Name and Phone columns must be mapped to continue.</p>
                            )}
                        </div>
                    )}

                    {/* ── STEP 3: Preview ── */}
                    {step === 'preview' && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Ready to import <strong>{mappedRows.length}</strong> lead{mappedRows.length !== 1 ? 's' : ''} into <strong>{leadType} leads</strong>. Duplicates (same phone already in DB) will be skipped automatically.
                                </p>
                            </div>

                            {/* Preview table */}
                            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
                                <table className="w-full text-xs">
                                    <thead className="bg-gray-50 dark:bg-gray-900">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">#</th>
                                            <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">Name</th>
                                            <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">Phone</th>
                                            {mappedRows[0]?.email !== undefined && <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">Email</th>}
                                            {leadType === 'owner' && mappedRows[0]?.propertyAddress !== undefined && <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">Address</th>}
                                            {leadType === 'tenant' && mappedRows[0]?.preferredArea !== undefined && <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">Area</th>}
                                            {mappedRows[0]?.source !== undefined && <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">Source</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {mappedRows.slice(0, 8).map((row, i) => (
                                            <tr key={i} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750">
                                                <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                                                <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">{row.name || '—'}</td>
                                                <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{row.phone || '—'}</td>
                                                {mappedRows[0]?.email !== undefined && <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{row.email || '—'}</td>}
                                                {leadType === 'owner' && mappedRows[0]?.propertyAddress !== undefined && <td className="px-3 py-2 text-gray-600 dark:text-gray-400 max-w-[150px] truncate">{row.propertyAddress || '—'}</td>}
                                                {leadType === 'tenant' && mappedRows[0]?.preferredArea !== undefined && <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{row.preferredArea || '—'}</td>}
                                                {mappedRows[0]?.source !== undefined && <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{row.source || '—'}</td>}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {mappedRows.length > 8 && (
                                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 dark:text-gray-400 text-center border-t border-gray-200 dark:border-gray-700">
                                        … and {mappedRows.length - 8} more rows
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setStep('map')} className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">← Back</button>
                                <button
                                    onClick={handleImport}
                                    disabled={importing}
                                    className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded-xl text-sm transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {importing ? (
                                        <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Importing…</>
                                    ) : `✅ Import ${mappedRows.length} Leads`}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 4: Done ── */}
                    {step === 'done' && result && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Import Complete!</h3>

                            <div className="flex justify-center gap-6 mb-6">
                                <div className="text-center">
                                    <div className="text-3xl font-extrabold text-green-600 dark:text-green-400">{result.imported}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Leads imported</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-extrabold text-amber-500">{result.skipped}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Skipped (duplicates / invalid)</div>
                                </div>
                            </div>

                            {result.errors.length > 0 && (
                                <div className="mb-6 text-left bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                                    <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-2">Some rows had errors:</p>
                                    <ul className="text-xs text-red-600 dark:text-red-300 space-y-1">
                                        {result.errors.map((e, i) => <li key={i}>• {e}</li>)}
                                    </ul>
                                </div>
                            )}

                            <button
                                onClick={() => { onImported(); onClose(); }}
                                className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors"
                            >
                                View Leads
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
