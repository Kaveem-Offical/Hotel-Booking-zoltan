import React from 'react';
import { Globe, Users, Heart, Star, Target } from 'lucide-react';

const AboutUsPage = () => {
    const stats = [
        { number: "2M+", label: "Properties Globally" },
        { number: "5M+", label: "Happy Travelers" },
        { number: "50+", label: "Countries" },
        { number: "4.9/5", label: "Average Rating" }
    ];

    return (
        <div className="bg-white dark:bg-slate-900 min-h-screen">

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
                {/* Background Decorative Elements */}
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl z-0"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl z-0"></div>

                <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-800 dark:text-white mb-6 leading-tight" style={{ animation: 'fadeInUp 0.8s ease-out both' }}>
                        Changing the way the <br />
                        <span className="bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">world travels.</span>
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-10" style={{ animation: 'fadeInUp 0.8s ease-out 0.2s both' }}>
                        Zovotel was founded on a simple premise: travel should be accessible, seamless, and memorable for everyone, everywhere.
                    </p>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-indigo-600 py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="text-center text-white">
                                <div className="text-4xl font-extrabold mb-2">{stat.number}</div>
                                <div className="text-indigo-200 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mission & Vision */}
            <div className="py-24 bg-slate-50 dark:bg-slate-800/50">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-semibold text-sm">
                                <Target className="w-4 h-4" /> Our Mission
                            </div>
                            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">To empower every traveler to explore the world with confidence.</h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                                We believe that experiencing different cultures and places is fundamental to human growth. By removing the friction from finding and booking accommodations, we allow travelers to focus on what truly matters: the journey.
                            </p>
                            <div className="flex gap-4 pt-4">
                                <div className="flex flex-col">
                                    <span className="font-extrabold text-2xl text-slate-800 dark:text-white">2020</span>
                                    <span className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Founded</span>
                                </div>
                                <div className="w-px bg-slate-300 dark:bg-slate-700"></div>
                                <div className="flex flex-col">
                                    <span className="font-extrabold text-2xl text-slate-800 dark:text-white">Global</span>
                                    <span className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Reach</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div className="bg-white dark:bg-slate-700 p-6 rounded-2xl shadow-sm hover:-translate-y-1 transition-transform">
                                    <Globe className="w-10 h-10 text-blue-500 mb-4" />
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Diversity</h3>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm">We celebrate diversity in our team and our global community of travelers.</p>
                                </div>
                                <div className="bg-white dark:bg-slate-700 p-6 rounded-2xl shadow-sm hover:-translate-y-1 transition-transform">
                                    <Star className="w-10 h-10 text-yellow-500 mb-4" />
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Excellence</h3>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm">We strive to provide nothing but the best experience for our users.</p>
                                </div>
                            </div>
                            <div className="space-y-4 mt-8">
                                <div className="bg-white dark:bg-slate-700 p-6 rounded-2xl shadow-sm hover:-translate-y-1 transition-transform">
                                    <Users className="w-10 h-10 text-indigo-500 mb-4" />
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Community</h3>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm">We build trust and connection between hosts and guests.</p>
                                </div>
                                <div className="bg-white dark:bg-slate-700 p-6 rounded-2xl shadow-sm hover:-translate-y-1 transition-transform">
                                    <Heart className="w-10 h-10 text-pink-500 mb-4" />
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Care</h3>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm">We genuinely care about making your trips memorable and secure.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
};

export default AboutUsPage;
