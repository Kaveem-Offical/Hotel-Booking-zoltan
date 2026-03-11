import React from 'react';
import { Shield, Lock, Eye, CheckCircle, AlertOctagon } from 'lucide-react';

const SafetyPage = () => {
    const safetyFeatures = [
        {
            icon: <CheckCircle className="w-8 h-8 text-green-500" />,
            title: "Verified Properties",
            description: "Every host and property on Zovotel goes through a stringent background verification process before they can list with us. We check identities, property ownership, and uphold high quality standards."
        },
        {
            icon: <Lock className="w-8 h-8 text-blue-500" />,
            title: "Secure Payments",
            description: "We use state-of-the-art encryption combined with top-tier payment gateways to process your payments. Your financial information is never shared with the host or stored on our servers."
        },
        {
            icon: <AlertOctagon className="w-8 h-8 text-red-500" />,
            title: "24/7 Emergency Support",
            description: "If you ever feel unsafe or encounter an emergency during your stay, our dedicated trust and safety team is available around the clock. We have direct lines to local authorities worldwide."
        },
        {
            icon: <Eye className="w-8 h-8 text-purple-500" />,
            title: "Authentic Reviews",
            description: "Reviews can only be left by guests who have actually stayed at the property. We read and verify reviews to ensure transparency, so what you see is what you get."
        }
    ];

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen pt-20 pb-20">
            <div className="max-w-5xl mx-auto px-4">

                {/* Header Content */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-6">
                        <Shield className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white mb-6" style={{ animation: 'fadeInUp 0.8s ease-out both' }}>
                        Trust & Safety
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                        Your safety is our top priority. We've built security into every step of your journey so you can focus on creating great memories.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {safetyFeatures.map((feature, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                            <div className="mb-6">{feature.icon}</div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">{feature.title}</h3>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>

                {/* Safety Guidelines */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 md:p-12 rounded-3xl border border-indigo-100 dark:border-indigo-800">
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-6 text-center">Traveler Safety Guidelines</h2>

                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-indigo-200 dark:bg-indigo-700 font-bold flex items-center justify-center text-indigo-800 dark:text-white flex-shrink-0">1</div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Communicate mostly on platform</h4>
                                <p className="text-slate-600 dark:text-slate-300">Always try to use Zovotel's messaging system for interacting with hosts to keep a record of your conversations.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-indigo-200 dark:bg-indigo-700 font-bold flex items-center justify-center text-indigo-800 dark:text-white flex-shrink-0">2</div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Do your research</h4>
                                <p className="text-slate-600 dark:text-slate-300">Read reviews, check the map for the neighborhood, and familiarize yourself with the specific property rules before booking.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-indigo-200 dark:bg-indigo-700 font-bold flex items-center justify-center text-indigo-800 dark:text-white flex-shrink-0">3</div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Never pay outside the app</h4>
                                <p className="text-slate-600 dark:text-slate-300">If a host asks you to pay off-site (e.g., via wire transfer or cash), decline and report them immediately. You lose your protection if you transact off-platform.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SafetyPage;
