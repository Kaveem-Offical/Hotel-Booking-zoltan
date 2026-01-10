const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Create Razorpay order for hotel booking
router.post('/create-order', paymentController.createOrder);

// Verify payment and complete hotel booking
router.post('/verify', paymentController.verifyPayment);

// Get booking history (with optional email/phone filter)
router.get('/bookings', paymentController.getBookingHistory);

// Get single booking details
router.get('/bookings/:orderId', paymentController.getBookingDetails);

module.exports = router;
