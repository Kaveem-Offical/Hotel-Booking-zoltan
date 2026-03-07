const config = require('../config/config');
const { database } = require('../config/firebaseAdmin');
const authService = require('../services/authService');
const axios = require('axios');

/**
 * Get Agency Balance from TBO SharedData API
 */
exports.getAgencyBalance = async (req, res) => {
    try {
        console.log('\n=== GetAgencyBalance Request ===');

        // Get fresh token and member info
        const tokenId = await authService.getTokenId();
        let memberInfo = authService.getMemberInfo();

        if (!memberInfo) {
            await authService.authenticate();
            memberInfo = authService.getMemberInfo();
            if (!memberInfo) {
                return res.status(500).json({
                    error: 'Failed to get member info',
                    message: 'Could not retrieve agency details from TBO'
                });
            }
        }

        const endUserIp = process.env.TBO_END_USER_IP || '192.168.11.120';

        const requestBody = {
            ClientId: config.tboApi.clientId,
            TokenAgencyId: String(memberInfo.AgencyId),
            TokenMemberId: String(memberInfo.MemberId),
            EndUserIp: endUserIp,
            TokenId: tokenId
        };

        console.log('Balance Request Body:', JSON.stringify(requestBody, null, 2));

        const response = await axios.post(
            config.tboApi.getAgencyBalanceUrl,
            requestBody,
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );

        const data = response.data;
        console.log('Balance Response:', JSON.stringify(data, null, 2));

        if (data.Status !== 1) {
            return res.status(400).json({
                error: 'Failed to get agency balance',
                message: data.Error?.ErrorMessage || 'Unknown error',
                status: data.Status
            });
        }

        res.json({
            success: true,
            agencyType: data.AgencyType,
            cashBalance: data.CashBalance,
            creditBalance: data.CreditBalance,
            agencyTypeName: data.AgencyType === 1 ? 'Cash' : data.AgencyType === 2 ? 'Credit' : 'Not Set'
        });

    } catch (error) {
        console.error('GetAgencyBalance Error:', error.message);
        if (error.response) {
            console.error('API Error:', JSON.stringify(error.response.data, null, 2));
        }
        res.status(500).json({
            error: 'Failed to fetch agency balance',
            message: error.message
        });
    }
};

/**
 * Collect ALL bookings from every possible location in Firebase:
 *  1. bookings/history/{orderId}
 *  2. bookings/pending/{orderId}
 *  3. users/{uid}/bookings/{bookingId}
 * Deduplicates where possible using orderId / bookingCode
 */
async function collectAllBookings() {
    const historyRef = database.ref('bookings/history');
    const pendingRef = database.ref('bookings/pending');
    const usersRef = database.ref('users');

    const [historySnap, pendingSnap, usersSnap] = await Promise.all([
        historyRef.once('value'),
        pendingRef.once('value'),
        usersRef.once('value')
    ]);

    const historyBookings = historySnap.val() || {};
    const pendingBookings = pendingSnap.val() || {};
    const usersData = usersSnap.val() || {};

    // Track seen IDs to avoid duplicates
    const seen = new Set();
    const allBookings = [];

    // Add from bookings/history
    Object.entries(historyBookings).forEach(([id, b]) => {
        seen.add(id);
        if (b.bookingCode) seen.add(b.bookingCode);
        allBookings.push({ ...b, _id: id, _source: 'history' });
    });

    // Add from bookings/pending
    Object.entries(pendingBookings).forEach(([id, b]) => {
        if (!seen.has(id)) {
            seen.add(id);
            if (b.bookingCode) seen.add(b.bookingCode);
            allBookings.push({ ...b, _id: id, _source: 'pending' });
        }
    });

    // Add from users/{uid}/bookings
    Object.entries(usersData).forEach(([uid, userData]) => {
        if (userData.bookings) {
            Object.entries(userData.bookings).forEach(([bookingId, b]) => {
                // Try to deduplicate by order id or booking code
                const orderId = b.orderId || b.razorpayOrderId;
                const bCode = b.bookingCode;
                if (orderId && seen.has(orderId)) return;
                if (bCode && seen.has(bCode)) return;
                if (seen.has(bookingId)) return;

                seen.add(bookingId);
                if (orderId) seen.add(orderId);
                if (bCode) seen.add(bCode);

                allBookings.push({
                    ...b,
                    _id: bookingId,
                    _source: 'user',
                    _userId: uid,
                    _userEmail: userData.email,
                    _userName: userData.username,
                    // Normalize fields
                    contactDetails: b.contactDetails || {
                        email: userData.email,
                        firstName: userData.username
                    },
                    status: b.status || 'booked',
                    completedAt: b.completedAt || b.createdAt
                });
            });
        }
    });

    return allBookings;
}

/**
 * Get Dashboard Stats - Aggregates booking data from ALL Firebase locations
 */
exports.getDashboardStats = async (req, res) => {
    try {
        console.log('\n=== GetDashboardStats Request ===');

        const allBookings = await collectAllBookings();

        // Basic counts
        const totalBookings = allBookings.length;
        const confirmedBookings = allBookings.filter(b =>
            b.status === 'confirmed' || b.status === 'booked'
        ).length;
        const failedBookings = allBookings.filter(b => b.status === 'failed').length;
        const pendingCount = allBookings.filter(b =>
            b.status === 'pending' || b._source === 'pending'
        ).length;
        const cancelledBookings = allBookings.filter(b =>
            b.status === 'cancelled' ||
            b.tboResponse?.hotelBookingStatus === 'Cancelled' ||
            b.tboResponse?.hotelBookingStatus === 'CancellationPending'
        ).length;

        // Revenue calculations
        const revenueBookings = allBookings.filter(b =>
            b.status === 'confirmed' || b.status === 'booked'
        );
        const totalRevenue = revenueBookings.reduce((sum, b) => {
            const amt = parseFloat(b.amount) || parseFloat(b.totalAmount) || parseFloat(b.price) || 0;
            return sum + amt;
        }, 0);

        const avgBookingValue = revenueBookings.length > 0 ? totalRevenue / revenueBookings.length : 0;

        // Cancellation rate
        const cancellationRate = totalBookings > 0
            ? ((cancelledBookings / totalBookings) * 100).toFixed(1)
            : 0;

        // Monthly breakdown (last 6 months)
        const now = new Date();
        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
            const monthName = monthDate.toLocaleString('en-US', { month: 'short' });
            const year = monthDate.getFullYear();

            const monthBookings = allBookings.filter(b => {
                const bDate = new Date(b.completedAt || b.createdAt);
                return bDate >= monthDate && bDate <= monthEnd;
            });

            const monthConfirmed = monthBookings.filter(b =>
                b.status === 'confirmed' || b.status === 'booked'
            ).length;
            const monthCancelled = monthBookings.filter(b =>
                b.status === 'cancelled' ||
                b.tboResponse?.hotelBookingStatus === 'Cancelled'
            ).length;
            const monthRevenue = monthBookings
                .filter(b => b.status === 'confirmed' || b.status === 'booked')
                .reduce((sum, b) => sum + (parseFloat(b.amount) || parseFloat(b.totalAmount) || 0), 0);

            monthlyData.push({
                month: `${monthName} ${year}`,
                shortMonth: monthName,
                total: monthBookings.length,
                confirmed: monthConfirmed,
                cancelled: monthCancelled,
                revenue: Math.round(monthRevenue)
            });
        }

        // Daily trend (last 30 days)
        const dailyData = [];
        for (let i = 29; i >= 0; i--) {
            const dayDate = new Date(now);
            dayDate.setDate(dayDate.getDate() - i);
            dayDate.setHours(0, 0, 0, 0);
            const dayEnd = new Date(dayDate);
            dayEnd.setHours(23, 59, 59, 999);

            const dayBookings = allBookings.filter(b => {
                const bDate = new Date(b.completedAt || b.createdAt);
                return bDate >= dayDate && bDate <= dayEnd;
            });

            dailyData.push({
                date: dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                bookings: dayBookings.length,
                confirmed: dayBookings.filter(b => b.status === 'confirmed' || b.status === 'booked').length,
                revenue: dayBookings
                    .filter(b => b.status === 'confirmed' || b.status === 'booked')
                    .reduce((sum, b) => sum + (parseFloat(b.amount) || parseFloat(b.totalAmount) || 0), 0)
            });
        }

        // Top destinations
        const destinationMap = {};
        revenueBookings.forEach(b => {
            const hotelName = b.hotelInfo?.hotelName || b.hotelInfo?.HotelName ||
                b.hotelName || b.HotelName || 'Unknown Hotel';
            const city = b.hotelInfo?.cityName || b.searchParams?.cityName ||
                b.cityName || 'Unknown';
            const key = hotelName;
            if (!destinationMap[key]) {
                destinationMap[key] = { name: hotelName, city, count: 0, revenue: 0 };
            }
            destinationMap[key].count++;
            destinationMap[key].revenue += parseFloat(b.amount) || parseFloat(b.totalAmount) || 0;
        });
        const topDestinations = Object.values(destinationMap)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Room nights calculation
        let totalRoomNights = 0;
        let totalStayDuration = 0;
        let stayCount = 0;
        revenueBookings.forEach(b => {
            const checkIn = b.searchParams?.checkIn || b.searchParams?.CheckIn || b.checkIn;
            const checkOut = b.searchParams?.checkOut || b.searchParams?.CheckOut || b.checkOut;
            if (checkIn && checkOut) {
                const inDate = new Date(checkIn);
                const outDate = new Date(checkOut);
                const nights = Math.max(1, Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24)));
                const rooms = b.searchParams?.noOfRooms || b.searchParams?.NoOfRooms || b.noOfRooms || 1;
                totalRoomNights += nights * rooms;
                totalStayDuration += nights;
                stayCount++;
            }
        });
        const avgStayDuration = stayCount > 0 ? (totalStayDuration / stayCount).toFixed(1) : 0;

        res.json({
            success: true,
            stats: {
                totalBookings,
                confirmedBookings,
                failedBookings,
                pendingBookings: pendingCount,
                cancelledBookings,
                totalRevenue: Math.round(totalRevenue),
                avgBookingValue: Math.round(avgBookingValue),
                cancellationRate: parseFloat(cancellationRate),
                totalRoomNights,
                avgStayDuration: parseFloat(avgStayDuration),
                monthlyData,
                dailyData,
                topDestinations
            }
        });

    } catch (error) {
        console.error('GetDashboardStats Error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch dashboard stats',
            message: error.message
        });
    }
};

/**
 * Get All Bookings for admin management — merges all sources
 */
exports.getAllBookings = async (req, res) => {
    try {
        const { status, email, dateFrom, dateTo, search } = req.query;

        console.log('\n=== GetAllBookings (Admin) ===');

        let allBookings = await collectAllBookings();

        // Apply filters
        if (status) {
            allBookings = allBookings.filter(b => b.status === status);
        }

        if (email) {
            allBookings = allBookings.filter(b =>
                (b.contactDetails?.email?.toLowerCase() || '').includes(email.toLowerCase()) ||
                (b._userEmail?.toLowerCase() || '').includes(email.toLowerCase())
            );
        }

        if (dateFrom) {
            const from = new Date(dateFrom);
            allBookings = allBookings.filter(b => {
                const bDate = new Date(b.completedAt || b.createdAt);
                return bDate >= from;
            });
        }

        if (dateTo) {
            const to = new Date(dateTo);
            to.setHours(23, 59, 59, 999);
            allBookings = allBookings.filter(b => {
                const bDate = new Date(b.completedAt || b.createdAt);
                return bDate <= to;
            });
        }

        if (search) {
            const term = search.toLowerCase();
            allBookings = allBookings.filter(b =>
                (b.hotelInfo?.hotelName?.toLowerCase() || '').includes(term) ||
                (b.hotelInfo?.HotelName?.toLowerCase() || '').includes(term) ||
                (b.hotelName?.toLowerCase() || '').includes(term) ||
                (b.contactDetails?.email?.toLowerCase() || '').includes(term) ||
                (b.contactDetails?.firstName?.toLowerCase() || '').includes(term) ||
                (b.contactDetails?.lastName?.toLowerCase() || '').includes(term) ||
                (b._userEmail?.toLowerCase() || '').includes(term) ||
                (b._userName?.toLowerCase() || '').includes(term) ||
                (b._id?.toLowerCase() || '').includes(term) ||
                String(b.tboResponse?.bookingId || '').includes(term)
            );
        }

        // Sort by date (newest first)
        allBookings.sort((a, b) =>
            new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt)
        );

        res.json({
            success: true,
            count: allBookings.length,
            bookings: allBookings
        });

    } catch (error) {
        console.error('GetAllBookings Error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch bookings',
            message: error.message
        });
    }
};

/**
 * Get full user details including their bookings, liked hotels, etc.
 */
exports.getUserDetails = async (req, res) => {
    try {
        const { uid } = req.params;
        console.log(`\n=== GetUserDetails: ${uid} ===`);

        // Get user data
        const userRef = database.ref(`users/${uid}`);
        const userSnap = await userRef.once('value');
        const userData = userSnap.val();

        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get user's bookings from users/{uid}/bookings
        const userBookings = userData.bookings
            ? Object.entries(userData.bookings).map(([id, b]) => ({ ...b, _id: id }))
            : [];

        // Also find this user's bookings in bookings/history (by email)
        const historyRef = database.ref('bookings/history');
        const historySnap = await historyRef.once('value');
        const allHistory = historySnap.val() || {};

        const historyBookings = Object.entries(allHistory)
            .filter(([id, b]) =>
                b.contactDetails?.email?.toLowerCase() === userData.email?.toLowerCase()
            )
            .map(([id, b]) => ({ ...b, _id: id, _source: 'history' }));

        // Merge and deduplicate
        const seenIds = new Set(userBookings.map(b => b._id));
        const mergedBookings = [...userBookings];
        historyBookings.forEach(b => {
            if (!seenIds.has(b._id)) {
                seenIds.add(b._id);
                mergedBookings.push(b);
            }
        });

        // Sort by date
        mergedBookings.sort((a, b) =>
            new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt)
        );

        // Get liked hotels
        const likedHotels = userData.likedHotels
            ? Object.entries(userData.likedHotels).map(([code, data]) => ({ hotelCode: code, ...data }))
            : [];

        // Calculate user stats
        const confirmedBookings = mergedBookings.filter(b =>
            b.status === 'confirmed' || b.status === 'booked'
        ).length;
        const cancelledBookings = mergedBookings.filter(b => b.status === 'cancelled').length;
        const totalSpent = mergedBookings
            .filter(b => b.status === 'confirmed' || b.status === 'booked')
            .reduce((sum, b) => sum + (parseFloat(b.amount) || parseFloat(b.totalAmount) || 0), 0);

        // Clean response (remove bookings and likedHotels from the main user object to avoid duplication)
        const { bookings: _, likedHotels: __, ...cleanUserData } = userData;

        res.json({
            success: true,
            user: {
                uid,
                ...cleanUserData,
                stats: {
                    totalBookings: mergedBookings.length,
                    confirmedBookings,
                    cancelledBookings,
                    totalSpent: Math.round(totalSpent),
                    likedHotelsCount: likedHotels.length
                }
            },
            bookings: mergedBookings,
            likedHotels
        });

    } catch (error) {
        console.error('GetUserDetails Error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch user details',
            message: error.message
        });
    }
};

/**
 * Get markup settings from Firebase
 */
exports.getMarkupSettings = async (req, res) => {
    try {
        const settingsRef = database.ref('settings/markup');
        const snap = await settingsRef.once('value');
        const settings = snap.val() || { percentage: 0, isActive: false };

        res.json({
            success: true,
            markup: {
                percentage: settings.percentage || 0,
                isActive: settings.isActive || false,
                updatedAt: settings.updatedAt || null,
                updatedBy: settings.updatedBy || null
            }
        });
    } catch (error) {
        console.error('GetMarkupSettings Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch markup settings', message: error.message });
    }
};

/**
 * Set markup percentage
 */
exports.setMarkupSettings = async (req, res) => {
    try {
        const { percentage, isActive } = req.body;

        if (percentage === undefined || percentage === null) {
            return res.status(400).json({ error: 'Percentage is required' });
        }

        const pct = parseFloat(percentage);
        if (isNaN(pct) || pct < 0 || pct > 100) {
            return res.status(400).json({ error: 'Percentage must be between 0 and 100' });
        }

        console.log(`\n=== Setting Markup: ${pct}% (Active: ${isActive}) ===`);

        const settingsRef = database.ref('settings/markup');
        await settingsRef.set({
            percentage: pct,
            isActive: isActive !== undefined ? isActive : true,
            updatedAt: new Date().toISOString(),
            updatedBy: 'admin'
        });

        res.json({
            success: true,
            markup: { percentage: pct, isActive: isActive !== undefined ? isActive : true }
        });
    } catch (error) {
        console.error('SetMarkupSettings Error:', error.message);
        res.status(500).json({ error: 'Failed to save markup settings', message: error.message });
    }
};

/**
 * Get commission earnings stats
 */
exports.getCommissionStats = async (req, res) => {
    try {
        console.log('\n=== GetCommissionStats ===');

        const allBookings = await collectAllBookings();

        // Get current markup settings
        const settingsRef = database.ref('settings/markup');
        const settingsSnap = await settingsRef.once('value');
        const markupSettings = settingsSnap.val() || { percentage: 0, isActive: false };

        // Calculate commission from bookings that have markupAmount stored
        let totalCommission = 0;
        let totalOriginalAmount = 0;
        let totalChargedAmount = 0;
        const commissionBookings = [];

        const confirmedBookings = allBookings.filter(b =>
            b.status === 'confirmed' || b.status === 'booked'
        );

        confirmedBookings.forEach(b => {
            const markupAmt = parseFloat(b.markupAmount) || 0;
            const originalAmt = parseFloat(b.originalAmount) || 0;
            const chargedAmt = parseFloat(b.amount) || parseFloat(b.totalAmount) || 0;

            // If markupAmount was explicitly stored
            if (markupAmt > 0) {
                totalCommission += markupAmt;
                totalOriginalAmount += originalAmt;
                totalChargedAmount += chargedAmt;
                commissionBookings.push({
                    _id: b._id,
                    hotelName: b.hotelInfo?.hotelName || b.hotelInfo?.HotelName || b.hotelName || 'Unknown',
                    guestEmail: b.contactDetails?.email || b._userEmail || 'N/A',
                    guestName: `${b.contactDetails?.firstName || ''} ${b.contactDetails?.lastName || ''}`.trim() || b._userName || 'N/A',
                    originalAmount: originalAmt,
                    chargedAmount: chargedAmt,
                    markupAmount: markupAmt,
                    markupPercentage: b.markupPercentage || 0,
                    date: b.completedAt || b.createdAt,
                    status: b.status
                });
            } else if (chargedAmt > 0) {
                // For older bookings without explicit markup data, there's no commission
                totalOriginalAmount += chargedAmt;
                totalChargedAmount += chargedAmt;
            }
        });

        // Monthly commission breakdown
        const now = new Date();
        const monthlyCommission = [];
        for (let i = 5; i >= 0; i--) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
            const monthName = monthDate.toLocaleString('en-US', { month: 'short' });

            const monthBookings = commissionBookings.filter(b => {
                const bDate = new Date(b.date);
                return bDate >= monthDate && bDate <= monthEnd;
            });

            const monthCommission = monthBookings.reduce((sum, b) => sum + b.markupAmount, 0);
            const monthRevenue = monthBookings.reduce((sum, b) => sum + b.chargedAmount, 0);

            monthlyCommission.push({
                shortMonth: monthName,
                commission: Math.round(monthCommission),
                revenue: Math.round(monthRevenue),
                bookings: monthBookings.length
            });
        }

        // Sort commission bookings by date (newest first)
        commissionBookings.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({
            success: true,
            currentMarkup: markupSettings,
            commission: {
                totalCommission: Math.round(totalCommission),
                totalOriginalAmount: Math.round(totalOriginalAmount),
                totalChargedAmount: Math.round(totalChargedAmount),
                totalBookingsWithCommission: commissionBookings.length,
                avgCommissionPerBooking: commissionBookings.length > 0 ? Math.round(totalCommission / commissionBookings.length) : 0,
                monthlyCommission,
                bookings: commissionBookings
            }
        });

    } catch (error) {
        console.error('GetCommissionStats Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch commission stats', message: error.message });
    }
};

/**
 * Create a coupon code
 */
exports.createCoupon = async (req, res) => {
    try {
        const {
            code, discountType, discountValue, maxDiscount,
            minBookingAmount, expiryDate, usageLimit, description, isActive
        } = req.body;

        if (!code || !discountType || !discountValue) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['code', 'discountType', 'discountValue']
            });
        }

        const couponCode = code.toUpperCase().trim();

        // Check if coupon already exists
        const existingSnap = await database.ref(`coupons/${couponCode}`).once('value');
        if (existingSnap.exists()) {
            return res.status(409).json({ error: 'Coupon code already exists' });
        }

        const couponData = {
            code: couponCode,
            discountType: discountType, // 'percentage' or 'flat'
            discountValue: parseFloat(discountValue),
            maxDiscount: parseFloat(maxDiscount) || 0, // max discount cap for percentage type
            minBookingAmount: parseFloat(minBookingAmount) || 0,
            expiryDate: expiryDate || null,
            usageLimit: parseInt(usageLimit) || 0, // 0 = unlimited
            usedCount: 0,
            description: description || '',
            isActive: isActive !== undefined ? isActive : true,
            createdAt: new Date().toISOString()
        };

        await database.ref(`coupons/${couponCode}`).set(couponData);
        console.log(`Coupon created: ${couponCode}`);

        res.json({ success: true, coupon: couponData });

    } catch (error) {
        console.error('CreateCoupon Error:', error.message);
        res.status(500).json({ error: 'Failed to create coupon', message: error.message });
    }
};

/**
 * Get all coupons
 */
exports.getAllCoupons = async (req, res) => {
    try {
        const snap = await database.ref('coupons').once('value');
        const couponsData = snap.val() || {};
        const coupons = Object.values(couponsData).sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        res.json({ success: true, coupons });
    } catch (error) {
        console.error('GetAllCoupons Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch coupons', message: error.message });
    }
};

/**
 * Update coupon (toggle active, edit fields)
 */
exports.updateCoupon = async (req, res) => {
    try {
        const { code } = req.params;
        const updates = req.body;

        const couponRef = database.ref(`coupons/${code.toUpperCase()}`);
        const snap = await couponRef.once('value');

        if (!snap.exists()) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        await couponRef.update(updates);
        const updatedSnap = await couponRef.once('value');

        res.json({ success: true, coupon: updatedSnap.val() });
    } catch (error) {
        console.error('UpdateCoupon Error:', error.message);
        res.status(500).json({ error: 'Failed to update coupon', message: error.message });
    }
};

/**
 * Delete coupon
 */
exports.deleteCoupon = async (req, res) => {
    try {
        const { code } = req.params;
        await database.ref(`coupons/${code.toUpperCase()}`).remove();
        res.json({ success: true });
    } catch (error) {
        console.error('DeleteCoupon Error:', error.message);
        res.status(500).json({ error: 'Failed to delete coupon', message: error.message });
    }
};

/**
 * Validate and apply a coupon code (public endpoint for users)
 */
exports.validateCoupon = async (req, res) => {
    try {
        const { code, bookingAmount } = req.body;

        if (!code) {
            return res.status(400).json({ error: 'Coupon code is required' });
        }

        const couponCode = code.toUpperCase().trim();
        const snap = await database.ref(`coupons/${couponCode}`).once('value');

        if (!snap.exists()) {
            return res.status(404).json({ error: 'Invalid coupon code' });
        }

        const coupon = snap.val();

        // Check active
        if (!coupon.isActive) {
            return res.status(400).json({ error: 'This coupon is no longer active' });
        }

        // Check expiry
        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
            return res.status(400).json({ error: 'This coupon has expired' });
        }

        // Check usage limit
        if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ error: 'This coupon has reached its usage limit' });
        }

        // Check minimum booking amount
        const amount = parseFloat(bookingAmount) || 0;
        if (coupon.minBookingAmount > 0 && amount < coupon.minBookingAmount) {
            return res.status(400).json({
                error: `Minimum booking amount of ₹${coupon.minBookingAmount} required`
            });
        }

        // Calculate discount
        let discount = 0;
        if (coupon.discountType === 'percentage') {
            discount = (amount * coupon.discountValue) / 100;
            if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        } else {
            discount = coupon.discountValue;
        }

        discount = Math.min(discount, amount); // Can't discount more than the amount

        res.json({
            success: true,
            coupon: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                maxDiscount: coupon.maxDiscount,
                description: coupon.description
            },
            discount: Math.round(discount * 100) / 100,
            finalAmount: Math.round((amount - discount) * 100) / 100
        });

    } catch (error) {
        console.error('ValidateCoupon Error:', error.message);
        res.status(500).json({ error: 'Failed to validate coupon', message: error.message });
    }
};
