import React, { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useAppContext } from './context/AppContext';
import { SearchBar } from './components/SearchBar';
import { HotelCard } from './components/HotelCard';
import { HotelDetails } from './components/HotelDetails';
import { api } from './services/api';

function App() {
  const { state, dispatch } = useAppContext();
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [loadingHotels, setLoadingHotels] = useState(false);

  const handleCitySelect = useCallback((city) => {
    setSelectedCity(city);
    setSelectedHotel(null);

    // Check if hotels for this city are already in Redux
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">TBO Hotels</h1>
          <p className="text-gray-600">Find the perfect hotel in India</p>
        </header>

        {!selectedHotel ? (
          <>
            <div className="flex justify-center mb-8">
              <SearchBar onCitySelect={handleCitySelect} />
            </div>

            {state.loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            )}

            {loadingHotels && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Loading hotels...</span>
              </div>
            )}

            {selectedCity && !loadingHotels && currentHotels.length > 0 && (
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                  Hotels in {selectedCity.Name}
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({currentHotels.length} hotels found)
                  </span>
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <div className="text-center py-12">
                <p className="text-gray-600">No hotels found in {selectedCity.Name}</p>
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
