# TBO Hotels Proxy Server

Node.js Express server that acts as a proxy for TBO Hotels API to avoid CORS issues.

## Setup Instructions

1. **Install dependencies:**
```bash
cd server
npm install
```

2. **Create `.env` file in server directory:**
```env
PORT=5000
TBO_API_BASE_URL=http://api.tbotechnology.in/TBOHolidays_HotelAPI

# Optional: Add if using Basic Authentication
# TBO_USERNAME=your_username
# TBO_PASSWORD=your_password
```

3. **Start the server:**
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

Server will run on: http://localhost:5000

## API Endpoints

All endpoints are prefixed with `/api/hotels`

### Health Check
```
GET /health
```
Returns server status

### Get Countries
```
GET /api/hotels/countries
```
Returns list of all countries

### Get Cities
```
POST /api/hotels/cities
Content-Type: application/json

{
  "countryCode": "IN"
}
```
Returns list of cities for the specified country

### Get Hotels by City
```
POST /api/hotels/hotels
Content-Type: application/json

{
  "cityCode": "130443"
}
```
Returns list of hotels in the specified city

### Get Hotel Details
```
POST /api/hotels/hotel-details
Content-Type: application/json

{
  "hotelCode": "1011646",
  "language": "EN",
  "isRoomDetailRequired": true
}
```
Returns detailed information about a specific hotel

## Testing with curl

### Test health endpoint:
```bash
curl http://localhost:5000/health
```

### Test city list:
```bash
curl -X POST http://localhost:5000/api/hotels/cities \
  -H "Content-Type: application/json" \
  -d '{"countryCode":"IN"}'
```

### Test hotel list:
```bash
curl -X POST http://localhost:5000/api/hotels/hotels \
  -H "Content-Type: application/json" \
  -d '{"cityCode":"130443"}'
```

### Test hotel details:
```bash
curl -X POST http://localhost:5000/api/hotels/hotel-details \
  -H "Content-Type: application/json" \
  -d '{"hotelCode":"1011646"}'
```

## Authentication

If the TBO API requires Basic Authentication:
1. Add your credentials to `.env` file:
   ```
   TBO_USERNAME=your_username
   TBO_PASSWORD=your_password
   ```
2. The server will automatically include them in requests to TBO API

## Troubleshooting

### Port already in use
If port 5000 is busy, change the PORT in `.env` file:
```
PORT=5001
```

### CORS issues
The server has CORS enabled for all origins. If you need to restrict:
Edit `server.js` and modify the cors configuration:
```javascript
app.use(cors({
  origin: 'http://localhost:3000'
}));
```

### API connection errors
1. Check if TBO API base URL is correct in `.env`
2. Verify your network connection
3. Check if authentication is required
4. Look at server logs for detailed error messages

## Project Structure
```
server/
├── config/
│   └── config.js           # Configuration and environment variables
├── controllers/
│   └── hotelController.js  # Business logic for hotel operations
├── routes/
│   └── hotelRoutes.js      # API route definitions
├── server.js               # Main server file
├── package.json            # Dependencies and scripts
├── .env                    # Environment variables (create this)
└── README.md              # This file
```

## Logs

The server logs all requests in the format:
```
[2025-10-25T10:30:00.000Z] POST /api/hotels/cities
```

Detailed operation logs:
```
Fetching cities for country: IN
Cities fetched successfully: 500 cities
```

## Development

To run in development mode with auto-reload:
```bash
npm install -g nodemon  # Install nodemon globally (one-time)
npm run dev
```

The server will automatically restart when you make changes to any `.js` files.

// ============================================================================
// FILE: ROOT README.md
// ============================================================================
# TBO Hotels Search Application

Full-stack application for searching and viewing hotels in India using TBO Hotels API.

## 📁 Project Structure

```
tbo-hotels-app/
├── client/                 # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── SearchBar.jsx
│   │   │   ├── HotelCard.jsx
│   │   │   └── HotelDetails.jsx
│   │   ├── context/
│   │   │   └── AppContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   └── index.css
│   └── package.json
│
├── server/                 # Node.js Express backend
│   ├── config/
│   │   └── config.js
│   ├── controllers/
│   │   └── hotelController.js
│   ├── routes/
│   │   └── hotelRoutes.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### 1. Setup Backend Server

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=5000
TBO_API_BASE_URL=http://api.tbotechnology.in/TBOHolidays_HotelAPI
EOF

# Start the server
npm start
```

Server will run on: http://localhost:5000

### 2. Setup Frontend Client

Open a **new terminal** window:

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start the development server
npm start
```

Client will run on: http://localhost:3000

## ✨ Features

### User Flow
1. **Search City** → Type city name (min 2 characters)
2. **View Hotels** → See all hotels in selected city
3. **Hotel Details** → Click on any hotel to view full details

### Technical Features
- ✅ **Smart Caching** - Redux-style state management
- ✅ **No Redundant API Calls** - Data cached after first fetch
- ✅ **Auto-suggestions** - Type "ra" → shows "Rajasthan"
- ✅ **CORS Solution** - Proxy server handles all API calls
- ✅ **Clean UI** - Responsive design with Tailwind CSS
- ✅ **Loading States** - Visual feedback during API calls
- ✅ **Error Handling** - Graceful error messages

## 🎯 API Flow

```
User Input → City Search
    ↓
Redux Check → If cached, use cached data
    ↓          If not cached, call API
Backend API → /api/hotels/cities (POST)
    ↓
TBO API → CityList endpoint
    ↓
Response → Store in Redux
    ↓
Display → Show city suggestions

City Selected → Fetch Hotels
    ↓
Redux Check → If cached, use cached data
    ↓          If not cached, call API
Backend API → /api/hotels/hotels (POST)
    ↓
TBO API → TBOHotelCodeList endpoint
    ↓
Response → Store in Redux
    ↓
Display → Show hotel cards

Hotel Clicked → Fetch Details
    ↓
Redux Check → If cached, use cached data
    ↓          If not cached, call API
Backend API → /api/hotels/hotel-details (POST)
    ↓
TBO API → Hoteldetails endpoint
    ↓
Response → Store in Redux
    ↓
Display → Show hotel details page
```

## 🔧 Configuration

### Backend (.env file)
```env
PORT=5000
TBO_API_BASE_URL=http://api.tbotechnology.in/TBOHolidays_HotelAPI

# Optional: Basic Authentication
# TBO_USERNAME=your_username
# TBO_PASSWORD=your_password
```

### Frontend (package.json)
```json
{
  "proxy": "http://localhost:5000"
}
```

## 📦 Tech Stack

### Frontend
- React 18
- Context API + useReducer (Redux-style)
- Axios (HTTP client)
- Tailwind CSS (via CDN)
- Lucide React (icons)

### Backend
- Node.js
- Express
- Axios
- CORS
- dotenv

## 🧪 Testing

### Test Backend API

```bash
# Health check
curl http://localhost:5000/health

# Get cities
curl -X POST http://localhost:5000/api/hotels/cities \
  -H "Content-Type: application/json" \
  -d '{"countryCode":"IN"}'

# Get hotels
curl -X POST http://localhost:5000/api/hotels/hotels \
  -H "Content-Type: application/json" \
  -d '{"cityCode":"130443"}'

# Get hotel details
curl -X POST http://localhost:5000/api/hotels/hotel-details \
  -H "Content-Type: application/json" \
  -d '{"hotelCode":"1011646"}'
```

## 🐛 Troubleshooting

### CORS Errors
- Ensure backend server is running on port 5000
- Check `proxy` setting in `client/package.json`
- Verify CORS is enabled in `server/server.js`

### Port Already in Use
Backend:
```bash
# Change PORT in server/.env
PORT=5001
```

Frontend:
```bash
# React will prompt to use another port automatically
```

### API Not Responding
1. Check backend server logs
2. Verify TBO API base URL in `.env`
3. Test TBO API directly with curl/Postman
4. Check if Basic Auth is required

### Cities/Hotels Not Loading
1. Open browser console (F12)
2. Check Network tab for failed requests
3. Verify backend server is running
4. Check backend server logs for errors

## 📝 Development Notes

### State Management
- Uses Context API + useReducer (Redux pattern)
- State structure:
  ```javascript
  {
    cities: [],              // All cities (fetched once)
    hotels: {                // Hotels by city code
      "130443": [...]
    },
    hotelDetails: {          // Hotel details by hotel code
      "1011646": {...}
    },
    loading: false,
    error: null
  }
  ```

### API Optimization
- Cities: Fetched once on app load
- Hotels: Fetched per city, cached by city code
- Details: Fetched per hotel, cached by hotel code
- All subsequent requests use cached data

## 📄 License

This project is for demonstration purposes.

## 👥 Support

For issues or questions:
1. Check the troubleshooting section
2. Review server logs
3. Test API endpoints with curl/Postman
4. Verify environment variables

---

**Made for client demonstration** 🎉
