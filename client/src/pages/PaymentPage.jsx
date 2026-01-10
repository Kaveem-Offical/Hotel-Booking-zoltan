import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    MapPin, Star, Calendar, Users, CreditCard, Shield, Check,
    AlertCircle, ArrowLeft, Clock, X, Loader, Lock, ChevronRight
} from 'lucide-react';
import { createPaymentOrder, verifyPayment } from '../services/api';

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Data passed from GuestDetailsPage
    const {
        hotel,
        room,
        searchParams,
        bookingCode,
        preBookData,
        guestDetails,
        contactDetails,
        netAmount
    } = location.state || {};

    // State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [bookingResult, setBookingResult] = useState(null);
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);

    // Load Razorpay script
    useEffect(() => {
        const loadRazorpay = () => {
            return new Promise((resolve) => {
                if (window.Razorpay) {
                    resolve(true);
                    return;
                }
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => resolve(true);
                script.onerror = () => resolve(false);
                document.body.appendChild(script);
            });
        };

        loadRazorpay().then((loaded) => {
            setRazorpayLoaded(loaded);
            if (!loaded) {
                setError('Failed to load payment gateway. Please refresh the page.');
            }
        });
    }, []);

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

    // Get room name
    const getRoomName = () => {
        return preBookData?.Rooms?.[0]?.Name?.[0] || room?.Name?.[0] || 'Selected Room';
    };

    // Get currency and amount
    const getCurrency = () => preBookData?.Currency || 'INR';
    const getAmount = () => netAmount || preBookData?.Rooms?.[0]?.NetAmount || room?.TotalFare || 0;

    // Handle payment
    const handlePayment = async () => {
        if (!razorpayLoaded) {
            setError('Payment gateway not loaded. Please refresh the page.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Build hotel rooms details for TBO API
            const hotelPassengers = guestDetails.map((guest) => ({
                Title: guest.title,
                FirstName: guest.firstName.trim(),
                MiddleName: guest.middleName?.trim() || '',
                LastName: guest.lastName.trim(),
                Phoneno: guest.isLead ? contactDetails.phone : '',
                Email: guest.isLead ? contactDetails.email : '',
                PaxType: guest.type === 'adult' ? 1 : 2,
                LeadPassenger: guest.isLead,
                Age: guest.type === 'child' ? parseInt(guest.age) : null,
                PassportNo: '',
                PassportIssueDate: '0001-01-01T00:00:00',
                PassportExpDate: '0001-01-01T00:00:00',
                PAN: ''
            }));

            // Create payment order
            const orderData = {
                amount: getAmount(),
                currency: getCurrency(),
                bookingCode,
                guestNationality: contactDetails.nationality,
                hotelRoomsDetails: [{
                    HotelPassenger: hotelPassengers
                }],
                isPackageFare: preBookData?.Rooms?.[0]?.PackageFare || false,
                isPackageDetailsMandatory: preBookData?.Rooms?.[0]?.PackageDetailsMandatory || false,
                // Metadata for booking history
                hotelInfo: {
                    hotelCode: hotel?.HotelCode,
                    hotelName: hotel?.HotelName,
                    address: hotel?.Address,
                    cityName: hotel?.CityName,
                    rating: hotel?.HotelRating
                },
                roomInfo: {
                    name: getRoomName(),
                    mealType: preBookData?.Rooms?.[0]?.MealType || room?.MealType,
                    inclusion: preBookData?.Rooms?.[0]?.Inclusion || room?.Inclusion
                },
                searchParams: {
                    checkIn: searchParams?.checkIn,
                    checkOut: searchParams?.checkOut,
                    adults: searchParams?.adults,
                    children: searchParams?.children,
                    rooms: searchParams?.rooms
                },
                contactDetails
            };

            console.log('Creating payment order:', orderData);
            const orderResponse = await createPaymentOrder(orderData);
            console.log('Order created:', orderResponse);

            if (!orderResponse.success || !orderResponse.orderId) {
                throw new Error(orderResponse.message || 'Failed to create payment order');
            }

            // Configure Razorpay options
            const options = {
                key: orderResponse.keyId,
                amount: orderResponse.amount,
                currency: orderResponse.currency,
                name: 'Zovotel',
                description: `Hotel Booking - ${hotel?.HotelName || 'Hotel'}`,
                order_id: orderResponse.orderId,
                handler: async function (response) {
                    console.log('Payment successful:', response);
                    await handlePaymentSuccess(response);
                },
                prefill: {
                    name: `${contactDetails.firstName} ${contactDetails.lastName}`,
                    email: contactDetails.email,
                    contact: contactDetails.phone
                },
                notes: {
                    hotelName: hotel?.HotelName,
                    checkIn: searchParams?.checkIn,
                    checkOut: searchParams?.checkOut
                },
                theme: {
                    color: '#5391F0'
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                        console.log('Payment modal closed');
                    }
                }
            };

            // Open Razorpay checkout
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                console.error('Payment failed:', response.error);
                setError(`Payment failed: ${response.error.description}`);
                setLoading(false);
            });
            rzp.open();

        } catch (err) {
            console.error('Payment error:', err);
            setError(err.message || 'Failed to initiate payment. Please try again.');
            setLoading(false);
        }
    };

    // Handle successful payment
    const handlePaymentSuccess = async (razorpayResponse) => {
        try {
            console.log('Verifying payment...');
            const verifyResponse = await verifyPayment({
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature
            });

            console.log('Verification response:', verifyResponse);

            if (verifyResponse.success) {
                setPaymentSuccess(true);
                setBookingResult(verifyResponse);
            } else {
                setError(verifyResponse.message || 'Booking failed after payment. Please contact support.');
            }
        } catch (err) {
            console.error('Verification error:', err);
            setError(err.response?.data?.message || 'Payment verification failed. Please contact support.');
        } finally {
            setLoading(false);
        }
    };

    // Redirect if no data
    if (!hotel || !bookingCode) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">No Booking Data</h2>
                    <p className="text-gray-600 mb-4">Please complete guest details first.</p>
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

    // Success state
    if (paymentSuccess && bookingResult) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
                    <div className="text-center mb-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check size={40} className="text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
                        <p className="text-gray-600">Your hotel reservation has been successfully completed.</p>
                    </div>

                    {/* Booking Details */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Booking Status</span>
                            <span className="font-semibold text-green-600">{bookingResult.bookingStatus}</span>
                        </div>
                        {bookingResult.bookingId && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Booking ID</span>
                                <span className="font-semibold text-gray-800">{bookingResult.bookingId}</span>
                            </div>
                        )}
                        {bookingResult.bookingRefNo && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Reference No</span>
                                <span className="font-semibold text-gray-800">{bookingResult.bookingRefNo}</span>
                            </div>
                        )}
                        {bookingResult.confirmationNo && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Confirmation No</span>
                                <span className="font-semibold text-gray-800">{bookingResult.confirmationNo}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Payment ID</span>
                            <span className="font-mono text-xs text-gray-600">{bookingResult.paymentId}</span>
                        </div>
                    </div>

                    {/* Hotel Info */}
                    <div className="bg-blue-50 rounded-xl p-4 mb-6">
                        <h3 className="font-semibold text-gray-800 mb-2">{hotel?.HotelName}</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-1">
                                <MapPin size={14} />
                                {hotel?.Address || hotel?.CityName}
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                {formatDate(searchParams?.checkIn)} - {formatDate(searchParams?.checkOut)}
                            </div>
                            <div className="flex items-center gap-1">
                                <Users size={14} />
                                {guestDetails?.length || 1} Guest(s), {calculateNights()} Night(s)
                            </div>
                        </div>
                    </div>

                    {/* Warning if pending */}
                    {bookingResult.bookingStatus === 'Pending' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
                            <div className="flex items-start gap-2">
                                <Clock size={18} className="text-amber-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-amber-800">Confirmation Pending</p>
                                    <p className="text-xs text-amber-600">
                                        Your booking is being confirmed by the hotel. You'll receive a confirmation email shortly.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/profile')}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                        >
                            View My Bookings
                            <ChevronRight size={18} />
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const nights = calculateNights();
    const amount = getAmount();
    const currency = getCurrency();

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
                        Back to Guest Details
                    </button>
                    <h1 className="text-2xl font-bold">Complete Payment</h1>
                    <p className="text-white/80 text-sm mt-1">Secure checkout powered by Razorpay</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6">
                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start">
                        <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-semibold">Payment Error</p>
                            <p className="text-sm">{error}</p>
                        </div>
                        <button onClick={() => setError(null)} className="ml-2">
                            <X size={20} />
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Booking Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Hotel Card */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <MapPin size={20} className="mr-2 text-blue-600" />
                                Booking Summary
                            </h2>

                            <div className="flex gap-4">
                                {/* Hotel Image */}
                                <div className="w-32 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                    {hotel?.Images?.[0] ? (
                                        <img
                                            src={hotel.Images[0]}
                                            alt={hotel?.HotelName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                                            <MapPin size={24} className="text-blue-400" />
                                        </div>
                                    )}
                                </div>

                                {/* Hotel Info */}
                                <div className="flex-1">
                                    <div className="flex items-start gap-2 mb-1">
                                        <h3 className="font-bold text-gray-800">{hotel?.HotelName}</h3>
                                        <div className="flex text-yellow-400">
                                            {[...Array(parseInt(hotel?.HotelRating) || 0)].map((_, i) => (
                                                <Star key={i} size={14} fill="currentColor" />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-2">{hotel?.Address || hotel?.CityName}</p>
                                    <p className="text-sm font-medium text-blue-600">{getRoomName()}</p>
                                </div>
                            </div>

                            {/* Dates and Guests */}
                            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Check-in</div>
                                    <div className="font-semibold text-sm text-gray-800">
                                        {formatDate(searchParams?.checkIn)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Check-out</div>
                                    <div className="font-semibold text-sm text-gray-800">
                                        {formatDate(searchParams?.checkOut)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Duration</div>
                                    <div className="font-semibold text-sm text-gray-800">
                                        {nights} night{nights > 1 ? 's' : ''}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Guest Details */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <Users size={20} className="mr-2 text-blue-600" />
                                Guest Details
                            </h2>
                            <div className="space-y-3">
                                {guestDetails?.map((guest, index) => (
                                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                                        <div>
                                            <span className="font-medium text-gray-800">
                                                {guest.title} {guest.firstName} {guest.lastName}
                                            </span>
                                            {guest.isLead && (
                                                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                                    Lead Guest
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-sm text-gray-500 capitalize">{guest.type}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Contact Info */}
                            <div className="mt-4 pt-4 border-t">
                                <div className="text-sm text-gray-600">
                                    <span className="font-medium">Contact:</span> {contactDetails?.email} | {contactDetails?.phone}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Payment */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <CreditCard size={20} className="mr-2 text-blue-600" />
                                Payment Details
                            </h2>

                            {/* Price Breakdown */}
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Room ({nights} night{nights > 1 ? 's' : ''})</span>
                                    <span className="text-gray-800">
                                        {currency} {(amount * 0.82).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Taxes & Fees</span>
                                    <span className="text-gray-800">
                                        {currency} {(amount * 0.18).toFixed(2)}
                                    </span>
                                </div>
                                <div className="border-t pt-3 flex justify-between font-bold">
                                    <span className="text-gray-800">Total Amount</span>
                                    <span className="text-xl text-blue-600">
                                        {currency} {amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            {/* Security Notice */}
                            <div className="bg-green-50 rounded-lg p-3 mb-6">
                                <div className="flex items-center gap-2 text-green-700 text-sm">
                                    <Shield size={16} />
                                    <span className="font-medium">Secure Payment</span>
                                </div>
                                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                    <Lock size={12} />
                                    Your payment info is encrypted and secure
                                </p>
                            </div>

                            {/* Pay Button */}
                            <button
                                onClick={handlePayment}
                                disabled={loading || !razorpayLoaded}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2 ${loading || !razorpayLoaded
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <Loader size={20} className="animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Lock size={18} />
                                        Pay {currency} {amount.toLocaleString('en-IN')}
                                    </>
                                )}
                            </button>

                            {/* Payment Methods */}
                            <div className="mt-4 text-center">
                                <p className="text-xs text-gray-500 mb-2">Accepted Payment Methods</p>
                                <div className="flex justify-center gap-2">
                                    <div className="bg-gray-100 rounded px-2 py-1 text-xs font-medium text-gray-600">
                                        VISA
                                    </div>
                                    <div className="bg-gray-100 rounded px-2 py-1 text-xs font-medium text-gray-600">
                                        MasterCard
                                    </div>
                                    <div className="bg-gray-100 rounded px-2 py-1 text-xs font-medium text-gray-600">
                                        UPI
                                    </div>
                                    <div className="bg-gray-100 rounded px-2 py-1 text-xs font-medium text-gray-600">
                                        NetBanking
                                    </div>
                                </div>
                            </div>

                            {/* Hold Booking Notice */}
                            <div className="mt-4 text-center">
                                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
                                    ⚠️ Test Mode: Booking will be held, not vouchered
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
