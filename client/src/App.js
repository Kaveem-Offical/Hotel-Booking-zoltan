// src/App.jsx
import React, { useEffect, useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './store';
import { loadCityList } from './store/slices/citiesSlice';
import { loadHotelsForCity } from './store/slices/hotelsSlice';
import { loadHotelDetails } from './store/slices/hotelDetailsSlice';
import SearchBar from './components/SearchBar';
import HotelList from './components/HotelList';
import HotelDetails from './components/HotelDetails';

function MainApp() {
  const dispatch = useDispatch();
  const cities = useSelector(s => s.cities.list);
  const citiesStatus = useSelector(s => s.cities.status);
  const hotelsByCity = useSelector(s => s.hotels.byCity);
  const hotelDetailsByCode = useSelector(s => s.hotelDetails.byCode);

  const [selectedCity, setSelectedCity] = useState(null); // { Code, Name }
  const [selectedHotelCode, setSelectedHotelCode] = useState(null);

  useEffect(() => {
    if (citiesStatus === 'idle') dispatch(loadCityList());
  }, [citiesStatus, dispatch]);

  const handleCityChosen = async (city) => {
    setSelectedCity(city);
    setSelectedHotelCode(null);

    if (!hotelsByCity[city.Code]) {
      // not in redux -> fetch
      dispatch(loadHotelsForCity(city.Code));
    }
  };

  const handleHotelClick = (hotelCode) => {
    setSelectedHotelCode(hotelCode);
    if (!hotelDetailsByCode[hotelCode]) {
      dispatch(loadHotelDetails({ hotelCode }));
    }
  };

  const hotelsForSelectedCity = selectedCity ? (hotelsByCity[selectedCity.Code]?.list || []) : [];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <h1 className="text-2xl font-bold text-blue-600 mb-6">TBO Hotels Demo (Redux cached)</h1>

      <SearchBar
        cities={cities}
        onCitySelect={handleCityChosen}
      />

      {!selectedCity && (
        <p className="mt-6 text-gray-600">Search a city (country fixed to India) to list hotels.</p>
      )}

      {selectedCity && (
        <>
          <div className="mt-6 mb-4">
            <button
              className="text-sm text-blue-600 hover:underline"
              onClick={() => { setSelectedCity(null); setSelectedHotelCode(null); }}
            >
              ← Change city
            </button>
            <h2 className="text-lg font-semibold mt-2">{selectedCity.Name}</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <HotelList
                hotels={hotelsForSelectedCity}
                loading={hotelsByCity[selectedCity.Code]?.status === 'loading'}
                onSelect={handleHotelClick}
              />
            </div>

            <div>
              {selectedHotelCode ? (
                <HotelDetails
                  hotel={hotelDetailsByCode[selectedHotelCode]?.data}
                  status={hotelDetailsByCode[selectedHotelCode]?.status}
                />
              ) : (
                <div className="p-4 bg-white rounded shadow">Click a hotel card to view details</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Provider store={store}>
      <MainApp />
    </Provider>
  );
}
