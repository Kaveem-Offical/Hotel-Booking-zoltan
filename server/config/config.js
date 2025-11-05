require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  tboApi: {
    baseUrl: process.env.TBO_API_BASE_URL || 'http://api.tbotechnology.in/TBOHolidays_HotelAPI',
    username: process.env.TBO_USERNAME,
    password: process.env.TBO_PASSWORD
  }
};
