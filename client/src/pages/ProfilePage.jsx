import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    User,
    Heart,
    Calendar,
    Settings,
    MapPin,
    Star,
    Phone,
    Mail,
    Lock,
    Edit2,
    Check,
    X,
    AlertCircle,
    ChevronRight,
    RefreshCw
} from 'lucide-react';
import ErrorAlert from '../components/ErrorAlert';

const ProfilePage = () => {
    const navigate = useNavigate();
    const {
        currentUser,
        userData,
        likedHotels,
        bookings,
        updateUserProfile,
        changePassword,
        unlikeHotel,
        updateBookingStatus
    } = useAuth();

    // Tab state
    const [activeTab, setActiveTab] = useState('trips');

    // Edit states
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Form states
    const [phoneNumber, setPhoneNumber] = useState(userData?.phoneNumber || '');
    const [username, setUsername] = useState(userData?.username || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Loading states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Trips tab state
    const [tripsFilter, setTripsFilter] = useState('all');

    // Parse star rating helper
    const parseStars = (rating) => {
        if (!rating) return 0;
        if (typeof rating === 'number') return rating;
        if (typeof rating === 'string') {
            const lower = rating.toLowerCase();
            if (lower.includes('one')) return 1;
            if (lower.includes('two')) return 2;
            if (lower.includes('three')) return 3;
            if (lower.includes('four')) return 4;
            if (lower.includes('five')) return 5;
            const num = parseInt(rating);
            return isNaN(num) ? 0 : num;
        }
        return 0;
    };

    const handleUpdatePhone = async () => {
        if (!phoneNumber.trim()) {
            setError('Please enter a valid phone number');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await updateUserProfile({ phoneNumber });
            setSuccess('Phone number updated successfully!');
            setIsEditingPhone(false);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateName = async () => {
        if (!username.trim()) {
            setError('Please enter a valid name');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await updateUserProfile({ username });
            setSuccess('Name updated successfully!');
            setIsEditingName(false);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('Please fill in all password fields');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await changePassword(currentPassword, newPassword);
            setSuccess('Password changed successfully!');
            setIsChangingPassword(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            if (err.message.includes('wrong-password')) {
                setError('Current password is incorrect');
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveLikedHotel = async (hotelCode) => {
        try {
            await unlikeHotel(hotelCode);
        } catch (err) {
            setError('Failed to remove hotel from favorites');
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            try {
                await updateBookingStatus(bookingId, 'cancelled');
                setSuccess('Booking cancelled successfully');
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError('Failed to cancel booking');
            }
        }
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const filteredBookings = bookings.filter(booking => {
        if (tripsFilter === 'all') return true;
        return booking.status === tripsFilter;
    });

    const likedHotelsArray = Object.entries(likedHotels).map(([code, hotel]) => ({
        ...hotel,
        HotelCode: code
    }));

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <User size={64} className="mx-auto text-gray-400 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign in Required</h2>
                    <p className="text-gray-600 mb-4">Please sign in to view your profile</p>
                    <button
                        onClick={() => navigate('/signin')}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-full bg-white text-blue-600 flex items-center justify-center text-3xl font-bold shadow-lg">
                            {getInitials(userData?.username || currentUser?.email)}
                        </div>

                        {/* User Info */}
                        <div className="text-center md:text-left flex-1">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                {isEditingName ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="bg-white/20 border border-white/40 rounded px-3 py-1 text-white placeholder-white/60"
                                            placeholder="Enter name"
                                        />
                                        <button
                                            onClick={handleUpdateName}
                                            disabled={loading}
                                            className="p-1 hover:bg-white/20 rounded"
                                        >
                                            <Check size={20} />
                                        </button>
                                        <button
                                            onClick={() => setIsEditingName(false)}
                                            className="p-1 hover:bg-white/20 rounded"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <h1 className="text-2xl font-bold">
                                            {userData?.username || currentUser?.email?.split('@')[0]}
                                        </h1>
                                        <button
                                            onClick={() => setIsEditingName(true)}
                                            className="p-1 hover:bg-white/20 rounded"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    </>
                                )}
                            </div>

                            <div className="flex flex-col md:flex-row items-center gap-4 text-white/80 text-sm">
                                <div className="flex items-center gap-1">
                                    <Mail size={14} />
                                    <span>{currentUser?.email}</span>
                                </div>

                                {isEditingPhone ? (
                                    <div className="flex items-center gap-2">
                                        <Phone size={14} />
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            className="bg-white/20 border border-white/40 rounded px-2 py-0.5 text-white placeholder-white/60 text-sm"
                                            placeholder="+91-XXXXXXXXXX"
                                        />
                                        <button
                                            onClick={handleUpdatePhone}
                                            disabled={loading}
                                            className="p-0.5 hover:bg-white/20 rounded"
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            onClick={() => setIsEditingPhone(false)}
                                            className="p-0.5 hover:bg-white/20 rounded"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors"
                                        onClick={() => setIsEditingPhone(true)}
                                    >
                                        <Phone size={14} />
                                        <span>{userData?.phoneNumber || 'Add phone number'}</span>
                                        <Edit2 size={12} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-6 text-center">
                            <div>
                                <div className="text-3xl font-bold">{likedHotelsArray.length}</div>
                                <div className="text-sm text-white/80">Saved Hotels</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold">{bookings.length}</div>
                                <div className="text-sm text-white/80">Total Trips</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alerts */}
            <div className="container mx-auto px-4">
                {error && (
                    <div className="mt-4">
                        <ErrorAlert
                            message={error}
                            type="error"
                            dismissible={true}
                            onDismiss={() => setError('')}
                        />
                    </div>
                )}
                {success && (
                    <div className="mt-4">
                        <ErrorAlert
                            message={success}
                            type="success"
                            title="Success"
                            dismissible={false}
                        />
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="bg-white border-b sticky top-[70px] z-10">
                <div className="container mx-auto px-4">
                    <div className="flex gap-0">
                        <button
                            onClick={() => setActiveTab('trips')}
                            className={`px-6 py-4 font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'trips'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            <Calendar size={18} />
                            My Trips
                        </button>
                        <button
                            onClick={() => setActiveTab('saved')}
                            className={`px-6 py-4 font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'saved'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            <Heart size={18} />
                            Saved Hotels
                            {likedHotelsArray.length > 0 && (
                                <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                                    {likedHotelsArray.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`px-6 py-4 font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'settings'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            <Settings size={18} />
                            Account Settings
                        </button>
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="container mx-auto px-4 py-6">
                {/* My Trips Tab */}
                {activeTab === 'trips' && (
                    <div>
                        {/* Trips Filter */}
                        <div className="flex gap-2 mb-6">
                            {['all', 'booked', 'completed', 'cancelled'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setTripsFilter(filter)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${tripsFilter === filter
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                        }`}
                                >
                                    {filter === 'all' ? 'All Trips' :
                                        filter === 'booked' ? 'Upcoming' :
                                            filter.charAt(0).toUpperCase() + filter.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Bookings List */}
                        {filteredBookings.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                                <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">No trips found</h3>
                                <p className="text-gray-500 mb-4">
                                    {tripsFilter === 'all'
                                        ? "You haven't made any bookings yet"
                                        : `No ${tripsFilter} bookings`}
                                </p>
                                <button
                                    onClick={() => navigate('/')}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    Search Hotels
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredBookings.map((booking) => (
                                    <div
                                        key={booking.bookingId}
                                        className="bg-white rounded-lg shadow-sm p-4 flex flex-col md:flex-row gap-4"
                                    >
                                        {/* Hotel Image */}
                                        <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden bg-gray-200">
                                            <img
                                                src={booking.hotelImage || 'https://cdn6.agoda.net/images/MVC/default/background_image/illustrations/bg-agoda-homepage.png'}
                                                alt={booking.hotelName}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Booking Details */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-800">{booking.hotelName || 'Hotel Name'}</h3>
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <MapPin size={14} className="mr-1" />
                                                        {booking.hotelAddress || 'Address'}
                                                    </div>
                                                </div>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${booking.status === 'booked'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : booking.status === 'completed'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                        }`}
                                                >
                                                    {booking.status === 'booked' ? 'Upcoming' : booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                                                <div>
                                                    <div className="text-gray-500">Check-in</div>
                                                    <div className="font-semibold">{booking.checkIn || 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-500">Check-out</div>
                                                    <div className="font-semibold">{booking.checkOut || 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-500">Booking ID</div>
                                                    <div className="font-semibold">{booking.bookingId?.slice(-8) || 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-500">Total</div>
                                                    <div className="font-bold text-blue-600">₹{booking.totalAmount || 'N/A'}</div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                {booking.status === 'booked' && (
                                                    <button
                                                        onClick={() => handleCancelBooking(booking.bookingId)}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                                                    >
                                                        <X size={14} />
                                                        Cancel
                                                    </button>
                                                )}
                                                {booking.status === 'cancelled' && (
                                                    <button
                                                        onClick={() => navigate(`/hotel/${booking.hotelCode}`)}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                                                    >
                                                        <RefreshCw size={14} />
                                                        Book Again
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => navigate(`/hotel/${booking.hotelCode}`)}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    View Details
                                                    <ChevronRight size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Saved Hotels Tab */}
                {activeTab === 'saved' && (
                    <div>
                        {likedHotelsArray.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                                <Heart size={64} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">No saved hotels</h3>
                                <p className="text-gray-500 mb-4">Start saving hotels you like to easily find them later</p>
                                <button
                                    onClick={() => navigate('/')}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    Explore Hotels
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {likedHotelsArray.map((hotel) => (
                                    <div
                                        key={hotel.HotelCode}
                                        className="bg-white rounded-lg shadow-sm overflow-hidden group cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => navigate(`/hotel/${hotel.HotelCode}`)}
                                    >
                                        {/* Image */}
                                        <div className="relative h-48 bg-gray-200">
                                            <img
                                                src={hotel.HotelPicture || 'https://cdn6.agoda.net/images/MVC/default/background_image/illustrations/bg-agoda-homepage.png'}
                                                alt={hotel.HotelName}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveLikedHotel(hotel.HotelCode);
                                                }}
                                                className="absolute top-3 right-3 p-2 bg-white rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                                            >
                                                <Heart size={18} className="fill-current" />
                                            </button>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                                                {hotel.HotelName || 'Hotel Name'}
                                            </h3>

                                            <div className="flex items-center gap-1 text-yellow-500 mb-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={12}
                                                        className={i < parseStars(hotel.StarRating) ? 'fill-current' : 'text-gray-300'}
                                                    />
                                                ))}
                                            </div>

                                            <div className="flex items-center text-sm text-gray-500 mb-3">
                                                <MapPin size={14} className="mr-1 flex-shrink-0" />
                                                <span className="line-clamp-1">{hotel.HotelAddress || 'Address'}</span>
                                            </div>

                                            {hotel.TotalFare && hotel.TotalFare !== 'NA' && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xl font-bold text-gray-800">₹{hotel.TotalFare}</span>
                                                    <span className="text-xs text-gray-500">per night</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Account Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="max-w-2xl">
                        {/* Personal Information */}
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <User size={20} />
                                Personal Information
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                    <div>
                                        <div className="text-sm text-gray-500">Full Name</div>
                                        <div className="font-medium">{userData?.username || 'Not set'}</div>
                                    </div>
                                    <button
                                        onClick={() => setIsEditingName(true)}
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                        Edit
                                    </button>
                                </div>

                                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                    <div>
                                        <div className="text-sm text-gray-500">Email</div>
                                        <div className="font-medium">{currentUser?.email}</div>
                                    </div>
                                    <span className="text-gray-400 text-sm">Cannot change</span>
                                </div>

                                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                    <div>
                                        <div className="text-sm text-gray-500">Phone Number</div>
                                        <div className="font-medium">{userData?.phoneNumber || 'Not set'}</div>
                                    </div>
                                    <button
                                        onClick={() => setIsEditingPhone(true)}
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                        {userData?.phoneNumber ? 'Edit' : 'Add'}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between py-3">
                                    <div>
                                        <div className="text-sm text-gray-500">Member Since</div>
                                        <div className="font-medium">
                                            {userData?.createdAt
                                                ? new Date(userData.createdAt).toLocaleDateString('en-IN', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })
                                                : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Lock size={20} />
                                Security
                            </h3>

                            {userData?.provider === 'google' ? (
                                <div className="text-gray-500 text-sm">
                                    You signed in with Google. Password management is handled by Google.
                                </div>
                            ) : isChangingPassword ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter current password"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter new password"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleChangePassword}
                                            disabled={loading}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                                        >
                                            {loading ? 'Updating...' : 'Update Password'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsChangingPassword(false);
                                                setCurrentPassword('');
                                                setNewPassword('');
                                                setConfirmPassword('');
                                            }}
                                            className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between py-3">
                                    <div>
                                        <div className="text-sm text-gray-500">Password</div>
                                        <div className="font-medium">••••••••</div>
                                    </div>
                                    <button
                                        onClick={() => setIsChangingPassword(true)}
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                        Change Password
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
