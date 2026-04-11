const db = require('../config/db');

/**
 * Reusable function to save booking logically mapping nested JSON to relational schema.
 * @param {Object} data - Booking payload
 */
exports.saveBookingData = async (data) => {
    console.log(`[SQL INSERT] Starting saveBookingData for orderId: ${data.orderId}`);
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        console.log(`[SQL INSERT] Transaction started for orderId: ${data.orderId}`);

        // 1. Insert Main Booking
        const insertBookingQuery = `
            INSERT INTO bookings (
                order_id, booking_code, tbo_booking_id, booking_ref_no,
                confirmation_no, booking_status,
                hotel_code, hotel_name, hotel_address, hotel_image, city_name, hotel_rating,
                room_name, room_info,
                check_in, check_out, rooms, guests, last_cancellation_deadline,
                amount, original_amount, markup_amount, markup_percentage, currency,
                guest_nationality, contact_details,
                is_package_fare, is_package_details_mandatory, is_voucher_booking,
                tbo_response, hotel_rooms_details, search_params,
                rate_conditions, cancellation_policies,
                payment_id, payment_signature,
                status, created_at, completed_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?,
                ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?
            )
            ON DUPLICATE KEY UPDATE
                status             = VALUES(status),
                tbo_response       = VALUES(tbo_response),
                payment_id         = VALUES(payment_id),
                payment_signature  = VALUES(payment_signature),
                booking_status     = VALUES(booking_status),
                tbo_booking_id     = VALUES(tbo_booking_id),
                booking_ref_no     = VALUES(booking_ref_no),
                confirmation_no    = VALUES(confirmation_no),
                completed_at       = VALUES(completed_at)
        `;

        const bookingValues = [
            data.orderId,
            data.bookingCode || null,
            data.tboBookingId || data.tboResponse?.bookingId || null,
            data.bookingRefNo || null,
            data.confirmationNo || null,
            data.bookingStatus || null,
            data.hotelInfo?.hotelCode || null,
            data.hotelInfo?.hotelName || null,
            data.hotelInfo?.address || null,
            data.hotelInfo?.picture || data.hotelInfo?.image || null,
            data.hotelInfo?.cityName || null,
            data.hotelInfo?.rating || null,
            data.roomInfo?.name || null,
            data.roomInfo ? JSON.stringify(data.roomInfo) : null,
            data.searchParams?.checkIn || null,
            data.searchParams?.checkOut || null,
            data.searchParams?.rooms || 1,
            data.searchParams?.adults || data.guests || 2,
            data.lastCancellationDeadline || null,
            data.amount || 0,
            data.originalAmount || 0,
            data.markupAmount || 0,
            data.markupPercentage || 0,
            data.currency || 'INR',
            data.guestNationality ?? 'IN',
            data.contactDetails ? JSON.stringify(data.contactDetails) : null,
            data.isPackageFare ? 1 : 0,
            data.isPackageDetailsMandatory ? 1 : 0,
            data.isVoucherBooking ? 1 : 0,
            data.tboResponse ? JSON.stringify(data.tboResponse) : null,
            data.hotelRoomsDetails ? JSON.stringify(data.hotelRoomsDetails) : null,
            data.searchParams ? JSON.stringify(data.searchParams) : null,
            data.rateConditions ? JSON.stringify(data.rateConditions) : null,
            data.cancellationPolicies ? JSON.stringify(data.cancellationPolicies) : null,
            data.paymentId || null,
            data.paymentSignature || null,
            data.status || 'pending',
            data.createdAt || new Date().toISOString(),
            data.completedAt || null
        ];

        const [bookingResult] = await connection.execute(insertBookingQuery, bookingValues);
        console.log(`[SQL INSERT] bookings table - affectedRows: ${bookingResult.affectedRows}, insertId: ${bookingResult.insertId}`);

        // Ensure user linkage if provided
        if (data.userId) {
            console.log(`[SQL INSERT] Linking booking to userId: ${data.userId}`);
            const linkQuery = `INSERT IGNORE INTO user_bookings (user_id, order_id) VALUES (?, ?)`;
            await connection.execute(linkQuery, [data.userId, data.orderId]);
        }

        await connection.commit();
        console.log(`[SQL INSERT] ✅ Transaction committed successfully for orderId: ${data.orderId}`);
        return { success: true, orderId: data.orderId };
    } catch (error) {
        await connection.rollback();
        console.error(`[SQL INSERT] ❌ Transaction rolled back for orderId: ${data.orderId}`, error);
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * Reusable function to fetch booking by ID reconstructing nested JSON
 */
exports.getBookingData = async (orderId) => {
    console.log(`[SQL FETCH] Fetching booking data for orderId: ${orderId}`);
    const query = `SELECT * FROM bookings WHERE order_id = ?`;

    const [rows] = await db.execute(query, [orderId]);
    console.log(`[SQL FETCH] Query executed - rows returned: ${rows.length}`);
    if (rows.length === 0) {
        console.log(`[SQL FETCH] ⚠️ No booking found for orderId: ${orderId}`);
        return null;
    }

    const row = rows[0];

    // Reconstruct
    const booking = {
        orderId: row.order_id,
        bookingCode: row.booking_code,
        bookingId: row.booking_id,
        tboBookingId: row.tbo_booking_id,
        bookingRefNo: row.booking_ref_no,
        confirmationNo: row.confirmation_no,
        bookingStatus: row.booking_status,
        amount: parseFloat(row.amount),
        currency: row.currency,
        guestNationality: row.guest_nationality,
        isPackageFare: Boolean(row.is_package_fare),
        isPackageDetailsMandatory: Boolean(row.is_package_details_mandatory),
        isVoucherBooking: Boolean(row.is_voucher_booking),
        originalAmount: parseFloat(row.original_amount),
        markupAmount: parseFloat(row.markup_amount),
        markupPercentage: parseFloat(row.markup_percentage),
        status: row.status,
        createdAt: row.created_at,
        completedAt: row.completed_at,
        paymentId: row.payment_id,
        paymentSignature: row.payment_signature
    };

    if (row.tbo_response) booking.tboResponse = typeof row.tbo_response === 'string' ? JSON.parse(row.tbo_response) : row.tbo_response;
    if (row.hotel_rooms_details) booking.hotelRoomsDetails = typeof row.hotel_rooms_details === 'string' ? JSON.parse(row.hotel_rooms_details) : row.hotel_rooms_details;
    if (row.search_params) booking.searchParams = typeof row.search_params === 'string' ? JSON.parse(row.search_params) : row.search_params;
    if (row.contact_details) booking.contactDetails = typeof row.contact_details === 'string' ? JSON.parse(row.contact_details) : row.contact_details;
    if (row.room_info) booking.roomInfo = typeof row.room_info === 'string' ? JSON.parse(row.room_info) : row.room_info;
    if (row.rate_conditions) booking.rateConditions = typeof row.rate_conditions === 'string' ? JSON.parse(row.rate_conditions) : row.rate_conditions;
    if (row.cancellation_policies) booking.cancellationPolicies = typeof row.cancellation_policies === 'string' ? JSON.parse(row.cancellation_policies) : row.cancellation_policies;
    
    // Legacy support mapping
    booking.hotelInfo = {
        hotelCode: row.hotel_code,
        hotelName: row.hotel_name,
        address: row.hotel_address,
        picture: row.hotel_image,
        cityName: row.city_name,
        rating: row.hotel_rating
    };

    console.log(`[SQL FETCH] ✅ Booking data retrieved for orderId: ${orderId}, status: ${booking.status}`);
    return booking;
};

/**
 * Reusable function to fetch ALL historic bookings or pending for reporting
 */
exports.getAllBookingsData = async () => {
    console.log(`[SQL FETCH] Fetching all bookings data`);
    const query = `SELECT * FROM bookings ORDER BY created_at DESC`;
    const [rows] = await db.execute(query);
    console.log(`[SQL FETCH] ✅ All bookings retrieved - total count: ${rows.length}`);
    
    return rows.map(row => {
        const booking = {
            orderId: row.order_id,
            bookingCode: row.booking_code,
            bookingId: row.booking_id,
            amount: parseFloat(row.amount),
            currency: row.currency,
            status: row.status,
            createdAt: row.created_at,
            completedAt: row.completed_at,
            bookingStatus: row.booking_status
        };
        if (row.tbo_response) booking.tboResponse = typeof row.tbo_response === 'string' ? JSON.parse(row.tbo_response) : row.tbo_response;
        if (row.search_params) booking.searchParams = typeof row.search_params === 'string' ? JSON.parse(row.search_params) : row.search_params;
        if (row.contact_details) booking.contactDetails = typeof row.contact_details === 'string' ? JSON.parse(row.contact_details) : row.contact_details;
        
        booking.hotelInfo = { hotelName: row.hotel_name, picture: row.hotel_image, cityName: row.city_name };
        return booking;
    });
};

/**
 * API Endpoint: POST /booking
 * Creates a new booking entry
 */
exports.createBooking = async (req, res) => {
    try {
        if (!req.body.orderId) {
            return res.status(400).json({ error: 'Missing orderId' });
        }
        await exports.saveBookingData(req.body);
        res.status(201).json({
            success: true,
            message: 'Booking saved successfully',
            orderId: req.body.orderId
        });
    } catch (error) {
        console.error('API createBooking Error:', error);
        res.status(500).json({
            error: 'Failed to save booking',
            message: error.message
        });
    }
};

/**
 * API Endpoint: GET /booking/:orderId
 * Fetches booking details
 */
exports.getBooking = async (req, res) => {
    try {
        const booking = await exports.getBookingData(req.params.orderId);
        if (!booking) {
            return res.status(404).json({
                error: 'Booking not found',
                message: `No booking found with order ID: ${req.params.orderId}`
            });
        }
        res.json({
            success: true,
            booking
        });
    } catch (error) {
        console.error('API getBooking Error:', error);
        res.status(500).json({
            error: 'Failed to fetch booking',
            message: error.message
        });
    }
};
