import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    MapPin, Star, Calendar, Users, User, Mail, Phone, Globe,
    CreditCard, Shield, AlertCircle, Check, ChevronRight, Clock,
    X, Info, ArrowLeft, Coffee, Wifi, Car, Utensils, Tv, Wind,
    Bath, Sparkles, Tag, FileText, AlertTriangle
} from 'lucide-react';
import { preBookHotel, bookHotel } from '../services/api';

// Country codes for nationality dropdown
const COUNTRY_CODES = [
    { code: 'IN', name: 'India' },
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'SG', name: 'Singapore' },
    { code: 'AU', name: 'Australia' },
    { code: 'CA', name: 'Canada' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'JP', name: 'Japan' }
];

const TITLES = ['Mr', 'Mrs', 'Miss', 'Ms'];

const GuestDetailsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Data passed from HotelDetailsPage
    const {
        hotel,
        room,
        searchParams,
        bookingCode: initialBookingCode
    } = location.state || {};

    // State
    const [loading, setLoading] = useState(true);
    const [preBookLoading, setPreBookLoading] = useState(true);
    const [preBookData, setPreBookData] = useState(null);
    const [bookingCode, setBookingCode] = useState(initialBookingCode);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingResponse, setBookingResponse] = useState(null);
    const [validationInfo, setValidationInfo] = useState(null);
    const [showAllAmenities, setShowAllAmenities] = useState(false);
    const [showRateConditions, setShowRateConditions] = useState(false);

    // Form state
    const [contactDetails, setContactDetails] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        nationality: 'IN'
    });

    const [guestDetails, setGuestDetails] = useState([]);
    const [specialRequests, setSpecialRequests] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);

    // Validation state
    const [errors, setErrors] = useState({});

    // Calculate number of guests needed
    const adultsCount = searchParams?.adults || 2;
    const childrenCount = searchParams?.children || 0;
    const totalGuests = adultsCount + childrenCount;

    // Initialize guest details
    useEffect(() => {
        const guests = [];
        for (let i = 0; i < adultsCount; i++) {
            guests.push({
                type: 'adult',
                title: 'Mr',
                firstName: '',
                middleName: '',
                lastName: '',
                age: null,
                isLead: i === 0
            });
        }
        for (let i = 0; i < childrenCount; i++) {
            guests.push({
                type: 'child',
                title: 'Mr',
                firstName: '',
                middleName: '',
                lastName: '',
                age: 5,
                isLead: false
            });
        }
        setGuestDetails(guests);
    }, [adultsCount, childrenCount]);

    // Call PreBook API on mount
    useEffect(() => {
        const fetchPreBookData = async () => {
            if (!initialBookingCode) {
                setError('No booking code provided. Please go back and select a room.');
                setPreBookLoading(false);
                setLoading(false);
                return;
            }

            try {
                setPreBookLoading(true);
                const response = await preBookHotel(initialBookingCode);
                console.log('PreBook response:', response);

                if (response && response.HotelResult && response.HotelResult.length > 0) {
                    const hotelResult = response.HotelResult[0];
                    setPreBookData(hotelResult);

                    // Update booking code if changed
                    if (hotelResult.Rooms && hotelResult.Rooms[0]?.BookingCode) {
                        setBookingCode(hotelResult.Rooms[0].BookingCode);
                    }

                    // Store validation info for form validation
                    if (response.ValidationInfo) {
                        setValidationInfo(response.ValidationInfo);
                    }
                } else {
                    setError('Invalid prebook response. Please try again.');
                }
            } catch (err) {
                console.error('PreBook error:', err);
                setError(err.response?.data?.message || 'Failed to validate room availability. Please try again.');
            } finally {
                setPreBookLoading(false);
                setLoading(false);
            }
        };

        fetchPreBookData();
    }, [initialBookingCode]);

    // Get validation limits from API response
    const getNameMinLength = () => validationInfo?.PaxNameMinLength || 1;
    const getNameMaxLength = () => validationInfo?.PaxNameMaxLength || 50;
    const isSpecialCharAllowed = () => validationInfo?.SpecialCharAllowed || false;

    // Validate form
    const validateForm = () => {
        const newErrors = {};
        const minLen = getNameMinLength();
        const maxLen = getNameMaxLength();

        // Contact details validation
        if (!contactDetails.firstName.trim()) {
            newErrors.contactFirstName = 'First name is required';
        } else if (contactDetails.firstName.length < minLen) {
            newErrors.contactFirstName = `First name must be at least ${minLen} characters`;
        } else if (contactDetails.firstName.length > maxLen) {
            newErrors.contactFirstName = `First name must be at most ${maxLen} characters`;
        } else if (!isSpecialCharAllowed() && /[^a-zA-Z\s]/.test(contactDetails.firstName)) {
            newErrors.contactFirstName = 'Special characters are not allowed';
        }

        if (!contactDetails.lastName.trim()) {
            newErrors.contactLastName = 'Last name is required';
        } else if (contactDetails.lastName.length < minLen) {
            newErrors.contactLastName = `Last name must be at least ${minLen} characters`;
        } else if (contactDetails.lastName.length > maxLen) {
            newErrors.contactLastName = `Last name must be at most ${maxLen} characters`;
        } else if (!isSpecialCharAllowed() && /[^a-zA-Z\s]/.test(contactDetails.lastName)) {
            newErrors.contactLastName = 'Special characters are not allowed';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!contactDetails.email.trim()) {
            newErrors.contactEmail = 'Email is required';
        } else if (!emailRegex.test(contactDetails.email)) {
            newErrors.contactEmail = 'Invalid email format';
        }

        const phoneRegex = /^[0-9]{10,15}$/;
        if (!contactDetails.phone.trim()) {
            newErrors.contactPhone = 'Phone number is required';
        } else if (!phoneRegex.test(contactDetails.phone.replace(/\s+/g, ''))) {
            newErrors.contactPhone = 'Invalid phone number (10-15 digits)';
        }

        // Guest details validation
        guestDetails.forEach((guest, index) => {
            if (!guest.firstName.trim()) {
                newErrors[`guest${index}FirstName`] = 'First name is required';
            } else if (guest.firstName.length < minLen) {
                newErrors[`guest${index}FirstName`] = `First name must be at least ${minLen} characters`;
            } else if (guest.firstName.length > maxLen) {
                newErrors[`guest${index}FirstName`] = `First name must be at most ${maxLen} characters`;
            } else if (!isSpecialCharAllowed() && /[^a-zA-Z\s]/.test(guest.firstName)) {
                newErrors[`guest${index}FirstName`] = 'Special characters are not allowed';
            }

            if (!guest.lastName.trim()) {
                newErrors[`guest${index}LastName`] = 'Last name is required';
            } else if (guest.lastName.length < minLen) {
                newErrors[`guest${index}LastName`] = `Last name must be at least ${minLen} characters`;
            } else if (guest.lastName.length > maxLen) {
                newErrors[`guest${index}LastName`] = `Last name must be at most ${maxLen} characters`;
            } else if (!isSpecialCharAllowed() && /[^a-zA-Z\s]/.test(guest.lastName)) {
                newErrors[`guest${index}LastName`] = 'Special characters are not allowed';
            }

            if (guest.type === 'child' && (!guest.age || guest.age < 0 || guest.age > 12)) {
                newErrors[`guest${index}Age`] = 'Valid child age (0-12) is required';
            }
        });

        // Terms acceptance
        if (!acceptTerms) {
            newErrors.terms = 'You must accept the terms and conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission - Navigate to payment page
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);

        try {
            // Navigate to payment page with all collected data
            navigate('/payment', {
                state: {
                    hotel,
                    room,
                    searchParams,
                    bookingCode,
                    preBookData,
                    guestDetails,
                    contactDetails,
                    netAmount: preBookData?.Rooms?.[0]?.NetAmount || room?.TotalFare
                }
            });
        } catch (err) {
            console.error('Navigation error:', err);
            setError('Failed to proceed to payment. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Update guest detail
    const updateGuest = (index, field, value) => {
        const updated = [...guestDetails];
        updated[index] = { ...updated[index], [field]: value };
        setGuestDetails(updated);

        // Clear error
        setErrors(prev => ({ ...prev, [`guest${index}${field.charAt(0).toUpperCase() + field.slice(1)}`]: null }));
    };

    // Copy contact details to lead guest
    const copyContactToLead = () => {
        if (guestDetails.length > 0) {
            const updated = [...guestDetails];
            updated[0] = {
                ...updated[0],
                firstName: contactDetails.firstName,
                lastName: contactDetails.lastName
            };
            setGuestDetails(updated);
        }
    };

    // Format date for display
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    };

    // Calculate nights
    const calculateNights = () => {
        if (!searchParams?.checkIn || !searchParams?.checkOut) return 1;
        const checkIn = new Date(searchParams.checkIn);
        const checkOut = new Date(searchParams.checkOut);
        return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    };

    // Get pricing details with full breakdown
    const getPricing = () => {
        const roomData = preBookData?.Rooms?.[0] || room;
        const priceBreakUp = roomData?.PriceBreakUp?.[0] || {};
        const dayRates = roomData?.DayRates?.[0] || [];

        return {
            basePrice: dayRates[0]?.BasePrice || priceBreakUp?.RoomRate || roomData?.TotalFare - (roomData?.TotalTax || 0) || 0,
            totalTax: roomData?.TotalTax || priceBreakUp?.RoomTax || 0,
            totalFare: roomData?.TotalFare || 0,
            netAmount: roomData?.NetAmount || roomData?.TotalFare || 0,
            netTax: roomData?.NetTax || 0,
            currency: preBookData?.Currency || 'INR',
            isRefundable: roomData?.IsRefundable ?? true,
            agentCommission: priceBreakUp?.AgentCommission || 0,
            roomRate: priceBreakUp?.RoomRate || 0,
            roomTax: priceBreakUp?.RoomTax || 0,
            taxBreakup: priceBreakUp?.TaxBreakup || [],
            dayRates: dayRates
        };
    };

    // Get room details
    const getRoomDetails = () => {
        const roomData = preBookData?.Rooms?.[0] || room || {};
        return {
            name: roomData?.Name?.[0] || room?.Name?.[0] || 'Selected Room',
            inclusion: roomData?.Inclusion || room?.Inclusion || '',
            mealType: roomData?.MealType || room?.MealType || 'Room_Only',
            amenities: roomData?.Amenities || [],
            beddingGroup: roomData?.BeddingGroup || '',
            roomPromotion: roomData?.RoomPromotion || [],
            lastCancellationDeadline: roomData?.LastCancellationDeadline || '',
            withTransfers: roomData?.WithTransfers || false
        };
    };

    // Parse rate conditions
    const getRateConditions = () => {
        const conditions = preBookData?.RateConditions || [];
        const parsed = {
            checkInTimeBegin: '',
            checkInTimeEnd: '',
            checkOutTime: '',
            checkInInstructions: '',
            specialInstructions: '',
            minimumCheckInAge: '',
            optionalFees: '',
            cardsAccepted: '',
            otherPolicies: []
        };

        conditions.forEach(condition => {
            const trimmed = condition.trim();
            if (trimmed.startsWith('CheckIn Time-Begin:')) {
                parsed.checkInTimeBegin = trimmed.replace('CheckIn Time-Begin:', '').trim();
            } else if (trimmed.startsWith('CheckIn Time-End:')) {
                parsed.checkInTimeEnd = trimmed.replace('CheckIn Time-End:', '').trim();
            } else if (trimmed.startsWith('CheckOut Time:')) {
                parsed.checkOutTime = trimmed.replace('CheckOut Time:', '').trim();
            } else if (trimmed.startsWith('CheckIn Instructions:')) {
                parsed.checkInInstructions = trimmed.replace('CheckIn Instructions:', '').trim();
            } else if (trimmed.startsWith('Special Instructions')) {
                parsed.specialInstructions = trimmed.replace(/Special Instructions\s*:?/, '').trim();
            } else if (trimmed.startsWith('Minimum CheckIn Age')) {
                parsed.minimumCheckInAge = trimmed.replace(/Minimum CheckIn Age\s*:?/, '').trim();
            } else if (trimmed.startsWith('Optional Fees:')) {
                parsed.optionalFees = trimmed.replace('Optional Fees:', '').trim();
            } else if (trimmed.startsWith('Cards Accepted:')) {
                parsed.cardsAccepted = trimmed.replace('Cards Accepted:', '').trim();
            } else {
                parsed.otherPolicies.push(trimmed);
            }
        });

        return parsed;
    };

    // Strip HTML entities and tags
    const stripHtml = (html) => {
        if (!html) return '';
        const decoded = html
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"');
        const tmp = document.createElement('DIV');
        tmp.innerHTML = decoded;
        return tmp.textContent || tmp.innerText || '';
    };

    // Get amenity icon
    const getAmenityIcon = (amenity) => {
        const lower = amenity.toLowerCase();
        if (lower.includes('wifi')) return <Wifi size={14} className="text-blue-500" />;
        if (lower.includes('parking')) return <Car size={14} className="text-blue-500" />;
        if (lower.includes('tv') || lower.includes('television')) return <Tv size={14} className="text-blue-500" />;
        if (lower.includes('air') || lower.includes('conditioning')) return <Wind size={14} className="text-blue-500" />;
        if (lower.includes('bath') || lower.includes('shower')) return <Bath size={14} className="text-blue-500" />;
        if (lower.includes('breakfast') || lower.includes('dining')) return <Utensils size={14} className="text-blue-500" />;
        if (lower.includes('room service')) return <Coffee size={14} className="text-blue-500" />;
        if (lower.includes('housekeeping') || lower.includes('clean')) return <Sparkles size={14} className="text-blue-500" />;
        return <Check size={14} className="text-blue-500" />;
    };

    // Get cancellation policies
    const getCancelPolicies = () => {
        const roomData = preBookData?.Rooms?.[0] || {};
        return roomData.CancelPolicies || [];
    };

    // Redirect if no data
    if (!hotel && !loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">No Booking Data</h2>
                    <p className="text-gray-600 mb-4">Please select a room from the hotel details page.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Loading state
    if (loading || preBookLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Validating room availability...</p>
                </div>
            </div>
        );
    }

    // Success state
    if (bookingSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check size={40} className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
                    <p className="text-gray-600 mb-6">Your reservation has been successfully completed.</p>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                        <h3 className="font-semibold text-gray-800 mb-2">{hotel?.HotelName}</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p><span className="font-medium">Check-in:</span> {formatDate(searchParams?.checkIn)}</p>
                            <p><span className="font-medium">Check-out:</span> {formatDate(searchParams?.checkOut)}</p>
                            <p><span className="font-medium">Guests:</span> {totalGuests} guest(s)</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const pricing = getPricing();
    const cancelPolicies = getCancelPolicies();
    const nights = calculateNights();
    const roomDetails = getRoomDetails();
    const rateConditions = getRateConditions();

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-6">
                <div className="container mx-auto px-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-white/80 hover:text-white mb-4 transition"
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        Back to Hotel
                    </button>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl font-bold">{hotel?.HotelName}</h1>
                        <div className="flex text-yellow-400">
                            {[...Array(parseInt(hotel?.HotelRating) || 0)].map((_, i) => (
                                <Star key={i} size={16} fill="currentColor" />
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center text-white/80 text-sm">
                        <MapPin size={14} className="mr-1" />
                        {hotel?.Address || hotel?.CityName}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6">
                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start">
                        <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold">Error</p>
                            <p className="text-sm">{error}</p>
                        </div>
                        <button onClick={() => setError(null)} className="ml-auto">
                            <X size={20} />
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Booking Summary */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <Calendar size={20} className="mr-2 text-blue-600" />
                                Your Booking
                            </h2>

                            {/* Check-in/out with actual times from API */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="text-xs text-gray-500 mb-1">Check-in</div>
                                    <div className="font-semibold text-gray-800">{formatDate(searchParams?.checkIn)}</div>
                                    <div className="text-xs text-gray-500">
                                        {rateConditions.checkInTimeBegin ? `From ${rateConditions.checkInTimeBegin}` : 'From 14:00'}
                                        {rateConditions.checkInTimeEnd && ` - ${rateConditions.checkInTimeEnd}`}
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="text-xs text-gray-500 mb-1">Check-out</div>
                                    <div className="font-semibold text-gray-800">{formatDate(searchParams?.checkOut)}</div>
                                    <div className="text-xs text-gray-500">
                                        {rateConditions.checkOutTime ? `Until ${rateConditions.checkOutTime}` : 'Until 12:00'}
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="text-xs text-gray-500 mb-1">Duration</div>
                                    <div className="font-semibold text-gray-800">{nights} night{nights > 1 ? 's' : ''}</div>
                                    <div className="text-xs text-gray-500">{totalGuests} guest{totalGuests > 1 ? 's' : ''}</div>
                                </div>
                            </div>

                            {/* Room Details Section */}
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex items-start gap-3 mb-3">
                                    <Coffee size={18} className="text-blue-600 mt-0.5" />
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-800">{roomDetails.name}</div>
                                        <div className="text-sm text-gray-600">{roomDetails.mealType.replace(/_/g, ' ')}</div>
                                    </div>
                                </div>

                                {/* Room Promotions */}
                                {roomDetails.roomPromotion.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {roomDetails.roomPromotion.map((promo, idx) => (
                                            <span key={idx} className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                <Tag size={12} />
                                                {promo}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Inclusion */}
                                {roomDetails.inclusion && (
                                    <div className="text-sm text-gray-700 mb-2">
                                        <span className="font-medium">Includes:</span> {roomDetails.inclusion}
                                    </div>
                                )}

                                {/* Bedding Info */}
                                {roomDetails.beddingGroup && (
                                    <div className="text-xs text-gray-500 italic mb-3">
                                        <Info size={12} className="inline mr-1" />
                                        {roomDetails.beddingGroup}
                                    </div>
                                )}

                                {/* Last Cancellation Deadline */}
                                {roomDetails.lastCancellationDeadline && (
                                    <div className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded inline-flex items-center gap-1">
                                        <Clock size={12} />
                                        Free cancellation until: {roomDetails.lastCancellationDeadline}
                                    </div>
                                )}
                            </div>

                            {/* Room Amenities */}
                            {roomDetails.amenities.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Room Amenities</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {(showAllAmenities ? roomDetails.amenities : roomDetails.amenities.slice(0, 9)).map((amenity, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded">
                                                {getAmenityIcon(amenity)}
                                                <span className="truncate">{amenity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {roomDetails.amenities.length > 9 && (
                                        <button
                                            onClick={() => setShowAllAmenities(!showAllAmenities)}
                                            className="text-xs text-blue-600 hover:text-blue-700 mt-2 font-medium"
                                        >
                                            {showAllAmenities ? 'Show less' : `+${roomDetails.amenities.length - 9} more amenities`}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Rate Conditions Toggle */}
                            {(rateConditions.checkInInstructions || rateConditions.optionalFees || rateConditions.otherPolicies.length > 0) && (
                                <div className="mt-4 border-t pt-4">
                                    <button
                                        onClick={() => setShowRateConditions(!showRateConditions)}
                                        className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600"
                                    >
                                        <FileText size={16} />
                                        Important Information
                                        <ChevronRight size={16} className={`transform transition ${showRateConditions ? 'rotate-90' : ''}`} />
                                    </button>

                                    {showRateConditions && (
                                        <div className="mt-3 space-y-3 text-sm text-gray-600">
                                            {/* Minimum Age */}
                                            {rateConditions.minimumCheckInAge && (
                                                <div className="flex items-start gap-2">
                                                    <User size={14} className="mt-0.5 text-gray-400" />
                                                    <span>Minimum check-in age: <strong>{rateConditions.minimumCheckInAge} years</strong></span>
                                                </div>
                                            )}

                                            {/* Cards Accepted */}
                                            {rateConditions.cardsAccepted && (
                                                <div className="flex items-start gap-2">
                                                    <CreditCard size={14} className="mt-0.5 text-gray-400" />
                                                    <span>Accepted payment: {rateConditions.cardsAccepted}</span>
                                                </div>
                                            )}

                                            {/* Check-in Instructions */}
                                            {rateConditions.checkInInstructions && (
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <div className="font-medium text-gray-700 mb-1">Check-in Instructions</div>
                                                    <div className="text-xs text-gray-600">
                                                        {stripHtml(rateConditions.checkInInstructions)}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Special Instructions */}
                                            {rateConditions.specialInstructions && (
                                                <div className="bg-blue-50 p-3 rounded-lg">
                                                    <div className="font-medium text-blue-700 mb-1">Special Instructions</div>
                                                    <div className="text-xs text-gray-600">
                                                        {stripHtml(rateConditions.specialInstructions)}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Optional Fees */}
                                            {rateConditions.optionalFees && (
                                                <div className="bg-amber-50 p-3 rounded-lg">
                                                    <div className="font-medium text-amber-700 mb-1 flex items-center gap-1">
                                                        <AlertTriangle size={14} />
                                                        Optional Fees (Not Included)
                                                    </div>
                                                    <div className="text-xs text-gray-600">
                                                        {stripHtml(rateConditions.optionalFees)}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Other Policies */}
                                            {rateConditions.otherPolicies.length > 0 && (
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <div className="font-medium text-gray-700 mb-1">Other Policies</div>
                                                    <ul className="text-xs text-gray-600 space-y-1">
                                                        {rateConditions.otherPolicies.slice(0, 5).map((policy, idx) => (
                                                            <li key={idx} className="flex items-start gap-2">
                                                                <Check size={12} className="mt-0.5 text-green-500 flex-shrink-0" />
                                                                <span>{stripHtml(policy)}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Contact Details */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <Mail size={20} className="mr-2 text-blue-600" />
                                Contact Details
                            </h2>
                            <p className="text-sm text-gray-600 mb-4">
                                Booking confirmation will be sent to this email address.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={contactDetails.firstName}
                                        onChange={(e) => {
                                            setContactDetails(prev => ({ ...prev, firstName: e.target.value }));
                                            setErrors(prev => ({ ...prev, contactFirstName: null }));
                                        }}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${errors.contactFirstName ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Enter first name"
                                    />
                                    {errors.contactFirstName && (
                                        <p className="text-red-500 text-xs mt-1">{errors.contactFirstName}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={contactDetails.lastName}
                                        onChange={(e) => {
                                            setContactDetails(prev => ({ ...prev, lastName: e.target.value }));
                                            setErrors(prev => ({ ...prev, contactLastName: null }));
                                        }}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${errors.contactLastName ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Enter last name"
                                    />
                                    {errors.contactLastName && (
                                        <p className="text-red-500 text-xs mt-1">{errors.contactLastName}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={contactDetails.email}
                                        onChange={(e) => {
                                            setContactDetails(prev => ({ ...prev, email: e.target.value }));
                                            setErrors(prev => ({ ...prev, contactEmail: null }));
                                        }}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${errors.contactEmail ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="email@example.com"
                                    />
                                    {errors.contactEmail && (
                                        <p className="text-red-500 text-xs mt-1">{errors.contactEmail}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={contactDetails.phone}
                                        onChange={(e) => {
                                            setContactDetails(prev => ({ ...prev, phone: e.target.value }));
                                            setErrors(prev => ({ ...prev, contactPhone: null }));
                                        }}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${errors.contactPhone ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Enter phone number"
                                    />
                                    {errors.contactPhone && (
                                        <p className="text-red-500 text-xs mt-1">{errors.contactPhone}</p>
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nationality <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Globe size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <select
                                            value={contactDetails.nationality}
                                            onChange={(e) => setContactDetails(prev => ({ ...prev, nationality: e.target.value }))}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition appearance-none bg-white"
                                        >
                                            {COUNTRY_CODES.map(country => (
                                                <option key={country.code} value={country.code}>
                                                    {country.name} ({country.code})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Guest Details */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                    <Users size={20} className="mr-2 text-blue-600" />
                                    Guest Details
                                </h2>
                                <button
                                    type="button"
                                    onClick={copyContactToLead}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Copy from contact
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Enter names exactly as they appear on government-issued ID.
                            </p>

                            <div className="space-y-6">
                                {guestDetails.map((guest, index) => (
                                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2 mb-4">
                                            <User size={16} className="text-blue-600" />
                                            <span className="font-semibold text-gray-800">
                                                {guest.type === 'adult' ? `Adult ${index + 1}` : `Child ${index - adultsCount + 1}`}
                                            </span>
                                            {guest.isLead && (
                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                                    Lead Guest
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                                                <select
                                                    value={guest.title}
                                                    onChange={(e) => updateGuest(index, 'title', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                >
                                                    {TITLES.map(title => (
                                                        <option key={title} value={title}>{title}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                    First Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={guest.firstName}
                                                    onChange={(e) => updateGuest(index, 'firstName', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${errors[`guest${index}FirstName`] ? 'border-red-500' : 'border-gray-300'}`}
                                                    placeholder="First name"
                                                />
                                                {errors[`guest${index}FirstName`] && (
                                                    <p className="text-red-500 text-xs mt-1">{errors[`guest${index}FirstName`]}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Middle Name</label>
                                                <input
                                                    type="text"
                                                    value={guest.middleName}
                                                    onChange={(e) => updateGuest(index, 'middleName', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                    placeholder="Middle name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                    Last Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={guest.lastName}
                                                    onChange={(e) => updateGuest(index, 'lastName', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${errors[`guest${index}LastName`] ? 'border-red-500' : 'border-gray-300'}`}
                                                    placeholder="Last name"
                                                />
                                                {errors[`guest${index}LastName`] && (
                                                    <p className="text-red-500 text-xs mt-1">{errors[`guest${index}LastName`]}</p>
                                                )}
                                            </div>
                                            {guest.type === 'child' && (
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                                        Age <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="12"
                                                        value={guest.age || ''}
                                                        onChange={(e) => updateGuest(index, 'age', e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${errors[`guest${index}Age`] ? 'border-red-500' : 'border-gray-300'}`}
                                                        placeholder="Age"
                                                    />
                                                    {errors[`guest${index}Age`] && (
                                                        <p className="text-red-500 text-xs mt-1">{errors[`guest${index}Age`]}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Special Requests */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <Info size={20} className="mr-2 text-blue-600" />
                                Special Requests
                            </h2>
                            <p className="text-sm text-gray-600 mb-4">
                                Special requests are subject to availability and cannot be guaranteed.
                            </p>
                            <textarea
                                value={specialRequests}
                                onChange={(e) => setSpecialRequests(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                                placeholder="E.g., early check-in, high floor, quiet room..."
                            />
                        </div>

                        {/* Terms & Conditions */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={acceptTerms}
                                    onChange={(e) => {
                                        setAcceptTerms(e.target.checked);
                                        setErrors(prev => ({ ...prev, terms: null }));
                                    }}
                                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">
                                    I have read and agree to the <a href="#" className="text-blue-600 hover:underline">Terms and Conditions</a>,{' '}
                                    <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>, and{' '}
                                    <a href="#" className="text-blue-600 hover:underline">Cancellation Policy</a>.
                                </span>
                            </label>
                            {errors.terms && (
                                <p className="text-red-500 text-xs mt-2">{errors.terms}</p>
                            )}
                        </div>

                        {/* Mobile Submit Button */}
                        <div className="lg:hidden">
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Confirm Booking
                                        <ChevronRight size={20} className="ml-2" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Right Column - Price Summary (Sticky) */}
                    <div className="hidden lg:block">
                        <div className="sticky top-24 space-y-4">
                            {/* Price Summary Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
                                    <h3 className="font-bold">Price Summary</h3>
                                    <div className="text-xs text-white/80">{pricing.currency}</div>
                                </div>
                                <div className="p-4 space-y-3">
                                    {/* Day Rates Breakdown */}
                                    {pricing.dayRates.length > 0 && (
                                        <div className="space-y-1">
                                            {pricing.dayRates.map((day, idx) => (
                                                <div key={idx} className="flex justify-between text-xs text-gray-500">
                                                    <span>Night {idx + 1}</span>
                                                    <span>₹ {Math.round(day.BasePrice).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Room Rate ({nights} night{nights > 1 ? 's' : ''})</span>
                                        <span className="font-medium">₹ {Math.round(pricing.basePrice).toLocaleString()}</span>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Taxes & Fees</span>
                                        <span className="font-medium">₹ {Math.round(pricing.totalTax).toLocaleString()}</span>
                                    </div>

                                    {/* Tax Breakdown if available */}
                                    {pricing.taxBreakup.length > 0 && (
                                        <div className="pl-4 space-y-1 border-l-2 border-gray-200">
                                            {pricing.taxBreakup.map((tax, idx) => (
                                                <div key={idx} className="flex justify-between text-xs text-gray-500">
                                                    <span>{tax.TaxType.replace(/_/g, ' ')} ({tax.TaxPercentage}%)</span>
                                                    <span>₹ {Math.round(tax.TaxAmount).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="border-t pt-3 flex justify-between">
                                        <span className="font-bold text-gray-800">Total Amount</span>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-blue-600">
                                                ₹ {Math.round(pricing.netAmount).toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-500">Inclusive of all taxes</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Refund Status */}
                            <div className={`p-4 rounded-xl border ${pricing.isRefundable ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                                <div className="flex items-center gap-2">
                                    <Shield size={18} className={pricing.isRefundable ? 'text-green-600' : 'text-amber-600'} />
                                    <span className={`font-semibold ${pricing.isRefundable ? 'text-green-700' : 'text-amber-700'}`}>
                                        {pricing.isRefundable ? 'Free Cancellation Available' : 'Non-Refundable Rate'}
                                    </span>
                                </div>
                                {cancelPolicies.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {cancelPolicies.map((policy, idx) => (
                                            <div key={idx} className="bg-white/60 p-2 rounded text-xs">
                                                <div className="flex items-center gap-1 text-gray-700">
                                                    <Clock size={12} />
                                                    <span>From: {policy.FromDate}</span>
                                                </div>
                                                <div className="mt-1 text-gray-600">
                                                    Cancellation Charge: {' '}
                                                    <span className="font-semibold text-red-600">
                                                        {policy.ChargeType === 'Percentage'
                                                            ? `${policy.CancellationCharge}% of total`
                                                            : `₹ ${policy.CancellationCharge}`
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Secure Booking Badge */}
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <Shield size={16} className="text-green-600" />
                                <span className="text-xs text-gray-600">Your payment information is secure</span>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Confirm Booking
                                        <ChevronRight size={20} className="ml-2" />
                                    </>
                                )}
                            </button>

                            {/* Support Info */}
                            <div className="text-center text-xs text-gray-500">
                                <p>Need help? Call us at <span className="font-medium">1800-XXX-XXXX</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sticky Footer */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-xs text-gray-500">Total Amount</div>
                        <div className="text-xl font-bold text-blue-600">₹ {Math.round(pricing.netAmount).toLocaleString()}</div>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-70"
                    >
                        {submitting ? 'Processing...' : 'Proceed to Payment'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GuestDetailsPage;
