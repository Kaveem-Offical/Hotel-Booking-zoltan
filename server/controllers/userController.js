const db = require('../config/db');

// Upsert User Profile
exports.updateUserProfile = async (req, res) => {
    try {
        const { uid, email, username, phoneNumber, provider, photoURL } = req.body;
        if (!uid) return res.status(400).json({ error: 'Missing uid' });

        const query = `
            INSERT INTO users (uid, email, username, phone_number, provider, photo_url)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            username = COALESCE(VALUES(username), username),
            phone_number = COALESCE(VALUES(phone_number), phone_number),
            photo_url = COALESCE(VALUES(photo_url), photo_url),
            updated_at = CURRENT_TIMESTAMP
        `;
        await db.execute(query, [
            uid, email || null, username || null, phoneNumber || null, provider || 'email', photoURL || null
        ]);

        res.json({ success: true, message: 'User profile updated' });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

// Get User Profile
exports.getUserProfile = async (req, res) => {
    try {
        const { uid } = req.params;
        const [rows] = await db.execute('SELECT * FROM users WHERE uid = ?', [uid]);
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        
        // Map database naming to camelCase
        const user = {
            uid: rows[0].uid,
            email: rows[0].email,
            username: rows[0].username,
            phoneNumber: rows[0].phone_number,
            provider: rows[0].provider,
            photoURL: rows[0].photo_url,
            role: rows[0].role,
            createdAt: rows[0].created_at
        };
        res.json({ success: true, user });
    } catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

// Get Liked Hotels
exports.getLikedHotels = async (req, res) => {
    try {
        const { uid } = req.params;
        const [rows] = await db.execute('SELECT * FROM liked_hotels WHERE user_id = ?', [uid]);
        
        // Map back to the format the frontend AuthContext expects
        const likedHotels = {};
        rows.forEach(row => {
            likedHotels[row.hotel_code] = {
                HotelCode: row.hotel_code,
                HotelName: row.hotel_name,
                HotelPicture: row.hotel_picture,
                HotelAddress: row.hotel_address,
                StarRating: row.star_rating,
                Rating: row.rating,
                TotalFare: row.total_fare,
                likedAt: row.liked_at
            };
        });
        
        res.json({ success: true, likedHotels });
    } catch (error) {
        console.error('Error getting liked hotels:', error);
        res.status(500).json({ error: 'Failed to fetch liked hotels' });
    }
};

// Like Hotel
exports.likeHotel = async (req, res) => {
    try {
        const { uid } = req.params;
        const { hotelCode, hotelName, hotelAddress, hotelPicture, rating, starRating, totalFare } = req.body;
        
        const query = `
            INSERT INTO liked_hotels (user_id, hotel_code, hotel_name, hotel_address, hotel_picture, rating, star_rating, total_fare)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            hotel_name = VALUES(hotel_name),
            total_fare = VALUES(total_fare),
            liked_at = CURRENT_TIMESTAMP
        `;
        
        await db.execute(query, [
            uid, hotelCode, hotelName || null, hotelAddress || null, hotelPicture || null, rating || null, starRating || null, totalFare || null
        ]);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error liking hotel:', error);
        res.status(500).json({ error: 'Failed to link hotel' });
    }
};

// Unlike Hotel
exports.unlikeHotel = async (req, res) => {
    try {
        const { uid, hotelCode } = req.params;
        await db.execute('DELETE FROM liked_hotels WHERE user_id = ? AND hotel_code = ?', [uid, hotelCode]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error unliking hotel:', error);
        res.status(500).json({ error: 'Failed to unlike hotel' });
    }
};

// Get User Bookings
exports.getUserBookings = async (req, res) => {
    try {
        const { uid } = req.params;
        const query = `
            SELECT b.*, ub.user_id 
            FROM bookings b
            JOIN user_bookings ub ON b.order_id COLLATE utf8mb4_unicode_ci = ub.order_id
            WHERE ub.user_id = ?
            ORDER BY b.created_at DESC
        `;
        
        const [rows] = await db.execute(query, [uid]);
        
        const bookings = rows.map(row => {
            const booking = {
                orderId: row.order_id,
                bookingId: row.booking_id,
                tboBookingId: row.tbo_booking_id,
                bookingCode: row.booking_code,
                bookingRefNo: row.booking_ref_no,
                confirmationNo: row.confirmation_no,
                hotelCode: row.hotel_code,
                hotelName: row.hotel_name,
                hotelAddress: row.hotel_address,
                hotelImage: row.hotel_image,
                checkIn: row.check_in,
                checkOut: row.check_out,
                rooms: row.rooms,
                guests: row.guests,
                lastCancellationDeadline: row.last_cancellation_deadline,
                amount: parseFloat(row.amount),
                currency: row.currency,
                originalAmount: parseFloat(row.original_amount),
                status: row.booking_status || row.status, // "booked", "cancelled", "completed" mappings based on frontend usage
                createdAt: row.created_at,
                completedAt: row.completed_at
            };
            
            // Map the overarching status string required by profile
            if (row.status === 'confirmed') booking.status = 'booked';
            if (row.booking_status === 'Cancelled' || row.status === 'cancelled') booking.status = 'cancelled';
            
            if (row.room_info) booking.roomInfo = typeof row.room_info === 'string' ? JSON.parse(row.room_info) : row.room_info;
            if (row.tbo_response) booking.tboResponse = typeof row.tbo_response === 'string' ? JSON.parse(row.tbo_response) : row.tbo_response;

            return booking;
        });
        
        res.json({ success: true, bookings });
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ error: 'Failed to fetch user bookings' });
    }
};
