/**
 * Static Data Service
 * Previously used Firebase Realtime Database for client-side caching.
 * Now all caching is handled server-side via MySQL.
 * These functions are kept as stubs to avoid breaking imports in api.js.
 */

/**
 * Get countries — always returns null so the API fallback is used
 */
export const getCachedCountries = async () => null;

/**
 * Get cities — always returns null so the API fallback is used
 */
export const getCachedCities = async (countryCode) => null;

/**
 * Get hotels — always returns null so the API fallback is used
 */
export const getCachedHotels = async (cityCode) => null;

/**
 * Get hotel details — always returns null so the API fallback is used
 */
export const getCachedHotelDetails = async (hotelCode) => null;

/**
 * Subscribe to countries updates — no-op, returns dummy unsubscribe
 */
export const subscribeToCountries = (callback) => () => {};

/**
 * Subscribe to cities updates — no-op, returns dummy unsubscribe
 */
export const subscribeToCities = (countryCode, callback) => () => {};

/**
 * Get cache metadata — returns null (no client-side cache)
 */
export const getCacheMetadata = async () => null;
