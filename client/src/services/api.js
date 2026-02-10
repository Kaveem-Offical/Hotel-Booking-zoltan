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
      // console.log('Using cached countries from Firebase');
      return { CountryList: cached, source: 'cache' };
    }

    // Fallback to API (which will cache to Firebase)
    // console.log('Fetching countries from API');
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
      // console.log(`Using cached cities for ${countryCode} from Firebase`);
      return { CityList: cached, source: 'cache' };
    }

    // Fallback to API (which will cache to Firebase)
    // console.log(`Fetching cities for ${countryCode} from API`);
    const response = await api.post('/cities', { countryCode });
    return response.data;
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw error;
  }
};

/**
 * Search hotel names - Autocomplete from Firebase
 */
export const searchHotelNames = async (query) => {
  try {
    if (!query || query.length < 2) return { suggestions: [] };

    // // console.log(`Searching hotel names for: ${query}`);
    const response = await api.get(`/search-names?query=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching hotel names:', error);
    return { suggestions: [] };
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
      // console.log(`Using cached hotels for city ${cityCode} from Firebase`);
      return { Hotels: cached, source: 'cache' };
    }

    // Fallback to API (which will cache to Firebase)
    // console.log(`Fetching hotels for city ${cityCode} from API`);
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
    //   // console.log(`Using cached hotel details for ${hotelCode} from Firebase`);
    //   return { HotelDetails: [cached], source: 'cache' };
    // }

    // // Fallback to API (which will cache to Firebase)
    // // console.log(`Fetching hotel details for ${hotelCode} from API`);
    const response = await api.post('/hotel-details', { hotelCode });

    // Check if API returned an error status
    if (response.data.Status && response.data.Status.Code !== 200) {
      console.warn(`TBO API returned error for hotel ${hotelCode}:`, response.data.Status.Description);
      return null;
    }
    // console.log(response.data, 'response.data')
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
    // console.log('Searching hotels (live pricing - no cache)');
    const response = await api.post('/search', searchParams);
    return response.data;
  } catch (error) {
    console.error('Error searching hotels:', error);
    throw error;
  }
};

/**
 * Fetch hotel card info - Fetches and caches images, amenities, rating, reviews for hotels
 * Returns cached info for hotels that have it, fetches from TBO API for missing ones
 * @param {string[]} hotelCodes - Array of hotel codes to fetch info for
 * @returns {Object} { hotelInfo: { hotelCode: { imageUrl, amenities, rating, reviews, ... }, ... } }
 */
export const fetchHotelCardInfo = async (hotelCodes) => {
  try {
    // console.log(`Fetching card info for ${hotelCodes.length} hotels`);
    const response = await api.post('/hotel-card-info', { hotelCodes });
    return response.data;
  } catch (error) {
    console.error('Error fetching hotel card info:', error);
    // Return empty object on error - hotels will show placeholder/NA values
    return { hotelInfo: {}, source: 'error', cachedCount: 0, fetchedCount: 0 };
  }
};

/**
 * Fetch basic hotel info from cached hotel lists
 * Used as fallback when the TBO hotel details API fails
 */
export const fetchBasicHotelInfo = async (hotelCode) => {
  try {
    // console.log(`Fetching basic hotel info for ${hotelCode} from cached hotel lists`);
    const response = await api.post('/hotel-basic-info', { hotelCode });
    return response.data;
  } catch (error) {
    console.error('Error fetching basic hotel info:', error.message || error);
    return null;
  }
};

/**
 * PreBook hotel - Validates availability and returns final pricing
 * Call this before showing the checkout/guest details page
 */
export const preBookHotel = async (bookingCode) => {
  try {
    // console.log('PreBooking hotel with BookingCode:', bookingCode);
    const response = await api.post('/prebook', { BookingCode: bookingCode });
    return response.data;
  } catch (error) {
    console.error('Error prebooking hotel:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Book hotel - Finalizes the booking with guest details
 * @param {Object} bookingData - Contains BookingCode, GuestNationality, NetAmount, HotelRoomsDetails, etc.
 */
export const bookHotel = async (bookingData) => {
  console.log('Booking hotel with data:', bookingData);
  try {
    // console.log('Booking hotel with data:', bookingData);
    const response = await api.post('/book', bookingData);
    console.log('Booking hotel response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error booking hotel:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Create Razorpay payment order
 * @param {Object} orderData - Contains amount, bookingCode, guestNationality, hotelRoomsDetails, etc.
 */
export const createPaymentOrder = async (orderData) => {
  try {
    // console.log('Creating payment order:', orderData);
    const response = await axios.post('http://localhost:5000/api/payment/create-order', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating payment order:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Verify Razorpay payment and complete hotel booking
 * @param {Object} paymentData - Contains razorpay_order_id, razorpay_payment_id, razorpay_signature
 */
export const verifyPayment = async (paymentData) => {
  try {
    // console.log('Verifying payment:', paymentData);
    const response = await axios.post('http://localhost:5000/api/payment/verify', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error verifying payment:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get booking history
 * @param {Object} filters - Optional filters { email, phone }
 */
export const getBookingHistory = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const url = params ? `http://localhost:5000/api/payment/bookings?${params}` : 'http://localhost:5000/api/payment/bookings';
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching booking history:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get single booking details
 * @param {string} orderId - Razorpay order ID
 */
export const getBookingDetails = async (orderId) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/payment/bookings/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching booking details:', error.response?.data || error.message);
    throw error;
  }
};

export default api;