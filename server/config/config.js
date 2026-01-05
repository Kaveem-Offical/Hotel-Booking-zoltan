require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  tboApi: {
    baseUrl: process.env.TBO_API_BASE_URL || 'http://api.tbotechnology.in/TBOHolidays_HotelAPI',
    searchUrl: process.env.TBO_SEARCH_URL || 'https://affiliate.tektravels.com/HotelAPI/Search',
    preBookUrl: process.env.TBO_PREBOOK_URL || 'https://affiliate.tektravels.com/HotelAPI/PreBook',
    bookUrl: process.env.TBO_BOOK_URL || 'https://affiliate.tektravels.com/HotelAPI/Book',
    // Static data endpoints credentials
    staticAuth: {
      username: process.env.TBO_STATIC_USERNAME || 'TBOStaticAPITest',
      password: process.env.TBO_STATIC_PASSWORD || 'Tbo@11530818'
    },
    // Search/Prebook/Book endpoints credentials
    apiAuth: {
      username: process.env.TBO_API_USERNAME,
      password: process.env.TBO_API_PASSWORD
    }
  }
};
