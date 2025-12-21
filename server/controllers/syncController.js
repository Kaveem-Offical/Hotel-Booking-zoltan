/**
 * Sync Controller
 * Admin endpoints for syncing TBO static data to Firebase
 */

const axios = require('axios');
const config = require('../config/config');
const firebaseService = require('../services/firebaseDataService');

// Create axios instance with basic auth for static data endpoints
const createStaticAxiosInstance = () => {
    return axios.create({
        headers: {
            'Content-Type': 'application/json'
        },
        auth: config.tboApi.staticAuth
    });
};

/**
 * Sync all countries from TBO to Firebase
 */
exports.syncCountries = async (req, res) => {
    try {
        console.log('Admin: Syncing countries from TBO to Firebase');

        const axiosInstance = createStaticAxiosInstance();
        const response = await axiosInstance.get(`${config.tboApi.baseUrl}/CountryList`);

        if (response.data && response.data.CountryList) {
            await firebaseService.saveCountries(response.data.CountryList);
            res.json({
                success: true,
                message: 'Countries synced successfully',
                count: response.data.CountryList.length
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'No country data received from TBO'
            });
        }
    } catch (error) {
        console.error('Sync countries error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to sync countries',
            message: error.message
        });
    }
};

/**
 * Sync cities for a country from TBO to Firebase
 */
exports.syncCities = async (req, res) => {
    try {
        const { countryCode } = req.body;

        if (!countryCode) {
            return res.status(400).json({ error: 'Country code is required' });
        }

        console.log(`Admin: Syncing cities for ${countryCode} from TBO to Firebase`);

        const axiosInstance = createStaticAxiosInstance();
        const response = await axiosInstance.post(
            `${config.tboApi.baseUrl}/CityList`,
            { CountryCode: countryCode }
        );

        if (response.data && response.data.CityList) {
            await firebaseService.saveCities(countryCode, response.data.CityList);
            res.json({
                success: true,
                message: `Cities for ${countryCode} synced successfully`,
                count: response.data.CityList.length
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'No city data received from TBO'
            });
        }
    } catch (error) {
        console.error('Sync cities error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to sync cities',
            message: error.message
        });
    }
};

/**
 * Sync hotels for a city from TBO to Firebase
 */
exports.syncHotels = async (req, res) => {
    try {
        const { cityCode } = req.body;

        if (!cityCode) {
            return res.status(400).json({ error: 'City code is required' });
        }

        console.log(`Admin: Syncing hotels for city ${cityCode} from TBO to Firebase`);

        const axiosInstance = createStaticAxiosInstance();
        const response = await axiosInstance.post(
            `${config.tboApi.baseUrl}/TBOHotelCodeList`,
            { CityCode: cityCode }
        );

        if (response.data && response.data.Hotels) {
            await firebaseService.saveHotels(cityCode, response.data.Hotels);
            res.json({
                success: true,
                message: `Hotels for city ${cityCode} synced successfully`,
                count: response.data.Hotels.length
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'No hotel data received from TBO'
            });
        }
    } catch (error) {
        console.error('Sync hotels error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to sync hotels',
            message: error.message
        });
    }
};

/**
 * Sync hotel details from TBO to Firebase
 */
exports.syncHotelDetails = async (req, res) => {
    try {
        const { hotelCode, language = 'EN' } = req.body;

        if (!hotelCode) {
            return res.status(400).json({ error: 'Hotel code is required' });
        }

        console.log(`Admin: Syncing hotel details for ${hotelCode} from TBO to Firebase`);

        const axiosInstance = createStaticAxiosInstance();
        const response = await axiosInstance.post(
            `${config.tboApi.baseUrl}/Hoteldetails`,
            {
                Hotelcodes: hotelCode,
                Language: language,
                IsRoomDetailRequired: true
            }
        );

        if (response.data && response.data.HotelDetails) {
            // If multiple hotels, save each one
            const hotels = response.data.HotelDetails;
            for (const hotel of hotels) {
                await firebaseService.saveHotelDetails(hotel.HotelCode, hotel);
            }
            res.json({
                success: true,
                message: `Hotel details synced successfully`,
                count: hotels.length
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'No hotel details received from TBO'
            });
        }
    } catch (error) {
        console.error('Sync hotel details error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to sync hotel details',
            message: error.message
        });
    }
};

/**
 * Get cache metadata
 */
exports.getCacheStatus = async (req, res) => {
    try {
        const metadata = await firebaseService.getCacheMetadata();
        res.json({
            success: true,
            cache: metadata
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get cache status',
            message: error.message
        });
    }
};

/**
 * Clear all cache
 */
exports.clearCache = async (req, res) => {
    try {
        await firebaseService.clearAllCache();
        res.json({
            success: true,
            message: 'All cache cleared successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to clear cache',
            message: error.message
        });
    }
};
