import React from 'react';
import { AlertTriangle, Clock, CreditCard, RefreshCcw, ShieldCheck } from 'lucide-react';

const CancellationPage = () => {
    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen pt-20 pb-20">
            <div className="max-w-4xl mx-auto px-4">

                {/* Header Content */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-6" style={{ animation: 'pulse 2s infinite' }}>
                        <AlertTriangle className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white mb-6" style={{ animation: 'fadeInUp 0.8s ease-out both' }}>
                        Cancellation Policies
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                        We understand that plans change. Here is everything you need to know about modifying or canceling your reservations on Zovotel.
                    </p>
                </div>

                {/* Content Blocks */}
                <div className="space-y-8">

                    {/* Section 1 */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Free Cancellation Timeline</h2>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                            Most stays on Zovotel offer free cancellation up to 48 hours before check-in. The specific cancellation window depends on the property and the rate type you selected.
                        </p>
                        <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 ml-4">
                            <li><strong>Standard Rate:</strong> Free cancellation until 48 hours prior to check-in.</li>
                            <li><strong>Non-Refundable Rate:</strong> Cancellations will incur a 100% penalty. Modifying the dates may also not be permitted.</li>
                            <li><strong>Flexible Rate:</strong> Free cancellation up to 24 hours or even until the day of check-in, as specified by the hotel.</li>
                        </ul>
                    </div>

                    {/* Section 2 */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                                <RefreshCcw className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Refund Process</h2>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                            When a booking is successfully canceled within the free cancellation period, your refund is automatically processed.
                        </p>
                        <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 ml-4">
                            <li>Refunds are credited back to the original method of payment.</li>
                            <li>Processing time generally takes <strong>5-7 business days</strong> depending on your bank or credit card provider.</li>
                            <li>If you paid using Zovotel Wallet or Points, the refund will be instantaneous.</li>
                        </ul>
                    </div>

                    {/* Section 3 */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
                                <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Late Cancellations & No-Shows</h2>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            Cancellations made after the free cancellation window has passed, or failing to check-in (a "no-show"), will typically result in a charge equal to the first night's stay, including taxes and fees. Some properties may charge the full amount of the reservation. Always refer to the explicit policy listed on your booking confirmation.
                        </p>
                    </div>

                    {/* Section 4 */}
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center flex-shrink-0">
                                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Extenuating Circumstances</h2>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            If you need to cancel due to an unexpected emergency, major weather event, or government-mandated travel restriction, our Extenuating Circumstances Policy may apply. In such verified cases, you may be eligible for a refund or travel credit regardless of the hotel's standard policy. Contact our support team for assistance.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CancellationPage;
