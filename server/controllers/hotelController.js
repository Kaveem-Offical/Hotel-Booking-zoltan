const axios = require('axios');
const config = require('../config/config');

// Create axios instance with basic auth for static data endpoints
const createStaticAxiosInstance = () => {
  return axios.create({
    headers: {
      'Content-Type': 'application/json'
    },
    auth: config.tboApi.staticAuth
  });
};

// Create axios instance with basic auth for search/booking endpoints
const createSearchAxiosInstance = () => {
  return axios.create({
    headers: {
      'Content-Type': 'application/json'
    },
    auth: config.tboApi.apiAuth
  });
};

// Get city list by country code
exports.getCityList = async (req, res) => {
  try {
    const { countryCode } = req.body;
    
    if (!countryCode) {
      return res.status(400).json({ error: 'Country code is required' });
    }

    console.log(`Fetching cities for country: ${countryCode}`);

    const axiosInstance = createStaticAxiosInstance();
    const response = await axiosInstance.post(
      `${config.tboApi.baseUrl}/CityList`,
      { CountryCode: countryCode }
    );

    console.log(`Cities fetched: ${response.data.CityList?.length || 0} cities`);
    res.json(response.data);
  } catch (error) {
    console.error('City list error:', error.message);
    console.error('Error response:', error.response?.data);
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

    const axiosInstance = createStaticAxiosInstance();
    const response = await axiosInstance.post(
      `${config.tboApi.baseUrl}/TBOHotelCodeList`,
      { CityCode: cityCode }
    );

    console.log(`Hotels fetched: ${response.data.Hotels?.length || 0} hotels`);
    res.json(response.data);
  } catch (error) {
    console.error('Hotel code list error:', error.message);
    console.error('Error response:', error.response?.data);
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

    const axiosInstance = createStaticAxiosInstance();
    const response = await axiosInstance.post(
      `${config.tboApi.baseUrl}/Hoteldetails`,
      { 
        Hotelcodes: hotelCode,
        Language: language,
        IsRoomDetailRequired: isRoomDetailRequired
      }
    );

    console.log(`Hotel details fetched for: ${hotelCode}`);
    res.json(response.data);
  } catch (error) {
    console.error('Hotel details error:', error.message);
    console.error('Error response:', error.response?.data);
    res.status(500).json({ 
      error: 'Failed to fetch hotel details',
      message: error.message,
      details: error.response?.data || null
    });
  }
};

// Search hotel availability with pricing
exports.searchHotel = async (req, res) => {
  try {
    const { 
      checkIn, 
      checkOut, 
      hotelCodes,
      guestNationality = 'IN',
      noOfRooms = 1,
      paxRooms = [{ Adults: 2, Children: 0, ChildrenAges: [] }],
      isDetailedResponse = true
    } = req.body;

    // Validation
    if (!checkIn || !checkOut || !hotelCodes) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['checkIn', 'checkOut', 'hotelCodes']
      });
    }

    console.log(`\n=== Hotel Search Request ===`);
    console.log(`Hotel Codes: ${hotelCodes}`);
    console.log(`Check-in: ${checkIn}, Check-out: ${checkOut}`);
    console.log(`Rooms: ${noOfRooms}, Guests: ${JSON.stringify(paxRooms)}`);

    // Prepare search request - Match TBO documentation exactly
    const searchRequest = {
      CheckIn: checkIn,
      CheckOut: checkOut,
      HotelCodes: hotelCodes,
      GuestNationality: guestNationality,
      PaxRooms: paxRooms.map(room => ({
        Adults: room.Adults,
        Children: room.Children || 0,
        ChildrenAges: room.ChildrenAges || []
      })),
      ResponseTime: 23,
      IsDetailedResponse: isDetailedResponse,
      Filters: {
        Refundable: false,
        NoOfRooms: noOfRooms,
        MealType: 'All'
      }
    };

    console.log('Search Request Body:', JSON.stringify(searchRequest, null, 2));

    // Use Basic Auth with API credentials
    const axiosInstance = createSearchAxiosInstance();
    
    console.log('Sending request to:', config.tboApi.searchUrl);
    console.log('Using credentials:', config.tboApi.apiAuth.username);

    const response = await axiosInstance.post(
      config.tboApi.searchUrl,
      searchRequest
    );

    console.log('Search Response Status:', response.data.Status);
    console.log('Hotels in response:', response.data.HotelResult?.length || 0);
    
    if (response.data.HotelResult && response.data.HotelResult.length > 0) {
      const hotel = response.data.HotelResult[0];
      console.log('Rooms found:', hotel.Rooms?.length || 0);
    }

    res.json(response.data);
  } catch (error) {
    console.error('\n=== Search Error ===');
    console.error('Error Message:', error.message);
    
    if (error.response) {
      console.error('Status Code:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
      
      // Return the actual error from TBO
      return res.status(error.response.status).json({ 
        error: 'Hotel search failed',
        message: error.response.data?.Status?.Description || error.message,
        statusCode: error.response.data?.Status?.Code,
        details: error.response.data
      });
    }

    res.status(500).json({ 
      error: 'Failed to search hotel availability',
      message: error.message
    });
  }
};

// Get country list
exports.getCountryList = async (req, res) => {
  try {
    console.log('Fetching country list');

    const axiosInstance = createStaticAxiosInstance();
    const response = await axiosInstance.get(`${config.tboApi.baseUrl}/CountryList`);

    console.log('Country list fetched');
    res.json(response.data);
  } catch (error) {
    console.error('Country list error:', error.message);
    console.error('Error response:', error.response?.data);
    res.status(500).json({ 
      error: 'Failed to fetch country list',
      message: error.message,
      details: error.response?.data || null
    });
  }
};