const axios = require('axios');
const config = require('../config/config');

// Create axios instance with basic auth if credentials provided
const createAxiosInstance = () => {
  const axiosConfig = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  // Add basic auth if credentials are provided
  if (config.tboApi.username && config.tboApi.password) {
    axiosConfig.auth = {
      username: config.tboApi.username,
      password: config.tboApi.password
    };
  }

  return axios.create(axiosConfig);
};

// Get city list by country code
exports.getCityList = async (req, res) => {
  try {
    const { countryCode } = req.body;
    
    if (!countryCode) {
      return res.status(400).json({ error: 'Country code is required' });
    }

    console.log(`Fetching cities for country: ${countryCode}`);

    const axiosInstance = createAxiosInstance();
    const response = await axiosInstance.post(
      `${config.tboApi.baseUrl}/CityList`,
      { CountryCode: countryCode }
    );

    console.log(`Cities fetched successfully: ${response.data.CityList?.length || 0} cities`);
    res.json(response.data);
  } catch (error) {
    console.error('City list error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch city list',
      message: error.message,
      details: error.response?.data || null
    });
  }
};

// Get hotel code list by city code
exports.getHotelCodeList = async (req, res) => {
  try {
    const { cityCode } = req.body;
    
    if (!cityCode) {
      return res.status(400).json({ error: 'City code is required' });
    }

    console.log(`Fetching hotels for city code: ${cityCode}`);

    const axiosInstance = createAxiosInstance();
    const response = await axiosInstance.post(
      `${config.tboApi.baseUrl}/TBOHotelCodeList`,
      { CityCode: cityCode }
    );

    console.log(`Hotels fetched successfully: ${response.data.Hotels?.length || 0} hotels`);
    res.json(response.data);
  } catch (error) {
    console.error('Hotel code list error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch hotel list',
      message: error.message,
      details: error.response?.data || null
    });
  }
};

// Get hotel details by hotel code
exports.getHotelDetails = async (req, res) => {
  try {
    const { hotelCode, language = 'EN', isRoomDetailRequired = true } = req.body;
    
    if (!hotelCode) {
      return res.status(400).json({ error: 'Hotel code is required' });
    }

    console.log(`Fetching details for hotel code: ${hotelCode}`);

    const axiosInstance = createAxiosInstance();
    const response = await axiosInstance.post(
      `${config.tboApi.baseUrl}/Hoteldetails`,
      { 
        Hotelcodes: hotelCode,
        Language: language,
        IsRoomDetailRequired: isRoomDetailRequired
      }
    );

    console.log(`Hotel details fetched successfully for: ${hotelCode}`);
    res.json(response.data);
  } catch (error) {
    console.error('Hotel details error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch hotel details',
      message: error.message,
      details: error.response?.data || null
    });
  }
};

// Get country list
exports.getCountryList = async (req, res) => {
  try {
    console.log('Fetching country list');

    const axiosInstance = createAxiosInstance();
    const response = await axiosInstance.get(`${config.tboApi.baseUrl}/CountryList`);

    console.log('Country list fetched successfully');
    res.json(response.data);
  } catch (error) {
    console.error('Country list error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch country list',
      message: error.message,
      details: error.response?.data || null
    });
  }
};

