const USERNAME = 'TBOStaticAPITest';
const PASSWORD = 'Tbo@11530818';
const BASE64_AUTH = btoa(`${USERNAME}:${PASSWORD}`); // encode to Base64

const HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Basic ${BASE64_AUTH}`,
};


const USE_MOCK = false; // set false for real API

async function fetchCityList() {

  const res = await fetch('https://api.allorigins.win/raw?url=http://api.tbotechnology.in/TBOHolidays_HotelAPI/CityList', {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ CountryCode: 'IN' }),
  });
  if (!res.ok) throw new Error(`CityList API failed: ${res.status}`);
  return res.json();
}

async function fetchHotelCodeList({ CityCode }) {

  const res = await fetch('https://api.allorigins.win/raw?url=http://api.tbotechnology.in/TBOHolidays_HotelAPI/TBOHotelCodeList', {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ CityCode }),
  });
  if (!res.ok) throw new Error(`HotelCodeList API failed: ${res.status}`);
  return res.json();
}

async function fetchHotelDetails({ Hotelcodes }) {

  const res = await fetch('https://api.allorigins.win/raw?url=http://api.tbotechnology.in/TBOHolidays_HotelAPI/Hoteldetails', {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ Hotelcodes, Language: 'EN', IsRoomDetailRequired: true }),
  });
  if (!res.ok) throw new Error(`HotelDetails API failed: ${res.status}`);
  return res.json();
}
