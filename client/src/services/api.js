import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/hotels';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchCountries = async () => {
  try {
    const response = await api.get('/countries');
    return response.data;
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw error;
  }
};

export const fetchCities = async (countryCode) => {
  try {
    const response = await api.post('/cities', { countryCode });
    return response.data;
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw error;
  }
};

export const fetchHotels = async (cityCode) => {
  try {
    const response = await api.post('/hotels', { cityCode });
    return response.data;
  } catch (error) {
    console.error('Error fetching hotels:', error);
    throw error;
  }
};

export const fetchHotelDetails = async (hotelCode) => {
  try {
    const response = await api.post('/hotel-details', { hotelCode });
    return response.data;
  } catch (error) {
    console.error('Error fetching hotel details:', error);
    throw error;
  }
};

export const searchHotels = async (searchParams) => {
  try {
    const response = await api.post('/search', searchParams);
    return response.data;
  } catch (error) {
    console.error('Error searching hotels:', error);
    throw error;
  }
};

export default api;