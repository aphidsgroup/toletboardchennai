'use client';

const packages = [
    {
        id: 'exclusive', name: 'Exclusive Partner', subtitle: 'Zero Risk', price: '₹0', priceLabel: 'FREE',
        color: 'from-emerald-500 to-teal-600', borderColor: 'border-emerald-200 dark:border-emerald-800/40',
        bgAccent: 'bg-emerald-50 dark:bg-emerald-900/20', textAccent: 'text-emerald-600 dark:text-emerald-400',
        badge: '🤝 Best for Hands-Off Owners',
        bestFor: 'Owners who want zero upfront cost and a completely hands-off experience. We invest in your property marketing first — 360° shoot, listing, promotion and everything — so our commission on closure is one month rent.',
        requirement: 'Signed Exclusive Marketing Agreement (EMA) for 60–90 days',
        deliverables: [
            'Professional 360° Virtual Shoot of the property',
            'Property listing on toletboardchennai.in',
            'Social media promotion across all platforms',
            'Physical ToLetBoardChennai banner with company number on property',
            'Direct lead handling by ToLetBoardChennai team',
            'Priority support throughout the listing period',
        ],
        commission: 'One month rent from owner + Half month rent from tenant',
        deduction: null,
        ownerHighlight: 'Zero upfront cost — we do everything first. Our commission on closure is one month rent (no hidden charges).',
        isPopular: false,
    },
    {
        id: 'digital-basic', name: 'Digital Basic', subtitle: 'Smart Start', price: '₹999', priceLabel: 'One-time',
        color: 'from-blue-500 to-indigo-600', borderColor: 'border-blue-200 dark:border-blue-800/40',
        bgAccent: 'bg-blue-50 dark:bg-blue-900/20', textAccent: 'text-blue-600 dark:text-blue-400',
        badge: '📸 Most Popular for Apartments',
        bestFor: 'Owners of standard apartments who want a high-tech listing at a low entry cost without exclusivity.',
        requirement: null,
        deliverables: [
            'Professional 360° Virtual Shoot',
            'Property listing on toletboardchennai.in',
            'Detailed property description & contact-ready listing page',
            'Unique shareable link for WhatsApp groups',
            'One round of social media posting',
        ],
        commission: 'Half month rent from owner (minus ₹999) + Half month rent from tenant',
        deduction: '₹999 is an advance for operational costs — deducted from owner\'s final commission on closure',
        ownerHighlight: '₹999 upfront is NOT an extra charge — it\'s adjusted against your commission',
        isPopular: true,
    },
    {
        id: 'social-velocity', name: 'Social Velocity', subtitle: 'Reel Power', price: '₹1,999', priceLabel: 'One-time',
        color: 'from-purple-500 to-pink-600', borderColor: 'border-purple-200 dark:border-purple-800/40',
        bgAccent: 'bg-purple-50 dark:bg-purple-900/20', textAccent: 'text-purple-600 dark:text-purple-400',
        badge: '🎬 Fastest Results with Video',
        bestFor: 'Owners who want stronger content and faster response through video marketing and targeted advertising.',
        requirement: null,
        deliverables: [
            'Professional 360° Virtual Shoot',
            'Cinematic Reel / high-quality property video',
            'Edited short-form video for Instagram & Facebook',
            'Website listing with all details',
            'Social media posting across platforms',
            '1-Week Paid Meta Ads — targeted to specific Chennai locality',
        ],
        commission: 'Half month rent from owner (minus ₹1,999) + Half month rent from tenant',
        deduction: '₹1,999 is an advance for marketing costs — deducted from owner\'s final commission on closure',
        ownerHighlight: '₹1,999 upfront covers shoot + ads — fully adjusted against your commission',
        isPopular: false,
    },
    {
        id: 'elite-spotlight', name: 'Elite Spotlight', subtitle: 'Maximum Exposure', price: '₹2,999', priceLabel: 'One-time',
        color: 'from-amber-500 to-orange-600', borderColor: 'border-amber-200 dark:border-amber-800/40',
        bgAccent: 'bg-amber-50 dark:bg-amber-900/20', textAccent: 'text-amber-600 dark:text-amber-400',
        badge: '👑 Premium for High-Rent Properties',
        bestFor: 'Owners of luxury homes or high-rent properties who want maximum exposure, featured placement, and priority handling.',
        requirement: null,
        deliverables: [
            'Professional 360° Virtual Shoot + Cinematic Reel',
            'Featured property — stays at top of search results',
            '2–3 Weeks Extended Paid Ad Campaign',
            'Priority handling & repeated social media highlights',
            'Highlighted across all company platforms',
            'Premium listing badge on website',
        ],
        commission: 'Half month rent from owner (minus ₹2,999) + Half month rent from tenant',
        deduction: '₹2,999 is an advance for premium marketing — deducted from owner\'s final commission on closure',
        ownerHighlight: '₹2,999 covers everything — fully adjusted against your commission on deal closure',
        isPopular: false,
    },
];

const commonTerms = [
    'Brokerage on successful closure: For the Free Exclusive Package — one month rent from owner + half month rent from tenant. For all paid packages — half month rent from owner (with upfront fee adjusted) + half month rent from tenant.',
    'For all paid packages, the upfront amount is collected for operational cost, shoot execution, content creation, listing work, and promotion — the same amount is adjusted from the owner-side commission after closure.',
    'For the Free Exclusive Package, the owner must sign an EMA before shoot, banner placement, or promotion starts.',
    'Paid promotion includes "ad spend included up to limit" — additional ad budget beyond the limit is chargeable separately.',
    'Commission becomes payable only on successful closure through our lead, visit, negotiation, or campaign-generated enquiry.',
];

export default function OwnersContent() {
    return (
        <div className="animate-fade-in">
            {/* Package Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                {packages.map((pkg) => (
                    <div key={pkg.id} className={`relative bg-white dark:bg-gray-800 rounded-3xl shadow-lg border-2 ${pkg.isPopular ? 'border-primary-400 dark:border-primary-500' : pkg.borderColor} overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1`}>
                        {pkg.isPopular && (
                            <div className="absolute top-0 right-0 bg-gradient-to-r from-primary-500 to-accent-500 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">MOST POPULAR</div>
                        )}
                        <div className={`p-6 bg-gradient-to-r ${pkg.color} text-white`}>
                            <p className="text-xs font-medium opacity-80 mb-1">{pkg.badge}</p>
                            <h3 className="text-xl font-bold mb-0.5">{pkg.name}</h3>
                            <p className="text-sm opacity-80">{pkg.subtitle}</p>
                            <div className="mt-3 flex items-baseline gap-2">
                                <span className="text-3xl font-extrabold">{pkg.price}</span>
                                <span className="text-sm opacity-75">{pkg.priceLabel}</span>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{pkg.bestFor}</p>
                            {pkg.requirement && (
                                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl">
                                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">⚠️ Requirement</p>
                                    <p className="text-xs text-amber-600 dark:text-amber-300 mt-0.5">{pkg.requirement}</p>
                                </div>
                            )}
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">What&apos;s Included</h4>
                            <ul className="space-y-2 mb-5">
                                {pkg.deliverables.map((d, i) => (
                                    <li key={i} className="flex items-start gap-2.5">
                                        <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${pkg.textAccent}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{d}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className={`p-3 rounded-xl ${pkg.bgAccent} mb-3`}>
                                <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">💰 Commission</p>
                                <p className={`text-xs font-medium ${pkg.textAccent}`}>{pkg.commission}</p>
                            </div>
                            {pkg.deduction && (
                                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 mb-3">
                                    <p className="text-xs font-semibold text-green-800 dark:text-green-300 mb-1">✅ The Deduction Guarantee</p>
                                    <p className="text-xs text-green-700 dark:text-green-400">{pkg.deduction}</p>
                                </div>
                            )}
                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                                <p className="text-xs font-bold text-gray-900 dark:text-white">🏠 Owner Takeaway</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{pkg.ownerHighlight}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Upfront Fee Policy */}
            <div className="max-w-4xl mx-auto mb-12">
                <div className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-3xl border border-primary-200 dark:border-primary-800/40 p-8">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        Upfront Fee Policy
                    </h2>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        <strong>Free Exclusive Package:</strong> No upfront cost. We invest in your property marketing first (360° shoot, listing, social media, banner). Our commission on successful closure is one month rent from owner + half month rent from tenant.<br /><br />
                        <strong>Paid Packages (₹999 / ₹1,999 / ₹2,999):</strong> The upfront amount covers operational and marketing costs. Upon successful closure, this amount is adjusted against the owner-side half month rental commission. Tenant-side commission of half month rent remains payable separately.
                    </p>
                </div>
            </div>

            {/* Common Terms */}
            <div className="max-w-4xl mx-auto mb-12">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">Terms & Conditions</h2>
                <div className="space-y-3">
                    {commonTerms.map((term, i) => (
                        <div key={i} className="flex items-start gap-3 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                            <span className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400 flex-shrink-0">{i + 1}</span>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{term}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Trust Line */}
            <div className="max-w-3xl mx-auto text-center mb-12">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 italic leading-relaxed mb-4">
                        &ldquo;Upfront fee in paid plans is not an extra charge — it is an operational cost advance and will be adjusted in the owner-side brokerage when the deal is closed by us.&rdquo;
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Compared with many traditional brokerage models in Chennai, ToLetBoardChennai offers professional property marketing with lower success-fee pressure through a half-month commission structure on each side.
                    </p>
                </div>
            </div>

            {/* CTA */}
            <div className="text-center">
                <a href="https://wa.me/919876543210?text=Hi%2C%20I%20want%20to%20list%20my%20property%20with%20ToLetBoardChennai" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 btn-premium px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all text-lg">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                    List My Property — WhatsApp
                </a>
            </div>
        </div>
    );
}
