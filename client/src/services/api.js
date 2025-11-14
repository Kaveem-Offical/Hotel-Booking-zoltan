import axios from 'axios';

const API_BASE = '/api/hotels';

export const api = {
  getCountryList: async () => {
    const response = await axios.get(`${API_BASE}/countries`);
    return response.data;
  },

  getCityList: async (countryCode = 'IN') => {
    const response = await axios.post(`${API_BASE}/cities`, { 
      countryCode 
    });
    return response.data;
  },

  getHotelCodeList: async (cityCode) => {
    const response = await axios.post(`${API_BASE}/hotels`, { 
      cityCode 
    });
    return response.data;
  },

  getHotelDetails: async (hotelCode) => {
    const response = await axios.post(`${API_BASE}/hotel-details`, { 
      hotelCode,
      language: 'EN',
      isRoomDetailRequired: true
    });
    return response.data;
  },

  searchHotel: async (searchParams) => {
    const response = await axios.post(`${API_BASE}/search`, searchParams);
    return response.data;
  }
};