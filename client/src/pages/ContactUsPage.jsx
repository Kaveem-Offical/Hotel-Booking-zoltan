import React, { useState } from 'react';
import { MapPin, Phone, Mail, Send, Clock } from 'lucide-react';

const ContactUsPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate form submission
        console.log('Form submitted:', formData);
        alert('Thank you for your message. Our team will get back to you shortly!');
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen pt-20 pb-20">
            <div className="max-w-6xl mx-auto px-4">

                {/* Header Content */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white mb-6" style={{ animation: 'fadeInUp 0.8s ease-out both' }}>
                        Get in Touch
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                        Have a question, feedback, or need assistance with your booking? We're here to help. Reach out to us using any of the methods below.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* Contact Information Cards */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-6 h-6 text-indigo-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Our Office</h3>
                                    <p className="text-slate-500 dark:text-slate-400">123 Travel Boulevard, Suite 500<br />New Delhi, ND 110001<br />India</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 bg-pink-50 dark:bg-pink-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-6 h-6 text-pink-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Call Us</h3>
                                    <p className="text-slate-500 dark:text-slate-400">+91 1800-ZOVOTEL<br />+91 98765 43210</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-6 h-6 text-cyan-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Email Us</h3>
                                    <p className="text-slate-500 dark:text-slate-400">support@zovotel.com<br />partners@zovotel.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-6 h-6 text-orange-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Working Hours</h3>
                                    <p className="text-slate-500 dark:text-slate-400">Monday - Sunday<br />24/7 Support Available</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Send us a Message</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Your Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subject</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        placeholder="How can we help?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Message</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="5"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                                        placeholder="Provide details about your inquiry..."
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1"
                                >
                                    <Send className="w-5 h-5" />
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ContactUsPage;
