const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');

// Static data routes
router.get('/countries', hotelController.getCountryList);
router.post('/cities', hotelController.getCityList);
router.post('/hotels', hotelController.getHotelCodeList);
router.post('/hotel-details', hotelController.getHotelDetails);

module.exports = router;

