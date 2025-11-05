import React, { useState, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { api } from '../services/api';

export function SearchBar({ onCitySelect }) {
  const { state, dispatch } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCities, setFilteredCities] = useState([]);

  useEffect(() => {
    // Fetch cities only once if not already in Redux
    if (state.cities.length === 0) {
      dispatch({ type: 'SET_LOADING', payload: true });
      api.getCityList()
        .then(data => {
          if (data.Status && data.Status.Code === 200) {
            dispatch({ type: 'SET_CITIES', payload: data.CityList });
          }
        })
        .catch(err => {
          console.error('Error fetching cities:', err);
          dispatch({ type: 'SET_ERROR', payload: err.message });
        })
        .finally(() => dispatch({ type: 'SET_LOADING', payload: false }));
    }
  }, [state.cities.length, dispatch]);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const filtered = state.cities
        .filter(city =>
          city.Name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5);
      setFilteredCities(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchTerm, state.cities]);

  const handleCitySelect = (city) => {
    setSearchTerm(city.Name);
    setShowSuggestions(false);
    onCitySelect(city);
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for cities in India (e.g., Bangalore, Delhi, Mumbai)"
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-lg"
        />
      </div>
      
      {showSuggestions && filteredCities.length > 0 && (
        <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          {filteredCities.map((city) => (
            <button
              key={city.Code}
              onClick={() => handleCitySelect(city)}
              className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-2 border-b last:border-b-0"
            >
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{city.Name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

