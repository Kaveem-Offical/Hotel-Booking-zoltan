const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Save booking data (main, contacts, hotels, passengers)
router.post('/', bookingController.createBooking);

// Fetch booking data by orderId
router.get('/:orderId', bookingController.getBooking);

module.exports = router;
