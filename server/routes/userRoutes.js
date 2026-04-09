const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// User Profile
router.post('/profile', userController.updateUserProfile);
router.get('/:uid', userController.getUserProfile);

// Liked Hotels
router.get('/:uid/liked-hotels', userController.getLikedHotels);
router.post('/:uid/liked-hotels', userController.likeHotel);
router.delete('/:uid/liked-hotels/:hotelCode', userController.unlikeHotel);

// User Bookings
router.get('/:uid/bookings', userController.getUserBookings);

module.exports = router;
