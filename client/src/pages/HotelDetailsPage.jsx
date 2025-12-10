import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
    MapPin, Star, Share2, Heart, ChevronRight,
    Wifi, Coffee, Car, Utensils, Check, User,
    Calendar, Info, Image as ImageIcon, ThumbsUp,
    Filter, SlidersHorizontal
} from 'lucide-react';
import { fetchHotelDetails, searchHotels } from '../services/api';

const HotelDetailsPage = () => {
    const { hotelId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [reviewFilter, setReviewFilter] = useState('highest');

    // Sticky header state
    const [isSticky, setIsSticky] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsSticky(window.scrollY > 400);

            // Scroll spy for active tab
            const sections = ['overview', 'rooms', 'facilities', 'location', 'reviews'];
            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top >= 0 && rect.top <= 300) {
                        setActiveTab(section);
                        break;
                    }
                }
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);

            try {
                // 1. Fetch Hotel Details
                const detailsResponse = await fetchHotelDetails(hotelId);
                let hotelData = null;

                if (detailsResponse && detailsResponse.HotelDetails) {
                    hotelData = detailsResponse.HotelDetails;
                    setHotel(hotelData);
                }

                // 2. Fetch Availability (Rooms)
                const payload = {
                    checkIn: searchParams.get('checkIn') || new Date().toISOString().split('T')[0],
                    checkOut: searchParams.get('checkOut') || new Date(Date.now() + 86400000).toISOString().split('T')[0],
                    hotelCodes: hotelId,
                    guestNationality: "IN",
                    noOfRooms: searchParams.get('rooms') || 1,
                    paxRooms: [
                        {
                            Adults: searchParams.get('adults') || 2,
                            Children: searchParams.get('children') || 0,
                            ChildrenAges: []
                        }
                    ]
                };

                const availability = await searchHotels(payload);
                if (availability && availability.HotelResult && availability.HotelResult.length > 0) {
                    const result = availability.HotelResult[0];
                    setRooms(result.Rooms || []);

                    // Fallback if static details failed or were missing
                    if (!hotelData) {
                        setHotel({
                            HotelName: result.HotelName,
                            Address: result.HotelAddress || result.Address,
                            StarRating: result.StarRating,
                            Images: [result.HotelPicture], // Normalize to array
                            Description: result.HotelDescription,
                            Latitude: result.Latitude,
                            Longitude: result.Longitude,
                            HotelFacilities: result.HotelFacilities || []
                        });
                    }
                } else if (!hotelData) {
                    setError("Could not load hotel details. Please try different dates.");
                }

            } catch (err) {
                console.error("Failed to load hotel data", err);
                setError("Failed to load hotel data");
            } finally {
                setLoading(false);
            }
        };

        if (hotelId) {
            loadData();
        }
    }, [hotelId, searchParams]);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 150; // Adjust for sticky header
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            setActiveTab(id);
        }
    };

    // Helper to parse images (API says String, might be array or comma-separated)
    const getImages = (hotelData) => {
        if (!hotelData) return [];
        if (Array.isArray(hotelData.Images)) return hotelData.Images;
        if (typeof hotelData.Images === 'string') {
            // Check if it's a URL or comma separated
            if (hotelData.Images.includes(',')) return hotelData.Images.split(',').map(s => s.trim());
            return [hotelData.Images];
        }
        return [];
    };

    // Helper to parse facilities
    const getFacilities = (hotelData) => {
        if (!hotelData) return [];
        if (Array.isArray(hotelData.HotelFacilities)) return hotelData.HotelFacilities;
        if (typeof hotelData.HotelFacilities === 'string') {
            if (hotelData.HotelFacilities.includes(',')) return hotelData.HotelFacilities.split(',').map(s => s.trim());
            return [hotelData.HotelFacilities];
        }
        return [];
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    if (error) return <div className="text-center py-10 text-red-600">{error}</div>;
    if (!hotel) return <div className="text-center py-10">Hotel not found</div>;

    const images = getImages(hotel);
    const facilities = getFacilities(hotel);
    const mainImage = images.length > 0 ? images[0] : "https://via.placeholder.com/800x600?text=Hotel+Image";

    return (
        <div className="bg-gray-50 min-h-screen pb-24 md:pb-10">
            {/* 1. Breadcrumb & Header */}
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center text-sm text-gray-500 mb-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/')}>Home</span>
                    <ChevronRight size={16} className="mx-2 flex-shrink-0" />
                    <span className="cursor-pointer hover:text-blue-600">{hotel.CountryName || 'India'}</span>
                    <ChevronRight size={16} className="mx-2 flex-shrink-0" />
                    <span className="cursor-pointer hover:text-blue-600">{hotel.CityName || 'City'}</span>
                    <ChevronRight size={16} className="mx-2 flex-shrink-0" />
                    <span className="text-gray-800 font-medium">{hotel.HotelName}</span>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded">Preferred</span>
                            <div className="flex text-yellow-400">
                                {[...Array(parseInt(hotel.HotelRating) || parseInt(hotel.StarRating) || 0)].map((_, i) => (
                                    <Star key={i} size={16} fill="currentColor" />
                                ))}
                            </div>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{hotel.HotelName}</h1>
                        <div className="flex items-center text-blue-600 text-sm cursor-pointer hover:underline">
                            <MapPin size={16} className="mr-1" />
                            {hotel.Address} - <span className="ml-1 font-medium">Show on map</span>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <button className="flex-1 md:flex-none justify-center flex items-center gap-2 p-2 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200">
                            <Share2 size={20} /> <span className="md:hidden">Share</span>
                        </button>
                        <button className="flex-1 md:flex-none justify-center flex items-center gap-2 p-2 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200">
                            <Heart size={20} /> <span className="md:hidden">Save</span>
                        </button>
                        <button onClick={() => scrollToSection('rooms')} className="hidden md:block bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 shadow-md">
                            Reserve
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. Image Gallery */}
            <div className="container mx-auto px-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:h-[400px] rounded-xl overflow-hidden shadow-sm">
                    {/* Main Image */}
                    <div className="md:col-span-2 h-[250px] md:h-full relative group cursor-pointer">
                        <img
                            src={mainImage}
                            alt={hotel.HotelName}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                    </div>
                    {/* Side Images */}
                    <div className="hidden md:grid grid-rows-2 gap-2 h-full">
                        <img src={images[1] || "https://via.placeholder.com/400x300?text=Room"} className="w-full h-full object-cover" alt="Room" />
                        <img src={images[2] || "https://via.placeholder.com/400x300?text=Pool"} className="w-full h-full object-cover" alt="Pool" />
                    </div>
                    <div className="hidden md:grid grid-rows-2 gap-2 h-full">
                        <img src={images[3] || "https://via.placeholder.com/400x300?text=Dining"} className="w-full h-full object-cover" alt="Dining" />
                        <div className="relative h-full">
                            <img src={images[4] || "https://via.placeholder.com/400x300?text=More"} className="w-full h-full object-cover" alt="More" />
                            {images.length > 5 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold cursor-pointer hover:bg-black/40 transition-colors">
                                    +{images.length - 5} photos
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Mobile Gallery Hint */}
                    <div className="md:hidden flex gap-2 overflow-x-auto pb-2">
                        {images.slice(0, 5).map((img, i) => (
                            <img key={i} src={img} className="h-20 w-28 object-cover rounded-lg flex-shrink-0" alt="Gallery" />
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. Sticky Nav & Content */}
            <div className={`sticky top-0 z-40 bg-white shadow-md transition-transform duration-300 ${isSticky ? 'translate-y-0' : '-translate-y-full absolute opacity-0'} hidden md:block`}>
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between py-3">
                        <div className="flex gap-6 text-sm font-medium text-gray-600">
                            {['Overview', 'Rooms', 'Facilities', 'Location', 'Reviews'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => scrollToSection(tab.toLowerCase())}
                                    className={`hover:text-blue-600 ${activeTab === tab.toLowerCase() ? 'text-blue-600 border-b-2 border-blue-600' : ''}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-4">
                            <div>
                                <span className="text-xs text-gray-500 block">Price per night as low as</span>
                                <span className="text-xl font-bold text-red-600">₹ {rooms[0]?.TotalFare ? Math.round(rooms[0].TotalFare) : 'N/A'}</span>
                            </div>
                            <button onClick={() => scrollToSection('rooms')} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">
                                Select Room
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Content Column */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Overview */}
                    <section id="overview" className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-4">Overview</h2>
                        <p className="text-gray-700 leading-relaxed mb-4 text-sm md:text-base">
                            {hotel.Description || "Experience world-class service at this property."}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            {/* Static highlights for now, or map from facilities if possible */}
                            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg text-center">
                                <Wifi className="text-blue-500 mb-2" />
                                <span className="text-xs font-medium text-gray-600">Free Wi-Fi</span>
                            </div>
                            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg text-center">
                                <Utensils className="text-blue-500 mb-2" />
                                <span className="text-xs font-medium text-gray-600">Restaurant</span>
                            </div>
                            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg text-center">
                                <Car className="text-blue-500 mb-2" />
                                <span className="text-xs font-medium text-gray-600">Parking</span>
                            </div>
                            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg text-center">
                                <Coffee className="text-blue-500 mb-2" />
                                <span className="text-xs font-medium text-gray-600">Breakfast</span>
                            </div>
                        </div>
                        {hotel.CheckInTime && (
                            <div className="mt-4 text-sm text-gray-600">
                                <span className="font-bold">Check-in:</span> {hotel.CheckInTime} | <span className="font-bold">Check-out:</span> {hotel.CheckOutTime}
                            </div>
                        )}
                    </section>

                    {/* Rooms */}
                    <section id="rooms" className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-6">Available Rooms</h2>
                        <div className="space-y-6">
                            {rooms.map((room, idx) => (
                                <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="flex flex-col md:flex-row">
                                        <div className="md:w-1/3 bg-gray-100 relative min-h-[200px]">
                                            <img src="https://via.placeholder.com/300x200?text=Room" alt="Room" className="w-full h-full object-cover absolute inset-0" />
                                        </div>
                                        <div className="md:w-2/3 p-4 flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800 mb-2">{room.Name && room.Name[0]}</h3>

                                                <div className="grid grid-cols-2 gap-2 mb-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <User size={14} /> <span>Max 2 Adults</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 border border-gray-400"></div> <span>25 m²</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Coffee size={14} /> <span>{room.MealType || "Room Only"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Wifi size={14} /> <span>Free Wi-Fi</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {room.IsRefundable && (
                                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                                                            <Check size={12} /> Free Cancellation
                                                        </span>
                                                    )}
                                                    {room.Inclusion && (
                                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-1">
                                                            <Info size={12} /> {room.Inclusion}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col md:flex-row justify-between items-end mt-4 pt-4 border-t border-gray-100">
                                                <div className="mb-2 md:mb-0">
                                                    {room.RecommendedSellingRate && (
                                                        <div className="text-xs text-gray-500 line-through">₹ {Math.round(parseFloat(room.RecommendedSellingRate) * 1.2)}</div>
                                                    )}
                                                    <div className="text-2xl font-bold text-red-600">₹ {Math.round(room.TotalFare)}</div>
                                                    <div className="text-xs text-gray-500">per night including taxes</div>
                                                </div>
                                                <button className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded font-bold hover:bg-blue-700 transition-colors">
                                                    Reserve
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {rooms.length === 0 && <div className="text-center text-gray-500 py-8">No rooms available for these dates.</div>}
                        </div>
                    </section>

                    {/* Facilities */}
                    <section id="facilities" className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-4">Facilities</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4">
                            {facilities.length > 0 ? (
                                facilities.slice(0, 15).map((facility, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                        <Check size={14} className="text-green-500 flex-shrink-0" />
                                        <span className="truncate">{facility}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-500 text-sm col-span-3">Standard facilities available.</div>
                            )}
                        </div>
                    </section>

                    {/* Reviews */}
                    <section id="reviews" className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Guest Reviews</h2>
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal size={16} className="text-gray-500" />
                                <select
                                    className="text-sm border-none bg-transparent font-medium text-gray-700 focus:ring-0 cursor-pointer"
                                    value={reviewFilter}
                                    onChange={(e) => setReviewFilter(e.target.value)}
                                >
                                    <option value="highest">Highest Rated</option>
                                    <option value="lowest">Lowest Rated</option>
                                    <option value="recent">Most Recent</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-600 text-white text-4xl font-bold p-4 rounded-lg">
                                    8.5
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-blue-900">Excellent</div>
                                    <div className="text-sm text-gray-500">Based on 1,240 reviews</div>
                                </div>
                            </div>
                            <div className="flex-1 grid grid-cols-2 gap-4">
                                {['Cleanliness', 'Location', 'Service', 'Facilities'].map(cat => (
                                    <div key={cat}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">{cat}</span>
                                            <span className="font-bold text-gray-800">8.7</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 w-[87%]"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Review Cards (Mock) */}
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                    <div className="flex justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">JD</div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-800">John Doe</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <span className="fi fi-in"></span> India
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-1 text-blue-600 font-bold text-sm">
                                                <Star size={14} fill="currentColor" /> 9.0
                                            </div>
                                            <div className="text-xs text-gray-500">Reviewed: Oct 2023</div>
                                        </div>
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-800 mb-1">"Exceptional stay!"</h4>
                                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                                        "Great stay! The location was perfect and the staff were very helpful. The room was clean and spacious. Would definitely recommend to friends and family."
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer hover:text-blue-600">
                                            <ThumbsUp size={12} /> Helpful
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>

                {/* Right Sidebar (Sticky Booking Widget) */}
                <div className="hidden lg:block">
                    <div className="sticky top-24 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                        <h3 className="font-bold text-gray-800 mb-4">Your Stay</h3>

                        <div className="space-y-3 mb-4">
                            <div className="flex gap-2">
                                <div className="flex-1 bg-gray-50 p-2 rounded border border-gray-200">
                                    <div className="text-xs text-gray-500">Check-in</div>
                                    <div className="font-medium text-sm">{searchParams.get('checkIn') || 'Today'}</div>
                                </div>
                                <div className="flex-1 bg-gray-50 p-2 rounded border border-gray-200">
                                    <div className="text-xs text-gray-500">Check-out</div>
                                    <div className="font-medium text-sm">{searchParams.get('checkOut') || 'Tomorrow'}</div>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded border border-gray-200">
                                <div className="text-xs text-gray-500">Guests</div>
                                <div className="font-medium text-sm">2 Adults, 0 Children</div>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-3 rounded mb-4">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-gray-600">Total Price</span>
                                <span className="text-xl font-bold text-blue-700">₹ {rooms[0]?.TotalFare ? Math.round(rooms[0].TotalFare) : '---'}</span>
                            </div>
                            <div className="text-xs text-gray-500 text-right">Includes taxes & fees</div>
                        </div>

                        <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md mb-3">
                            Reserve Now
                        </button>

                        <div className="text-center text-xs text-gray-500">
                            You won't be charged yet
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Sticky Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 md:hidden z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="text-xs text-gray-500">Total for 1 night</div>
                        <div className="text-xl font-bold text-red-600">₹ {rooms[0]?.TotalFare ? Math.round(rooms[0].TotalFare) : 'N/A'}</div>
                    </div>
                    <button onClick={() => scrollToSection('rooms')} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold shadow-md">
                        Reserve
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HotelDetailsPage;
