/**
 * Static Data Service
 * Provides direct Firebase access for TBO static data on the client side
 * Uses the Firebase Realtime Database for fast cached data retrieval
 */

import { ref, get, onValue } from 'firebase/database';
import { database } from '../config/firebase';

const STATIC_DATA_PATH = 'tbo_static_data';

/**
 * Get countries from Firebase cache
 * @returns {Promise<Array|null>} Countries array or null if not cached
 */
export const getCachedCountries = async () => {
    try {
        const countriesRef = ref(database, `${STATIC_DATA_PATH}/countries/data`);
        const snapshot = await get(countriesRef);
        if (snapshot.exists()) {
            // console.log('Countries loaded from Firebase cache');
            return snapshot.val();
        }
        return null;
    } catch (error) {
        console.error('Error getting cached countries:', error);
        return null;
    }
};

/**
 * Get cities for a country from Firebase cache
 * @param {string} countryCode - Country code (e.g., 'IN', 'US')
 * @returns {Promise<Array|null>} Cities array or null if not cached
 */
export const getCachedCities = async (countryCode) => {
    try {
        const citiesRef = ref(database, `${STATIC_DATA_PATH}/cities/${countryCode}/data`);
        const snapshot = await get(citiesRef);
        if (snapshot.exists()) {
            // console.log(`Cities for ${countryCode} loaded from Firebase cache`);
            return snapshot.val();
        }
        return null;
    } catch (error) {
        console.error('Error getting cached cities:', error);
        return null;
    }
};

/**
 * Get hotels for a city from Firebase cache
 * @param {string} cityCode - City code
 * @returns {Promise<Array|null>} Hotels array or null if not cached
 */
export const getCachedHotels = async (cityCode) => {
    try {
        const hotelsRef = ref(database, `${STATIC_DATA_PATH}/hotels/${cityCode}/data`);
        const snapshot = await get(hotelsRef);
        if (snapshot.exists()) {
            // console.log(`Hotels for city ${cityCode} loaded from Firebase cache`);
            return snapshot.val();
        }
        return null;
    } catch (error) {
        console.error('Error getting cached hotels:', error);
        return null;
    }
};

/**
 * Get hotel details from Firebase cache
 * @param {string} hotelCode - Hotel code
 * @returns {Promise<Object|null>} Hotel details or null if not cached
 */
export const getCachedHotelDetails = async (hotelCode) => {
    try {
        const detailsRef = ref(database, `${STATIC_DATA_PATH}/hotelDetails/${hotelCode}/data`);
        const snapshot = await get(detailsRef);
        if (snapshot.exists()) {
            // console.log(`Hotel details for ${hotelCode} loaded from Firebase cache`);
            return snapshot.val();
        }
        return null;
    } catch (error) {
        console.error('Error getting cached hotel details:', error);
        return null;
    }
};

/**
 * Subscribe to countries updates (real-time listener)
 * @param {Function} callback - Callback function to receive updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeToCountries = (callback) => {
    const countriesRef = ref(database, `${STATIC_DATA_PATH}/countries/data`);
    return onValue(countriesRef, (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.val());
        }
    });
};

/**
 * Subscribe to cities updates for a country (real-time listener)
 * @param {string} countryCode - Country code
 * @param {Function} callback - Callback function to receive updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeToCities = (countryCode, callback) => {
    const citiesRef = ref(database, `${STATIC_DATA_PATH}/cities/${countryCode}/data`);
    return onValue(citiesRef, (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.val());
        }
    });
};

/**
 * Get cache metadata (last updated times, counts)
 * @returns {Promise<Object|null>} Cache metadata
 */
export const getCacheMetadata = async () => {
    try {
        const metadataRef = ref(database, STATIC_DATA_PATH);
        const snapshot = await get(metadataRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            return {
                countriesLastUpdated: data?.countries?.lastUpdated || null,
                citiesCount: data?.cities ? Object.keys(data.cities).length : 0,
                hotelsCount: data?.hotels ? Object.keys(data.hotels).length : 0,
                hotelDetailsCount: data?.hotelDetails ? Object.keys(data.hotelDetails).length : 0
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting cache metadata:', error);
        return null;
    }
};
