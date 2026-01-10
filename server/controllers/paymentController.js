const Razorpay = require('razorpay');
const crypto = require('crypto');
const config = require('../config/config');
const { database } = require('../config/firebaseAdmin');
const axios = require('axios');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret
});

// Create axios instance for TBO API
const createSearchAxiosInstance = () => {
    return axios.create({
        headers: {
            'Content-Type': 'application/json'
        },
        auth: {
            username: config.tboApi.apiAuth.username,
            password: config.tboApi.apiAuth.password
        }
    });
};

/**
 * Create Razorpay order for hotel booking
 * Stores pending booking data in Firebase for later retrieval
 */
exports.createOrder = async (req, res) => {
    try {
        const {
            amount,
            currency = 'INR',
            bookingCode,
            guestNationality,
            hotelRoomsDetails,
            isPackageFare = false,
            isPackageDetailsMandatory = false,
            // Additional metadata for booking history
            hotelInfo,
            roomInfo,
            searchParams,
            contactDetails
        } = req.body;

        // Validation
        if (!amount || !bookingCode || !guestNationality || !hotelRoomsDetails) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['amount', 'bookingCode', 'guestNationality', 'hotelRoomsDetails']
            });
        }

        console.log('\n=== Creating Razorpay Order ===');
        console.log(`Amount: ${amount} ${currency}`);
        console.log(`BookingCode: ${bookingCode}`);

        // Create Razorpay order
        const orderOptions = {
            amount: Math.round(amount * 100), // Razorpay expects amount in paise
            currency,
            receipt: `hotel_${Date.now()}`,
            notes: {
                bookingCode,
                guestNationality
            }
        };

        const order = await razorpay.orders.create(orderOptions);
        console.log(`Razorpay Order Created: ${order.id}`);

        // Store pending booking in Firebase
        const pendingBookingRef = database.ref(`bookings/pending/${order.id}`);
        await pendingBookingRef.set({
            orderId: order.id,
            bookingCode,
            amount,
            currency,
            guestNationality,
            hotelRoomsDetails,
            isPackageFare,
            isPackageDetailsMandatory,
            // Metadata for booking history
            hotelInfo: hotelInfo || null,
            roomInfo: roomInfo || null,
            searchParams: searchParams || null,
            contactDetails: contactDetails || null,
            status: 'pending',
            createdAt: new Date().toISOString()
        });

        console.log(`Pending booking stored in Firebase: ${order.id}`);

        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: config.razorpay.keyId
        });

    } catch (error) {
        console.error('\n=== Create Order Error ===');
        console.error('Error Message:', error.message);

        res.status(500).json({
            error: 'Failed to create payment order',
            message: error.message
        });
    }
};

/**
 * Verify Razorpay payment and complete hotel booking
 * Called after successful payment from frontend
 */
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        // Validation
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                error: 'Missing payment verification fields',
                required: ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature']
            });
        }

        console.log('\n=== Verifying Razorpay Payment ===');
        console.log(`Order ID: ${razorpay_order_id}`);
        console.log(`Payment ID: ${razorpay_payment_id}`);

        // Verify signature
        const generatedSignature = crypto
            .createHmac('sha256', config.razorpay.keySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            console.error('Payment signature verification failed');
            return res.status(400).json({
                error: 'Payment verification failed',
                message: 'Invalid payment signature'
            });
        }

        console.log('Payment signature verified successfully');

        // Retrieve pending booking from Firebase
        const pendingBookingRef = database.ref(`bookings/pending/${razorpay_order_id}`);
        const pendingSnapshot = await pendingBookingRef.once('value');
        const pendingBooking = pendingSnapshot.val();

        if (!pendingBooking) {
            console.error('Pending booking not found');
            return res.status(404).json({
                error: 'Booking not found',
                message: 'Pending booking data not found for this order'
            });
        }

        console.log('Retrieved pending booking from Firebase');

        // Build TBO Book request
        const bookRequest = {
            EndUserIp: req.ip || '127.0.0.1',
            BookingCode: pendingBooking.bookingCode,
            GuestNationality: pendingBooking.guestNationality,
            IsVoucherBooking: false, // Hold booking for testing - don't deduct money
            NetAmount: pendingBooking.amount,
            HotelRoomsDetails: pendingBooking.hotelRoomsDetails,
            IsPackageFare: pendingBooking.isPackageFare,
            IsPackageDetailsMandatory: pendingBooking.isPackageDetailsMandatory
        };

        console.log('Calling TBO Book API...');
        console.log('Book Request:', JSON.stringify(bookRequest, null, 2));

        // Call TBO Book API
        const axiosInstance = createSearchAxiosInstance();
        const tboResponse = await axiosInstance.post(config.tboApi.bookUrl, bookRequest);

        console.log('TBO Book Response:', JSON.stringify(tboResponse.data, null, 2));

        // TBO response is nested under BookResult
        const bookResult = tboResponse.data.BookResult || tboResponse.data;

        // Determine booking status - handle different response structures
        const bookingStatus = bookResult.HotelBookingStatus ||
            (bookResult.Status === 1 ? 'Confirmed' :
                bookResult.Status === 0 ? 'BookFailed' :
                    bookResult.Status === 3 ? 'VerifyPrice' : 'Unknown');

        const isSuccess = bookResult.Status === 1 ||
            bookingStatus === 'Confirmed' ||
            bookingStatus === 'Pending';

        // Store completed booking in Firebase history - ensure no undefined values
        const bookingHistoryRef = database.ref(`bookings/history/${razorpay_order_id}`);
        await bookingHistoryRef.set({
            ...pendingBooking,
            paymentId: razorpay_payment_id,
            paymentSignature: razorpay_signature,
            tboResponse: {
                status: bookResult.Status !== undefined ? bookResult.Status : null,
                hotelBookingStatus: bookingStatus || 'Unknown',
                bookingId: bookResult.BookingId !== undefined ? bookResult.BookingId : null,
                bookingRefNo: bookResult.BookingRefNo !== undefined ? bookResult.BookingRefNo : null,
                confirmationNo: bookResult.ConfirmationNo !== undefined ? bookResult.ConfirmationNo : null,
                voucherStatus: bookResult.VoucherStatus !== undefined ? bookResult.VoucherStatus : false,
                isPriceChanged: bookResult.IsPriceChanged !== undefined ? bookResult.IsPriceChanged : false,
                isCancellationPolicyChanged: bookResult.IsCancellationPolicyChanged !== undefined ? bookResult.IsCancellationPolicyChanged : false,
                responseStatus: bookResult.ResponseStatus !== undefined ? bookResult.ResponseStatus : null,
                error: bookResult.Error ? {
                    errorCode: bookResult.Error.ErrorCode || null,
                    errorMessage: bookResult.Error.ErrorMessage || null
                } : null,
                tboReferenceNo: bookResult.TBOReferenceNo || null,
                traceId: bookResult.TraceId || null
            },
            status: isSuccess ? 'confirmed' : 'failed',
            completedAt: new Date().toISOString()
        });

        // Remove from pending bookings
        await pendingBookingRef.remove();
        console.log('Booking moved to history');

        // Handle different response scenarios
        if (!isSuccess) {
            const errorMessage = bookResult.Error?.ErrorMessage ||
                'Booking failed';

            return res.status(400).json({
                success: false,
                error: 'Hotel booking failed',
                message: errorMessage,
                paymentCompleted: true, // Payment was successful, booking failed
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                bookingStatus,
                tboResponse: bookResult
            });
        }

        // Check for price/policy changes
        if (bookResult.IsPriceChanged || bookResult.IsCancellationPolicyChanged) {
            console.log('Price or cancellation policy changed');
            return res.json({
                success: true,
                warning: 'Price or cancellation policy has changed',
                isPriceChanged: bookResult.IsPriceChanged,
                isCancellationPolicyChanged: bookResult.IsCancellationPolicyChanged,
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                bookingStatus,
                bookingId: bookResult.BookingId,
                bookingRefNo: bookResult.BookingRefNo,
                confirmationNo: bookResult.ConfirmationNo,
                voucherStatus: bookResult.VoucherStatus,
                tboResponse: bookResult
            });
        }

        // Successful booking
        res.json({
            success: true,
            message: 'Booking confirmed successfully',
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            bookingStatus,
            bookingId: bookResult.BookingId,
            bookingRefNo: bookResult.BookingRefNo,
            confirmationNo: bookResult.ConfirmationNo,
            voucherStatus: bookResult.VoucherStatus,
            hotelInfo: pendingBooking.hotelInfo,
            roomInfo: pendingBooking.roomInfo,
            searchParams: pendingBooking.searchParams,
            contactDetails: pendingBooking.contactDetails
        });

    } catch (error) {
        console.error('\n=== Verify Payment Error ===');
        console.error('Error Message:', error.message);

        if (error.response) {
            console.error('TBO API Error:', JSON.stringify(error.response.data, null, 2));
            return res.status(error.response.status).json({
                error: 'Hotel booking failed',
                message: error.response.data?.Status?.Description || error.message,
                details: error.response.data
            });
        }

        res.status(500).json({
            error: 'Payment verification failed',
            message: error.message
        });
    }
};

/**
 * Get booking history for a user
 * Can filter by email or phone number
 */
exports.getBookingHistory = async (req, res) => {
    try {
        const { email, phone } = req.query;

        console.log('\n=== Fetching Booking History ===');
        console.log(`Email: ${email}, Phone: ${phone}`);

        const historyRef = database.ref('bookings/history');
        const snapshot = await historyRef.once('value');
        const allBookings = snapshot.val() || {};

        // Filter bookings by email or phone if provided
        let bookings = Object.values(allBookings);

        if (email) {
            bookings = bookings.filter(b =>
                b.contactDetails?.email?.toLowerCase() === email.toLowerCase()
            );
        }

        if (phone) {
            bookings = bookings.filter(b =>
                b.contactDetails?.phone === phone
            );
        }

        // Sort by completion date (newest first)
        bookings.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

        res.json({
            success: true,
            count: bookings.length,
            bookings
        });

    } catch (error) {
        console.error('Get Booking History Error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch booking history',
            message: error.message
        });
    }
};

/**
 * Get single booking details
 */
exports.getBookingDetails = async (req, res) => {
    try {
        const { orderId } = req.params;

        console.log(`\n=== Fetching Booking Details: ${orderId} ===`);

        // Check in history first
        const historyRef = database.ref(`bookings/history/${orderId}`);
        let snapshot = await historyRef.once('value');
        let booking = snapshot.val();

        // If not in history, check pending
        if (!booking) {
            const pendingRef = database.ref(`bookings/pending/${orderId}`);
            snapshot = await pendingRef.once('value');
            booking = snapshot.val();
        }

        if (!booking) {
            return res.status(404).json({
                error: 'Booking not found',
                message: `No booking found with order ID: ${orderId}`
            });
        }

        res.json({
            success: true,
            booking
        });

    } catch (error) {
        console.error('Get Booking Details Error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch booking details',
            message: error.message
        });
    }
};
