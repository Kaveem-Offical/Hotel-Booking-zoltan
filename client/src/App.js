import React, { useState, useCallback } from 'react';
import { Loader2, Hotel } from 'lucide-react';
import { useAppContext } from './context/AppContext';
import { SearchBar } from './components/SearchBar';
import { HotelCard } from './components/HotelCard';
import { HotelDetails } from './components/HotelDetails';
import { api } from './services/api';
import logo from './assets/logo.png';

function App() {
  const { state, dispatch } = useAppContext();
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [loadingHotels, setLoadingHotels] = useState(false);

  const handleCitySelect = useCallback((city) => {
    setSelectedCity(city);
    setSelectedHotel(null);

    if (!state.hotels[city.Code]) {
      setLoadingHotels(true);
      api.getHotelCodeList(city.Code)
        .then(data => {
          if (data.Status && data.Status.Code === 200) {
            dispatch({ 
              type: 'SET_HOTELS', 
              cityCode: city.Code,
              payload: data.Hotels || []
            });
          }
        })
        .catch(err => {
          console.error('Error fetching hotels:', err);
          dispatch({ type: 'SET_ERROR', payload: err.message });
        })
        .finally(() => setLoadingHotels(false));
    }
  }, [state.hotels, dispatch]);

  const handleHotelClick = (hotel) => {
    setSelectedHotel(hotel);
  };

  const handleBack = () => {
    setSelectedHotel(null);
  };

  const currentHotels = selectedCity ? state.hotels[selectedCity.Code] || [] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img src = {logo} />
          </div>
        </header>

        {!selectedHotel ? (
          <>
            <div className="flex justify-center mb-8">
              <SearchBar onCitySelect={handleCitySelect} />
            </div>

            {state.loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Loading...</span>
              </div>
            )}

            {loadingHotels && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-3" />
                <p className="text-gray-600 text-lg">Finding hotels in {selectedCity?.Name}...</p>
              </div>
            )}

            {selectedCity && !loadingHotels && currentHotels.length > 0 && (
              <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Hotels in {selectedCity.Name}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {currentHotels.length} {currentHotels.length === 1 ? 'hotel' : 'hotels'} found
                  </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {currentHotels.map((hotel) => (
                    <HotelCard 
                      key={hotel.HotelCode} 
                      hotel={hotel}
                      onClick={handleHotelClick}
                    />
                  ))}
                </div>
              </div>
            )}

            {selectedCity && !loadingHotels && currentHotels.length === 0 && (
              <div className="text-center py-16 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
                <Hotel className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No hotels found in {selectedCity.Name}</p>
                <p className="text-gray-500 text-sm mt-2">Try searching for a different city</p>
              </div>
            )}
          </>
        ) : (
          <HotelDetails hotel={selectedHotel} onBack={handleBack} />
        )}
      </div>
    </div>
  );
}

export default App;
