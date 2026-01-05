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

// PreBook and Book routes
router.post('/prebook', hotelController.preBookHotel);
router.post('/book', hotelController.bookHotel);

module.exports = router;
