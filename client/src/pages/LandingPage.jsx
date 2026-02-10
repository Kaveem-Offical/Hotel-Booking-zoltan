import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Calendar, Users, MapPin, Star, Shield, Clock, Headphones, ChevronDown, ArrowRight, Quote, Plane, Heart, Award, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import mumbaiImg from '../assets/mumbai.png';
import goaImg from '../assets/goa.png';
import jaipurImg from '../assets/jaipur.png';
import keralaImg from '../assets/kerala.png';
import '../styles/LandingPage.css';

// ─── Typewriter Hook ─────────────────────────────────────────
const useTypewriter = (words, typingSpeed = 100, deletingSpeed = 60, pauseDuration = 2000) => {
    const [text, setText] = useState('');
    const [wordIndex, setWordIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentWord = words[wordIndex];
        let timeout;

        if (!isDeleting && text === currentWord) {
            timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
        } else if (isDeleting && text === '') {
            setIsDeleting(false);
            setWordIndex((prev) => (prev + 1) % words.length);
        } else {
            timeout = setTimeout(() => {
                setText(
                    isDeleting
                        ? currentWord.substring(0, text.length - 1)
                        : currentWord.substring(0, text.length + 1)
                );
            }, isDeleting ? deletingSpeed : typingSpeed);
        }

        return () => clearTimeout(timeout);
    }, [text, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseDuration]);

    return text;
};

// ─── Scroll Reveal Hook ──────────────────────────────────────
const useScrollReveal = () => {
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);
};

// ─── Counter Animation Hook ─────────────────────────────────
const useCountUp = (end, duration = 2000, startOnView = true) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);

    useEffect(() => {
        if (!startOnView) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;
                    let startTime = null;
                    const animate = (timestamp) => {
                        if (!startTime) startTime = timestamp;
                        const progress = Math.min((timestamp - startTime) / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
                        setCount(Math.floor(eased * end));
                        if (progress < 1) requestAnimationFrame(animate);
                    };
                    requestAnimationFrame(animate);
                }
            },
            { threshold: 0.5 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [end, duration, startOnView]);

    return [count, ref];
};

// ─── Stars Generator ─────────────────────────────────────────
const StarField = () => {
    const stars = Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: `${1 + Math.random() * 3}px`,
        delay: `${Math.random() * 5}s`,
        duration: `${2 + Math.random() * 4}s`,
    }));

    return (
        <div className="stars-container">
            {stars.map((s) => (
                <div
                    key={s.id}
                    className="star"
                    style={{
                        left: s.left,
                        top: s.top,
                        width: s.size,
                        height: s.size,
                        animationDelay: s.delay,
                        animationDuration: s.duration,
                    }}
                />
            ))}
        </div>
    );
};

// ─── Main Component ──────────────────────────────────────────
const LandingPage = () => {
    const navigate = useNavigate();
    const { currentUser, userData, logout } = useAuth();
    const [isNavScrolled, setIsNavScrolled] = useState(false);
    const [destination, setDestination] = useState('');
    const [checkIn, setCheckIn] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    });
    const [checkOut, setCheckOut] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() + 2);
        return d.toISOString().split('T')[0];
    });
    const [guests, setGuests] = useState(2);

    useScrollReveal();

    // Navbar scroll handler
    useEffect(() => {
        const handleScroll = () => setIsNavScrolled(window.scrollY > 80);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Typewriter
    const typewriterText = useTypewriter(
        ['Your Dream Stay', 'Best Hotel Deals', 'Luxury Resorts', 'Beach Getaways', 'City Adventures'],
        90, 50, 1800
    );

    // Counters
    const [hotelCount, hotelRef] = useCountUp(200000, 2500);
    const [countryCount, countryRef] = useCountUp(50, 2000);
    const [guestCount, guestRef] = useCountUp(5, 2000);
    const [ratingCount, ratingRef] = useCountUp(49, 2000);

    // Search handler
    const handleExplore = useCallback(() => {
        navigate('/search', { state: { destination, checkIn, checkOut, guests } });
    }, [navigate, destination, checkIn, checkOut, guests]);

    // Data
    const features = [
        { icon: <Shield className="w-7 h-7 text-indigo-400" />, bg: 'bg-indigo-500/10', title: 'Best Price Guarantee', desc: 'Find a lower price? We\'ll match it and give you an extra 10% off.' },
        { icon: <Headphones className="w-7 h-7 text-pink-400" />, bg: 'bg-pink-500/10', title: '24/7 Customer Support', desc: 'Our travel experts are available around the clock to assist you.' },
        { icon: <Award className="w-7 h-7 text-cyan-400" />, bg: 'bg-cyan-500/10', title: 'Verified Properties', desc: 'Every hotel is personally verified for quality and authenticity.' },
        { icon: <Heart className="w-7 h-7 text-rose-400" />, bg: 'bg-rose-500/10', title: 'Loyalty Rewards', desc: 'Earn points on every booking and unlock exclusive member-only deals.' },
    ];

    const destinations = [
        { img: mumbaiImg, city: 'Mumbai', tag: 'City of Dreams', hotels: '12,000+' },
        { img: goaImg, city: 'Goa', tag: 'Beach Paradise', hotels: '8,500+' },
        { img: jaipurImg, city: 'Jaipur', tag: 'Pink City', hotels: '6,200+' },
        { img: keralaImg, city: 'Kerala', tag: 'God\'s Own Country', hotels: '9,800+' },
    ];

    const testimonials = [
        { name: 'Priya Sharma', role: 'Business Traveller', text: 'Zovotel made finding a hotel in Mumbai incredibly easy. The prices were unbeatable and the booking was seamless!', rating: 5 },
        { name: 'Rahul Mehra', role: 'Family Vacation', text: 'We booked our Goa vacation through Zovotel and it was the best decision. The hotel exceeded our expectations.', rating: 5 },
        { name: 'Anita Desai', role: 'Solo Explorer', text: 'The variety of options and real-time pricing helped me find perfect stays across India. Highly recommended!', rating: 5 },
    ];

    return (
        <div className="landing-page bg-[#0f0c29] text-white min-h-screen">

            {/* ══════════════ NAVBAR ══════════════ */}
            <nav className={`landing-nav ${isNavScrolled ? 'scrolled' : ''}`}>
                <Link to="/" className="flex items-center gap-2">
                    <img src={logo} alt="Zovotel" className="h-10" />
                </Link>
                <div className="flex items-center gap-6">
                    <Link to="/search" className="text-white/70 hover:text-white text-sm font-medium transition-colors hidden sm:block">
                        Hotels
                    </Link>
                    {currentUser ? (
                        <>
                            <Link to="/profile" className="text-white/70 hover:text-white text-sm font-medium transition-colors flex items-center gap-1">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                                    {(userData?.username || currentUser?.email || '?').charAt(0).toUpperCase()}
                                </div>
                                <span className="hidden sm:inline">{userData?.username || currentUser?.email?.split('@')[0]}</span>
                            </Link>
                            <button
                                onClick={async () => { try { await logout(); } catch (e) { console.error(e); } }}
                                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-semibold border border-white/20 transition-all hover:scale-105 flex items-center gap-1"
                            >
                                <LogOut size={14} />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/signin" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
                                Sign In
                            </Link>
                            <Link
                                to="/signup"
                                className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-semibold border border-white/20 transition-all hover:scale-105"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* ══════════════ HERO SECTION ══════════════ */}
            <section className="landing-hero">
                {/* Background Effects */}
                <div className="gradient-mesh" />
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="blob blob-3" />
                <StarField />

                <div className="relative z-10 w-full max-w-5xl px-4 pt-20 text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/80 mb-8 floating-badge" style={{ animationDelay: '0.3s' }}>
                        <Plane className="w-4 h-4 text-indigo-400" />
                        <span>Over 2 million properties worldwide</span>
                    </div>

                    {/* Heading */}
                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight mb-6" style={{ animation: 'fadeInUp 0.8s ease-out both' }}>
                        <span className="block text-white/90">Discover</span>
                        <span className="typewriter-container">
                            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                {typewriterText}
                            </span>
                            <span className="typewriter-cursor" />
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10" style={{ animation: 'fadeInUp 0.8s ease-out 0.4s both' }}>
                        Search from over 2,000,000 hotels, resorts, and hostels. Get the best prices guaranteed.
                    </p>

                    {/* ─── Search Bar ─── */}
                    <div className="hero-search max-w-4xl mx-auto">
                        <div className="flex flex-col md:flex-row items-stretch gap-2 p-2">
                            {/* Destination */}
                            <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl flex-1 border border-transparent hover:border-white/10 transition-all group">
                                <MapPin className="w-5 h-5 text-indigo-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                <input
                                    type="text"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    placeholder="Where are you going?"
                                    className="hero-search-input font-medium"
                                />
                            </div>

                            {/* Check-in */}
                            <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-transparent hover:border-white/10 transition-all group md:w-44">
                                <Calendar className="w-5 h-5 text-purple-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Check-in</span>
                                    <input
                                        type="date"
                                        value={checkIn}
                                        onChange={(e) => setCheckIn(e.target.value)}
                                        className="hero-search-input text-sm font-semibold"
                                    />
                                </div>
                            </div>

                            {/* Check-out */}
                            <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-transparent hover:border-white/10 transition-all group md:w-44">
                                <Calendar className="w-5 h-5 text-purple-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Check-out</span>
                                    <input
                                        type="date"
                                        value={checkOut}
                                        min={checkIn}
                                        onChange={(e) => setCheckOut(e.target.value)}
                                        className="hero-search-input text-sm font-semibold"
                                    />
                                </div>
                            </div>

                            {/* Guests */}
                            <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-transparent hover:border-white/10 transition-all group md:w-36">
                                <Users className="w-5 h-5 text-pink-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Guests</span>
                                    <select
                                        value={guests}
                                        onChange={(e) => setGuests(Number(e.target.value))}
                                        className="hero-search-input text-sm font-semibold cursor-pointer"
                                        style={{ WebkitAppearance: 'none' }}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                                            <option key={n} value={n} style={{ color: '#1e293b' }}>{n} Guest{n > 1 ? 's' : ''}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Explore Button */}
                            <button
                                onClick={handleExplore}
                                className="explore-button flex items-center justify-center gap-2 md:px-8"
                            >
                                <Search className="w-5 h-5" />
                                <span className="hidden md:inline">Explore</span>
                            </button>
                        </div>
                    </div>

                    {/* Quick Destination Tags */}
                    <div className="flex flex-wrap justify-center gap-2 mt-6" style={{ animation: 'fadeInUp 0.8s ease-out 1.2s both', paddingBottom: '100px' }}>
                        <span className="text-white/40 text-sm mr-2">Popular:</span>
                        {['Mumbai', 'Delhi', 'Goa', 'Bangalore', 'Jaipur'].map((city) => (
                            <button
                                key={city}
                                onClick={() => { setDestination(city); }}
                                className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 hover:text-white hover:border-white/20 transition-all hover:scale-105"
                            >
                                {city}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="scroll-indicator">
                    <ChevronDown className="w-6 h-6 text-white/50" />
                </div>
            </section>

            {/* ══════════════ STATS SECTION ══════════════ */}
            <section className="py-20 bg-[#0d0a24] border-y border-white/5">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="stat-item reveal" ref={hotelRef}>
                            <div className="stat-number">{hotelCount.toLocaleString()}+</div>
                            <p className="text-white/50 mt-2 text-sm font-medium">Hotels Worldwide</p>
                        </div>
                        <div className="stat-item reveal delay-100" ref={countryRef}>
                            <div className="stat-number">{countryCount}+</div>
                            <p className="text-white/50 mt-2 text-sm font-medium">Countries</p>
                        </div>
                        <div className="stat-item reveal delay-200" ref={guestRef}>
                            <div className="stat-number">{guestCount}M+</div>
                            <p className="text-white/50 mt-2 text-sm font-medium">Happy Guests</p>
                        </div>
                        <div className="stat-item reveal delay-300" ref={ratingRef}>
                            <div className="stat-number">{(ratingCount / 10).toFixed(1)}</div>
                            <p className="text-white/50 mt-2 text-sm font-medium">Average Rating</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════ FEATURES SECTION ══════════════ */}
            <section className="py-24 bg-[#0f0c29]">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 reveal">Why Choose <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">Zovotel</span></h2>
                        <div className="section-separator reveal delay-100" />
                        <p className="text-white/50 max-w-xl mx-auto reveal delay-200">
                            We're committed to making your travel experience exceptional from booking to checkout.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, i) => (
                            <div key={i} className={`feature-card reveal delay-${(i + 1) * 100}`}>
                                <div className={`feature-icon ${feature.bg}`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                                <p className="text-white/50 text-sm leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════ POPULAR DESTINATIONS ══════════════ */}
            <section className="py-24 bg-[#0d0a24]">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 reveal">
                            Popular <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">Destinations</span>
                        </h2>
                        <div className="section-separator reveal delay-100" />
                        <p className="text-white/50 max-w-xl mx-auto reveal delay-200">
                            Explore the most sought-after destinations across India.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {destinations.map((dest, i) => (
                            <div
                                key={dest.city}
                                className={`destination-card h-80 reveal-scale delay-${(i + 1) * 100}`}
                                onClick={() => navigate('/search', { state: { destination: dest.city, checkIn, checkOut, guests } })}
                            >
                                <img src={dest.img} alt={dest.city} loading="lazy" />
                                <div className="destination-overlay">
                                    <div className="flex items-center gap-1 mb-1">
                                        <MapPin className="w-4 h-4 text-indigo-400" />
                                        <span className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">{dest.tag}</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">{dest.city}</h3>
                                    <p className="text-white/60 text-sm mt-1">{dest.hotels} properties</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════ TESTIMONIALS ══════════════ */}
            <section className="py-24 bg-[#0f0c29]">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 reveal">What Our <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">Guests Say</span></h2>
                        <div className="section-separator reveal delay-100" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((t, i) => (
                            <div key={i} className={`testimonial-card reveal delay-${(i + 1) * 100}`}>
                                <Quote className="w-8 h-8 text-indigo-500/30 mb-4" />
                                <p className="text-white/70 text-sm leading-relaxed mb-6">"{t.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                                        {t.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-sm">{t.name}</p>
                                        <p className="text-white/40 text-xs">{t.role}</p>
                                    </div>
                                    <div className="ml-auto flex gap-0.5">
                                        {Array.from({ length: t.rating }, (_, j) => (
                                            <Star key={j} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════ CTA SECTION ══════════════ */}
            <section className="cta-section py-24">
                <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 reveal">
                        Ready to Start Your Journey?
                    </h2>
                    <p className="text-white/80 text-lg max-w-xl mx-auto mb-10 reveal delay-100">
                        Join millions of happy travellers and find your perfect stay today.
                    </p>
                    <button
                        onClick={() => navigate('/search')}
                        className="cta-button reveal delay-200"
                    >
                        <Search className="w-5 h-5" />
                        <span>Explore Hotels</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </section>

            {/* ══════════════ FOOTER ══════════════ */}
            <footer className="landing-footer py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                        <div>
                            <img src={logo} alt="Zovotel" className="h-10 mb-4" />
                            <p className="text-white/40 text-sm leading-relaxed">
                                Your trusted companion for finding the perfect hotel stay, anywhere in the world.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
                            <ul className="space-y-2">
                                {['About Us', 'Careers', 'Press', 'Blog'].map((item) => (
                                    <li key={item}><span className="text-white/40 hover:text-white text-sm cursor-pointer transition-colors">{item}</span></li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Support</h4>
                            <ul className="space-y-2">
                                {['Help Center', 'Safety', 'Cancellation', 'Contact Us'].map((item) => (
                                    <li key={item}><span className="text-white/40 hover:text-white text-sm cursor-pointer transition-colors">{item}</span></li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Discover</h4>
                            <ul className="space-y-2">
                                {['Mumbai Hotels', 'Goa Hotels', 'Delhi Hotels', 'Jaipur Hotels'].map((item) => (
                                    <li key={item}><span className="text-white/40 hover:text-white text-sm cursor-pointer transition-colors">{item}</span></li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-white/30 text-sm">© 2026 Zovotel. All rights reserved.</p>
                        <div className="flex gap-6">
                            {['Privacy', 'Terms', 'Cookies'].map((item) => (
                                <span key={item} className="text-white/30 hover:text-white/60 text-sm cursor-pointer transition-colors">{item}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
