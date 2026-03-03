const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');

// Static data routes
router.get('/countries', hotelController.getCountryList);
router.post('/cities', hotelController.getCityList);
router.post('/hotels', hotelController.getHotelCodeList);
router.post('/hotel-details', hotelController.getHotelDetails);
router.post('/hotel-basic-info', hotelController.getBasicHotelInfo);

// Search route (with pricing and availability)
router.post('/search', hotelController.searchHotel);

// Hotel card info route (fetch and cache images, amenities, rating, reviews for search results)
router.post('/hotel-card-info', hotelController.fetchAndCacheHotelCardInfo);

// Autocomplete route
router.get('/search-names', hotelController.searchHotelNames);

// PreBook and Book routes
router.post('/prebook', hotelController.preBookHotel);
router.post('/book', hotelController.bookHotel);

// Authenticate route (for testing/debugging token)
router.post('/authenticate', hotelController.authenticate);

// Cancellation routes
router.post('/cancel', hotelController.sendChangeRequest);
router.post('/cancel-status', hotelController.getChangeRequestStatus);

module.exports = router;

