import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tenant Commission — Simple & Transparent',
    description: 'Half month rent commission for tenants — payable only on successful move-in. No upfront charges, no registration fees.',
};

export default function TenantsPage() {
    return (
        <div className="animate-fade-in">
            <div className="max-w-2xl mx-auto mb-16">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tenant Commission</h2>
                        <p className="text-gray-500 dark:text-gray-400">Simple, transparent — one-time on successful move-in</p>
                    </div>

                    <div className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-2xl p-6 text-center mb-6">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Commission on successful closure</p>
                        <p className="text-3xl font-extrabold text-gray-900 dark:text-white">Half Month Rent</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Payable only when you move into the property</p>
                    </div>

                    <div className="space-y-3 mb-8">
                        {[
                            'No upfront charges or registration fees for tenants',
                            'Browse 360° virtual tours and detailed listings for free',
                            'Commission payable only on successful closure through ToLetBoardChennai',
                            'Half-month commission structure — lower than many traditional brokerages in Chennai',
                            'Transparent process with no hidden costs',
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                            </div>
                        ))}
                    </div>

                    {/* How It Works */}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">How It Works</h3>
                    <div className="space-y-4 mb-8">
                        {[
                            { step: '1', title: 'Browse Properties', desc: 'Explore listings with immersive 360° virtual tours — completely free.' },
                            { step: '2', title: 'Schedule a Visit', desc: 'Contact us via WhatsApp or call to schedule a physical visit.' },
                            { step: '3', title: 'Finalize & Move In', desc: 'Once the deal is closed, pay half month rent as commission.' },
                        ].map((s) => (
                            <div key={s.step} className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{s.step}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{s.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                        <a href="https://wa.me/919876543210?text=Hi%2C%20I%20am%20looking%20for%20a%20rental%20property%20in%20Chennai" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                            Find a Property — WhatsApp
                        </a>
                    </div>
                </div>
            </div>

            {/* Trust */}
            <div className="max-w-2xl mx-auto text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    Compared with many traditional brokerage models in Chennai, ToLetBoardChennai offers professional property marketing with lower success-fee pressure through a half-month commission structure on each side.
                </p>
            </div>
        </div>
    );
}
