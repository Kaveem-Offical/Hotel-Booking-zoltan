/**
 * Firebase Data Service
 * Handles all Firebase Realtime Database operations for TBO static data
 */

const { database } = require('../config/firebaseAdmin');

const STATIC_DATA_PATH = 'tbo_static_data';

/**
 * Save countries list to Firebase
 */
const saveCountries = async (data) => {
    try {
        const ref = database.ref(`${STATIC_DATA_PATH}/countries`);
        await ref.set({
            lastUpdated: new Date().toISOString(),
            data: data
        });
        console.log('Countries saved to Firebase');
        return true;
    } catch (error) {
        console.error('Error saving countries to Firebase:', error);
        throw error;
    }
};

/**
 * Get countries from Firebase
 */
const getCountries = async () => {
    try {
        const ref = database.ref(`${STATIC_DATA_PATH}/countries`);
        const snapshot = await ref.once('value');
        const result = snapshot.val();
        if (result && result.data) {
            console.log('Countries fetched from Firebase cache');
            return result.data;
        }
        return null;
    } catch (error) {
        console.error('Error getting countries from Firebase:', error);
        return null;
    }
};

/**
 * Save cities for a country to Firebase
 */
const saveCities = async (countryCode, data) => {
    try {
        const ref = database.ref(`${STATIC_DATA_PATH}/cities/${countryCode}`);
        await ref.set({
            lastUpdated: new Date().toISOString(),
            data: data
        });
        console.log(`Cities for ${countryCode} saved to Firebase`);
        return true;
    } catch (error) {
        console.error('Error saving cities to Firebase:', error);
        throw error;
    }
};

/**
 * Get cities for a country from Firebase
 */
const getCities = async (countryCode) => {
    try {
        const ref = database.ref(`${STATIC_DATA_PATH}/cities/${countryCode}`);
        const snapshot = await ref.once('value');
        const result = snapshot.val();
        if (result && result.data) {
            console.log(`Cities for ${countryCode} fetched from Firebase cache`);
            return result.data;
        }
        return null;
    } catch (error) {
        console.error('Error getting cities from Firebase:', error);
        return null;
    }
};

/**
 * Save hotels for a city to Firebase
 */
const saveHotels = async (cityCode, data) => {
    try {
        const ref = database.ref(`${STATIC_DATA_PATH}/hotels/${cityCode}`);
        await ref.set({
            lastUpdated: new Date().toISOString(),
            data: data
        });
        console.log(`Hotels for city ${cityCode} saved to Firebase`);
        return true;
    } catch (error) {
        console.error('Error saving hotels to Firebase:', error);
        throw error;
    }
};

/**
 * Get hotels for a city from Firebase
 */
const getHotels = async (cityCode) => {
    try {
        const ref = database.ref(`${STATIC_DATA_PATH}/hotels/${cityCode}`);
        const snapshot = await ref.once('value');
        const result = snapshot.val();
        if (result && result.data) {
            console.log(`Hotels for city ${cityCode} fetched from Firebase cache`);
            return result.data;
        }
        return null;
    } catch (error) {
        console.error('Error getting hotels from Firebase:', error);
        return null;
    }
};

/**
 * Save hotel details to Firebase
 */
const saveHotelDetails = async (hotelCode, data) => {
    try {
        const ref = database.ref(`${STATIC_DATA_PATH}/hotelDetails/${hotelCode}`);
        await ref.set({
            lastUpdated: new Date().toISOString(),
            data: data
        });
        console.log(`Hotel details for ${hotelCode} saved to Firebase`);
        return true;
    } catch (error) {
        console.error('Error saving hotel details to Firebase:', error);
        throw error;
    }
};

/**
 * Get hotel details from Firebase
 */
const getHotelDetails = async (hotelCode) => {
    try {
        const ref = database.ref(`${STATIC_DATA_PATH}/hotelDetails/${hotelCode}`);
        const snapshot = await ref.once('value');
        const result = snapshot.val();
        if (result && result.data) {
            console.log(`Hotel details for ${hotelCode} fetched from Firebase cache`);
            return result.data;
        }
        return null;
    } catch (error) {
        console.error('Error getting hotel details from Firebase:', error);
        return null;
    }
};

/**
 * Find basic hotel info by hotel code from cached hotel lists
 * This searches through all cached city hotel lists to find the hotel
 */
const findHotelByCode = async (hotelCode) => {
    try {
        const ref = database.ref(`${STATIC_DATA_PATH}/hotels`);
        const snapshot = await ref.once('value');
        const allCityHotels = snapshot.val();

        if (!allCityHotels) {
            return null;
        }

        // Search through all cached cities' hotel lists
        for (const cityCode of Object.keys(allCityHotels)) {
            const cityData = allCityHotels[cityCode];
            if (cityData && cityData.data && Array.isArray(cityData.data)) {
                const hotel = cityData.data.find(h =>
                    h.HotelCode === hotelCode ||
                    h.HotelCode === String(hotelCode) ||
                    String(h.HotelCode) === String(hotelCode)
                );
                if (hotel) {
                    console.log(`Found hotel ${hotelCode} in cached hotels for city ${cityCode}`);
                    return hotel;
                }
            }
        }

        console.log(`Hotel ${hotelCode} not found in any cached city hotel lists`);
        return null;
    } catch (error) {
        console.error('Error finding hotel by code:', error);
        return null;
    }
};

/**
 * Get cache metadata (for admin dashboard)
 */
const getCacheMetadata = async () => {
    try {
        const ref = database.ref(STATIC_DATA_PATH);
        const snapshot = await ref.once('value');
        const data = snapshot.val();

        const metadata = {
            countries: data?.countries?.lastUpdated || null,
            citiesCount: data?.cities ? Object.keys(data.cities).length : 0,
            hotelsCount: data?.hotels ? Object.keys(data.hotels).length : 0,
            hotelDetailsCount: data?.hotelDetails ? Object.keys(data.hotelDetails).length : 0
        };

        return metadata;
    } catch (error) {
        console.error('Error getting cache metadata:', error);
        return null;
    }
};

/**
 * Clear all cached data (admin function)
 */
const clearAllCache = async () => {
    try {
        const ref = database.ref(STATIC_DATA_PATH);
        await ref.remove();
        console.log('All Firebase cache cleared');
        return true;
    } catch (error) {
        console.error('Error clearing cache:', error);
        throw error;
    }
};
/**
 * Save hotel card info to Firebase (image, amenities, rating, reviews)
 * @param {string} hotelCode
 * @param {object} hotelInfo - { imageUrl, amenities, rating, reviews, ratingText, description }
 */
const saveHotelCardInfo = async (hotelCode, hotelInfo) => {
    try {
        const ref = database.ref(`${STATIC_DATA_PATH}/hotelCardInfo/${hotelCode}`);
        await ref.set({
            ...hotelInfo,
            lastUpdated: new Date().toISOString()
        });
        console.log(`Hotel card info for ${hotelCode} saved to Firebase`);
        return true;
    } catch (error) {
        console.error('Error saving hotel card info to Firebase:', error);
        return false;
    }
};

/**
 * Get hotel card info from Firebase
 */
const getHotelCardInfo = async (hotelCode) => {
    try {
        const ref = database.ref(`${STATIC_DATA_PATH}/hotelCardInfo/${hotelCode}`);
        const snapshot = await ref.once('value');
        const result = snapshot.val();
        if (result) {
            return result;
        }
        return null;
    } catch (error) {
        console.error('Error getting hotel card info from Firebase:', error);
        return null;
    }
};

/**
 * Batch get hotel card info for multiple hotels from Firebase
 * Returns object: { hotelCode: { imageUrl, amenities, rating, reviews, ... }, ... }
 */
const getHotelCardInfoBatch = async (hotelCodes) => {
    try {
        const hotelInfoMap = {};
        const ref = database.ref(`${STATIC_DATA_PATH}/hotelCardInfo`);
        const snapshot = await ref.once('value');
        const allInfo = snapshot.val() || {};

        for (const code of hotelCodes) {
            if (allInfo[code]) {
                hotelInfoMap[code] = allInfo[code];
            }
        }

        console.log(`Found ${Object.keys(hotelInfoMap).length} cached hotel card info out of ${hotelCodes.length} requested`);
        return hotelInfoMap;
    } catch (error) {
        console.error('Error batch getting hotel card info from Firebase:', error);
        return {};
    }
};

/**
 * Get list of hotel codes that don't have cached card info
 */
const getMissingHotelCardInfoCodes = async (hotelCodes) => {
    try {
        const ref = database.ref(`${STATIC_DATA_PATH}/hotelCardInfo`);
        const snapshot = await ref.once('value');
        const cachedInfo = snapshot.val() || {};

        const missing = hotelCodes.filter(code => !cachedInfo[code]);
        console.log(`${missing.length} hotels out of ${hotelCodes.length} are missing cached card info`);
        return missing;
    } catch (error) {
        console.error('Error checking for missing hotel card info:', error);
        return hotelCodes; // Return all as missing if error occurs
    }
};

module.exports = {
    saveCountries,
    getCountries,
    saveCities,
    getCities,
    saveHotels,
    getHotels,
    saveHotelDetails,
    getHotelDetails,
    findHotelByCode,
    getCacheMetadata,
    clearAllCache,
    saveHotelCardInfo,
    getHotelCardInfo,
    getHotelCardInfoBatch,
    getMissingHotelCardInfoCodes
};
