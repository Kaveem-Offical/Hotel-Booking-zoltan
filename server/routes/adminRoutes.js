const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Get agency balance from TBO
router.get('/balance', adminController.getAgencyBalance);

// Get aggregated dashboard stats
router.get('/stats', adminController.getDashboardStats);

// Get all bookings for admin management
router.get('/bookings', adminController.getAllBookings);

// Get full details for a specific user
router.get('/users/:uid', adminController.getUserDetails);

// Markup settings
router.get('/markup', adminController.getMarkupSettings);
router.post('/markup', adminController.setMarkupSettings);

// Commission stats
router.get('/commission', adminController.getCommissionStats);

// Pricing strategies
router.get('/pricing-strategies', adminController.getPricingStrategies);
router.post('/pricing-strategies', adminController.updatePricingStrategies);

// Coupon management
router.post('/coupons', adminController.createCoupon);
router.get('/coupons', adminController.getAllCoupons);
router.put('/coupons/:code', adminController.updateCoupon);
router.delete('/coupons/:code', adminController.deleteCoupon);

// Public coupon validation (users apply coupons)
router.post('/coupons/validate', adminController.validateCoupon);

module.exports = router;
