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

// Create axios instance with basic auth for search/booking endpoints
const createSearchAxiosInstance = () => {
  return axios.create({
    headers: {
      'Content-Type': 'application/json'
    },
    auth: config.tboApi.apiAuth
  });
};

// Get city list by country code - Firebase first, then TBO API
exports.getCityList = async (req, res) => {
  try {
    const { countryCode } = req.body;

    if (!countryCode) {
      return res.status(400).json({ error: 'Country code is required' });
    }

    console.log(`Fetching cities for country: ${countryCode}`);

    // Check Firebase cache first
    const cachedCities = await firebaseService.getCities(countryCode);
    if (cachedCities) {
      console.log(`Returning ${cachedCities.length} cities from Firebase cache`);
      return res.json({ CityList: cachedCities, source: 'cache' });
    }

    // If not in cache, fetch from TBO API
    console.log('Cities not in cache, fetching from TBO API...');
    const axiosInstance = createStaticAxiosInstance();
    const response = await axiosInstance.post(
      `${config.tboApi.baseUrl}/CityList`,
      { CountryCode: countryCode }
    );

    // Save to Firebase cache
    if (response.data.CityList && response.data.CityList.length > 0) {
      await firebaseService.saveCities(countryCode, response.data.CityList);
    }

    console.log(`Cities fetched: ${response.data.CityList?.length || 0} cities`);
    res.json({ ...response.data, source: 'api' });
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

// Get hotel code list by city code - Firebase first, then TBO API
exports.getHotelCodeList = async (req, res) => {
  try {
    const { cityCode } = req.body;

    if (!cityCode) {
      return res.status(400).json({ error: 'City code is required' });
    }

    console.log(`Fetching hotels for city code: ${cityCode}`);

    // Check Firebase cache first
    const cachedHotels = await firebaseService.getHotels(cityCode);
    if (cachedHotels) {
      console.log(`Returning ${cachedHotels.length} hotels from Firebase cache`);
      return res.json({ Hotels: cachedHotels, source: 'cache' });
    }

    // If not in cache, fetch from TBO API
    console.log('Hotels not in cache, fetching from TBO API...');
    const axiosInstance = createStaticAxiosInstance();
    const response = await axiosInstance.post(
      `${config.tboApi.baseUrl}/TBOHotelCodeList`,
      { CityCode: cityCode }
    );

    // Save to Firebase cache
    if (response.data.Hotels && response.data.Hotels.length > 0) {
      await firebaseService.saveHotels(cityCode, response.data.Hotels);
    }

    console.log(`Hotels fetched: ${response.data.Hotels?.length || 0} hotels`);
    res.json({ ...response.data, source: 'api' });
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

// Get hotel details by hotel code - Firebase first, then TBO API
exports.getHotelDetails = async (req, res) => {
  try {
    const { hotelCode, language = 'EN', isRoomDetailRequired = true } = req.body;

    if (!hotelCode) {
      return res.status(400).json({ error: 'Hotel code is required' });
    }

    console.log(`Fetching details for hotel code: ${hotelCode}`);

    // Check Firebase cache first
    const cachedDetails = await firebaseService.getHotelDetails(hotelCode);
    if (cachedDetails) {
      console.log(`Returning hotel details from Firebase cache`);
      return res.json({ HotelDetails: [cachedDetails], source: 'cache' });
    }

    // If not in cache, fetch from TBO API
    console.log('Hotel details not in cache, fetching from TBO API...');
    const axiosInstance = createStaticAxiosInstance();
    const response = await axiosInstance.post(
      `${config.tboApi.baseUrl}/Hoteldetails`,
      {
        Hotelcodes: hotelCode,
        Language: language,
        IsRoomDetailRequired: isRoomDetailRequired
      }
    );

    // Save to Firebase cache
    if (response.data.HotelDetails && response.data.HotelDetails.length > 0) {
      for (const hotel of response.data.HotelDetails) {
        await firebaseService.saveHotelDetails(hotel.HotelCode, hotel);
      }
    }

    console.log(`Hotel details fetched for: ${hotelCode}`);
    res.json({ ...response.data, source: 'api' });
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

// Get basic hotel info from cached hotel lists (fallback when details API fails)
exports.getBasicHotelInfo = async (req, res) => {
  try {
    const { hotelCode } = req.body;

    if (!hotelCode) {
      return res.status(400).json({ error: 'Hotel code is required' });
    }

    console.log(`Looking up basic hotel info for: ${hotelCode}`);

    // Search for hotel in cached city hotel lists
    const hotelInfo = await firebaseService.findHotelByCode(hotelCode);

    if (hotelInfo) {
      console.log(`Found basic hotel info for ${hotelCode}`);
      return res.json({
        HotelInfo: hotelInfo,
        source: 'cache',
        isBasicInfo: true
      });
    }

    // If not found in cache
    console.log(`Hotel ${hotelCode} not found in cached hotel lists`);
    res.status(404).json({
      error: 'Hotel not found in cache',
      message: 'This hotel is not available in our cached data'
    });
  } catch (error) {
    console.error('Basic hotel info error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch basic hotel info',
      message: error.message
    });
  }
};

// Search hotel availability with pricing - ALWAYS hits TBO API (dynamic data)
exports.searchHotel = async (req, res) => {
  try {
    const {
      checkIn,
      checkOut,
      hotelCodes,
      guestNationality = 'IN',
      noOfRooms = 0,
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

    console.log(`\n=== Hotel Search Request (LIVE - No Cache) ===`);
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

    // Use Basic Auth with API credentials - ALWAYS call TBO API for live pricing
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
      console.log('Hotels found:', response.data.HotelResult.length);

      // Async: Save hotel names for search suggestions
      try {
        response.data.HotelResult.forEach(hotel => {
          if (hotel.HotelName && hotel.HotelCode) {
            firebaseService.saveHotelNameMapping(
              hotel.HotelName,
              hotel.HotelCode,
              hotel.Address || ''
            ).catch(err => console.error('Bg save name error:', err.message));
          }
        });
      } catch (err) {
        console.error('Error initiating bg save:', err);
      }

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

// Get country list - Firebase first, then TBO API
exports.getCountryList = async (req, res) => {
  try {
    console.log('Fetching country list');

    // Check Firebase cache first
    const cachedCountries = await firebaseService.getCountries();
    if (cachedCountries) {
      console.log(`Returning ${cachedCountries.length} countries from Firebase cache`);
      return res.json({ CountryList: cachedCountries, source: 'cache' });
    }

    // If not in cache, fetch from TBO API
    console.log('Countries not in cache, fetching from TBO API...');
    const axiosInstance = createStaticAxiosInstance();
    const response = await axiosInstance.get(`${config.tboApi.baseUrl}/CountryList`);

    // Save to Firebase cache
    if (response.data.CountryList && response.data.CountryList.length > 0) {
      await firebaseService.saveCountries(response.data.CountryList);
    }

    console.log('Country list fetched');
    res.json({ ...response.data, source: 'api' });
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

// PreBook hotel - Validates availability and returns final pricing
exports.preBookHotel = async (req, res) => {
  try {
    const { BookingCode } = req.body;

    if (!BookingCode) {
      return res.status(400).json({ error: 'BookingCode is required' });
    }

    console.log(`\n=== Hotel PreBook Request ===`);
    console.log(`BookingCode: ${BookingCode}`);

    const axiosInstance = createSearchAxiosInstance();

    const response = await axiosInstance.post(
      config.tboApi.preBookUrl,
      { BookingCode }
    );

    console.log('PreBook Response Status:', response.data.Status);

    if (response.data.Status && response.data.Status.Code !== 200) {
      return res.status(400).json({
        error: 'PreBook failed',
        message: response.data.Status.Description,
        details: response.data
      });
    }

    res.json(response.data);
  } catch (error) {
    console.error('\n=== PreBook Error ===');
    console.error('Error Message:', error.message);

    if (error.response) {
      console.error('Status Code:', error.response.status);
      console.error('Error Data:', JSON.stringify(error.response.data, null, 2));

      return res.status(error.response.status).json({
        error: 'Hotel prebook failed',
        message: error.response.data?.Status?.Description || error.message,
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to prebook hotel',
      message: error.message
    });
  }
};

// Book hotel - Finalizes the booking with guest details
exports.bookHotel = async (req, res) => {
  try {
    const {
      EndUserIp,
      BookingCode,
      GuestNationality,
      IsVoucherBooking = false,
      NetAmount,
      HotelRoomsDetails,
      IsPackageFare = false,
      IsPackageDetailsMandatory = false,
      ArrivalTransport
    } = req.body;

    // Validation
    if (!BookingCode || !GuestNationality || !NetAmount || !HotelRoomsDetails) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['BookingCode', 'GuestNationality', 'NetAmount', 'HotelRoomsDetails']
      });
    }

    console.log(`\n=== Hotel Book Request ===`);
    console.log(`BookingCode: ${BookingCode}`);
    console.log(`GuestNationality: ${GuestNationality}`);
    console.log(`NetAmount: ${NetAmount}`);
    console.log(`Rooms: ${HotelRoomsDetails.length}`);

    const bookRequest = {
      EndUserIp: EndUserIp || req.ip || '127.0.0.1',
      BookingCode,
      GuestNationality,
      IsVoucherBooking,
      NetAmount,
      HotelRoomsDetails,
      IsPackageFare,
      IsPackageDetailsMandatory
    };

    // Add arrival transport if provided
    if (ArrivalTransport) {
      bookRequest.ArrivalTransport = ArrivalTransport;
    }

    console.log('Book Request Body:', JSON.stringify(bookRequest, null, 2));

    const axiosInstance = createSearchAxiosInstance();

    const response = await axiosInstance.post(
      config.tboApi.bookUrl,
      bookRequest
    );

    console.log('Book Response Status:', response.data.Status);

    if (response.data.Status && response.data.Status.Code !== 200) {
      return res.status(400).json({
        error: 'Booking failed',
        message: response.data.Status.Description,
        details: response.data
      });
    }

    res.json(response.data);
  } catch (error) {
    console.error('\n=== Book Error ===');
    console.error('Error Message:', error.message);

    if (error.response) {
      console.error('Status Code:', error.response.status);
      console.error('Error Data:', JSON.stringify(error.response.data, null, 2));

      return res.status(error.response.status).json({
        error: 'Hotel booking failed',
        message: error.response.data?.Status?.Description || error.message,
        details: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to book hotel',
      message: error.message
    });
  }
};

// Fetch and cache hotel card info for search results
// This fetches images, amenities, rating, reviews from TBO Hotel Details API for hotels missing cached info
exports.fetchAndCacheHotelCardInfo = async (req, res) => {
  try {
    const { hotelCodes } = req.body;

    if (!hotelCodes || !Array.isArray(hotelCodes) || hotelCodes.length === 0) {
      return res.status(400).json({ error: 'hotelCodes array is required' });
    }

    console.log(`\n=== Fetch Hotel Card Info Request ===`);
    console.log(`Requested info for ${hotelCodes.length} hotels`);

    // Step 1: Get already cached hotel card info
    const cachedInfo = await firebaseService.getHotelCardInfoBatch(hotelCodes);

    // Step 2: Find which hotels are missing info
    const missingCodes = await firebaseService.getMissingHotelCardInfoCodes(hotelCodes);

    if (missingCodes.length === 0) {
      console.log('All hotel card info found in cache');
      return res.json({
        hotelInfo: cachedInfo,
        source: 'cache',
        fetchedCount: 0
      });
    }

    console.log(`Fetching info for ${missingCodes.length} hotels from TBO API`);

    // Step 3: Fetch info in batches to avoid rate limiting
    const BATCH_SIZE = 5;
    const DELAY_MS = 100;
    const newInfo = {};

    for (let i = 0; i < missingCodes.length; i += BATCH_SIZE) {
      const batch = missingCodes.slice(i, i + BATCH_SIZE);
      const hotelCodesString = batch.join(',');

      try {
        console.log(`Fetching batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} hotels`);

        const axiosInstance = createStaticAxiosInstance();
        const response = await axiosInstance.post(
          `${config.tboApi.baseUrl}/Hoteldetails`,
          {
            Hotelcodes: hotelCodesString,
            Language: 'EN',
            IsRoomDetailRequired: false
          }
        );

        // Extract full hotel card info from response
        if (response.data.HotelDetails && Array.isArray(response.data.HotelDetails)) {
          for (const hotel of response.data.HotelDetails) {
            const hotelCode = hotel.HotelCode;

            // Extract image
            let imageUrl = null;
            if (hotel.Images && Array.isArray(hotel.Images) && hotel.Images.length > 0) {
              imageUrl = hotel.Images[0];
            } else if (hotel.HotelPicture) {
              imageUrl = hotel.HotelPicture;
            }

            // Extract amenities/facilities
            let amenities = [];
            if (hotel.HotelFacilities && Array.isArray(hotel.HotelFacilities)) {
              amenities = hotel.HotelFacilities.slice(0, 10); // Limit to 10 amenities
            } else if (hotel.Facilities && Array.isArray(hotel.Facilities)) {
              amenities = hotel.Facilities.slice(0, 10);
            }

            // Extract rating info
            const rating = hotel.HotelRating || hotel.Rating || null;
            const reviews = hotel.ReviewCount || hotel.Reviews || 0;
            const ratingText = hotel.RatingText || (rating >= 4.5 ? 'Excellent' : rating >= 4 ? 'Very Good' : rating >= 3.5 ? 'Good' : rating ? 'Fair' : null);

            // Extract description
            const description = hotel.Description || hotel.HotelDescription || null;

            // Build hotel card info object
            const hotelCardInfo = {
              imageUrl,
              amenities,
              rating,
              reviews,
              ratingText,
              description
            };

            newInfo[hotelCode] = hotelCardInfo;

            // Save to Firebase cache asynchronously
            firebaseService.saveHotelCardInfo(hotelCode, hotelCardInfo).catch(err => {
              console.error(`Failed to cache info for ${hotelCode}:`, err.message);
            });
          }
        }

        // Small delay between batches to avoid rate limiting
        if (i + BATCH_SIZE < missingCodes.length) {
          await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        }
      } catch (batchError) {
        console.error(`Error fetching batch starting at ${i}:`, batchError.message);
        // Continue with next batch even if one fails
      }
    }

    // Merge cached info with newly fetched info
    const allInfo = { ...cachedInfo, ...newInfo };

    console.log(`Fetch complete. Cached: ${Object.keys(cachedInfo).length}, New: ${Object.keys(newInfo).length}`);

    res.json({
      hotelInfo: allInfo,
      source: 'mixed',
      cachedCount: Object.keys(cachedInfo).length,
      fetchedCount: Object.keys(newInfo).length
    });
  } catch (error) {
    console.error('Fetch hotel card info error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch hotel card info',
      message: error.message
    });
  }
};

// Search hotel names (Auto-complete)
exports.searchHotelNames = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.json({ suggestions: [] });
    }

    const suggestions = await firebaseService.searchHotelNames(query);
    res.json({ suggestions });
  } catch (error) {
    console.error('Search hotel names error:', error.message);
    res.status(500).json({
      error: 'Failed to search hotel names',
      message: error.message
    });
  }
};