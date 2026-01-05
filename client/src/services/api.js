import axios from 'axios';
import {
  getCachedCountries,
  getCachedCities,
  getCachedHotels,
  getCachedHotelDetails
} from './staticDataService';

const API_BASE_URL = 'http://localhost:5000/api/hotels';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch countries - Firebase cache first, then API
 */
export const fetchCountries = async () => {
  try {
    // Try Firebase cache first
    const cached = await getCachedCountries();
    if (cached) {
      console.log('Using cached countries from Firebase');
      return { CountryList: cached, source: 'cache' };
    }

    // Fallback to API (which will cache to Firebase)
    console.log('Fetching countries from API');
    const response = await api.get('/countries');
    return response.data;
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw error;
  }
};

/**
 * Fetch cities - Firebase cache first, then API
 */
export const fetchCities = async (countryCode) => {
  try {
    // Try Firebase cache first
    const cached = await getCachedCities(countryCode);
    if (cached) {
      console.log(`Using cached cities for ${countryCode} from Firebase`);
      return { CityList: cached, source: 'cache' };
    }

    // Fallback to API (which will cache to Firebase)
    console.log(`Fetching cities for ${countryCode} from API`);
    const response = await api.post('/cities', { countryCode });
    return response.data;
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw error;
  }
};

/**
 * Fetch hotels - Firebase cache first, then API
 */
export const fetchHotels = async (cityCode) => {
  try {
    // Try Firebase cache first
    const cached = await getCachedHotels(cityCode);
    if (cached) {
      console.log(`Using cached hotels for city ${cityCode} from Firebase`);
      return { Hotels: cached, source: 'cache' };
    }

    // Fallback to API (which will cache to Firebase)
    console.log(`Fetching hotels for city ${cityCode} from API`);
    const response = await api.post('/hotels', { cityCode });
    return response.data;
  } catch (error) {
    console.error('Error fetching hotels:', error);
    throw error;
  }
};

/**
 * Fetch hotel details - Firebase cache first, then API
 * Returns null if unable to fetch from any source
 */
export const fetchHotelDetails = async (hotelCode) => {
  try {
    // Try Firebase cache first
    // const cached = await getCachedHotelDetails(hotelCode);
    // if (cached) {
    //   console.log(`Using cached hotel details for ${hotelCode} from Firebase`);
    //   return { HotelDetails: [cached], source: 'cache' };
    // }

    // // Fallback to API (which will cache to Firebase)
    // console.log(`Fetching hotel details for ${hotelCode} from API`);
    const response = await api.post('/hotel-details', { hotelCode });

    // Check if API returned an error status
    if (response.data.Status && response.data.Status.Code !== 200) {
      console.warn(`TBO API returned error for hotel ${hotelCode}:`, response.data.Status.Description);
      return null;
    }
    console.log(response.data, 'response.data')
    return response.data;
  } catch (error) {
    console.error('Error fetching hotel details:', error.message || error);
    // Return null instead of throwing - caller can handle fallback
    return null;
  }
};


/**
 * Search hotels - ALWAYS calls API for live pricing/availability
 * This should NEVER be cached as prices change frequently
 */
export const searchHotels = async (searchParams) => {
  try {
    console.log('Searching hotels (live pricing - no cache)');
    const response = await api.post('/search', searchParams);
    return response.data;
  } catch (error) {
    console.error('Error searching hotels:', error);
    throw error;
  }
};

/**
 * Fetch basic hotel info from cached hotel lists
 * Used as fallback when the TBO hotel details API fails
 */
export const fetchBasicHotelInfo = async (hotelCode) => {
  try {
    console.log(`Fetching basic hotel info for ${hotelCode} from cached hotel lists`);
    const response = await api.post('/hotel-basic-info', { hotelCode });
    return response.data;
  } catch (error) {
    console.error('Error fetching basic hotel info:', error.message || error);
    return null;
  }
};

export default api;