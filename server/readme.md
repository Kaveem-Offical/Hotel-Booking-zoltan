# TBO Hotels Proxy Server

## Setup Instructions

1. Install dependencies:
```bash
cd server
npm install
```

2. Create `.env` file in server directory with your credentials:
```
PORT=5000
TBO_API_BASE_URL=http://api.tbotechnology.in/TBOHolidays_HotelAPI
TBO_AUTH_URL=http://Sharedapi.tektravels.com/SharedData.svc/rest
TBO_CLIENT_ID=ApiIntegrationNew
TBO_USERNAME=your_username_here
TBO_PASSWORD=your_password_here
TBO_END_USER_IP=your_server_ip_here
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

- GET `/health` - Health check
- GET `/api/hotels/countries` - Get country list
- POST `/api/hotels/cities` - Get city list (body: { countryCode: "IN" })
- POST `/api/hotels/hotels` - Get hotel list (body: { cityCode: "130443" })
- POST `/api/hotels/hotel-details` - Get hotel details (body: { hotelCode: "1011646" })
- POST `/api/hotels/search` - Search hotels (requires authentication)
