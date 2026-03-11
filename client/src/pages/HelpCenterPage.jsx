import React from 'react';
import { Search, HelpCircle, FileText, PhoneCall, Mail, ChevronRight, MessageCircle } from 'lucide-react';
import '../styles/Auth.css'; // Leverage existing global styles or create new ones if needed

const HelpCenterPage = () => {
    const faqs = [
        { question: "How do I make a reservation?", answer: "You can make a reservation by using our search tool on the homepage..." },
        { question: "Can I cancel my booking?", answer: "Yes, cancellations are possible depending on the hotel's policy..." },
        { question: "What payment methods are accepted?", answer: "We accept all major credit cards, debit cards, and secure online payment methods." },
    ];

    const categories = [
        { icon: <FileText className="w-6 h-6 text-indigo-500" />, title: "Booking Issues", desc: "Manage your trips and reservations" },
        { icon: <HelpCircle className="w-6 h-6 text-pink-500" />, title: "Account Settings", desc: "Update your profile and preferences" },
        { icon: <PhoneCall className="w-6 h-6 text-cyan-500" />, title: "Contact Support", desc: "Get help from our support team" },
    ];

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen pb-20">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 px-4 text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-6" style={{ animation: 'fadeInUp 0.8s ease-out both' }}>
                    How can we help you today?
                </h1>
                <div className="max-w-2xl mx-auto relative group">
                    <input
                        type="text"
                        placeholder="Search for articles, questions, or topics..."
                        className="w-full px-6 py-4 rounded-full text-slate-800 text-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all"
                    />
                    <Search className="absolute right-6 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500" />
                </div>
            </div>

            {/* Categories */}
            <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {categories.map((cat, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 hover:-translate-y-2 transition-transform duration-300 cursor-pointer">
                            <div className="w-14 h-14 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6">
                                {cat.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{cat.title}</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-4">{cat.desc}</p>
                            <div className="flex items-center text-indigo-600 font-medium">
                                Browse Articles <ChevronRight className="w-4 h-4 ml-1" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQ Section */}
            <div className="max-w-4xl mx-auto px-4 py-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Frequently Asked Questions</h2>
                    <p className="text-slate-500 dark:text-slate-400">Can't find what you're looking for? Check out our most common questions.</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{faq.question}</h3>
                            <p className="text-slate-600 dark:text-slate-300">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Still Need Help */}
            <div className="max-w-4xl mx-auto px-4 mb-20">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl p-8 md:p-12 text-center border border-indigo-100 dark:border-indigo-800">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Still need help?</h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-xl mx-auto">
                        Our support team is always ready to assist you. Reach out to us via chat, email, or phone.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-medium transition-colors">
                            <MessageCircle className="w-5 h-5" /> Start Chat
                        </button>
                        <button className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 px-6 py-3 rounded-full font-medium transition-colors">
                            <Mail className="w-5 h-5" /> Email Us
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpCenterPage;
