import React, { useState, useEffect } from 'react';
import { Search, MapPin, Globe } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { api } from '../services/api';

export function SearchBar({ onCitySelect }) {
  const { state, dispatch } = useAppContext();
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCities, setFilteredCities] = useState([]);
  const [countries, setCountries] = useState([]);

  // Fetch countries on mount
  useEffect(() => {
    if (countries.length === 0) {
      api.getCountryList()
        .then(data => {
          if (data.Status && data.Status.Code === 200) {
            setCountries(data.CountryList || []);
          }
        })
        .catch(err => console.error('Error fetching countries:', err));
    }
  }, [countries.length]);

  // Fetch cities when country changes
  useEffect(() => {
    const cacheKey = `cities_${selectedCountry}`;
    if (!state.cities[cacheKey]) {
      dispatch({ type: 'SET_LOADING', payload: true });
      api.getCityList(selectedCountry)
        .then(data => {
          if (data.Status && data.Status.Code === 200) {
            dispatch({ 
              type: 'SET_CITIES_BY_COUNTRY', 
              countryCode: selectedCountry,
              payload: data.CityList 
            });
          }
        })
        .catch(err => {
          console.error('Error fetching cities:', err);
          dispatch({ type: 'SET_ERROR', payload: err.message });
        })
        .finally(() => dispatch({ type: 'SET_LOADING', payload: false }));
    }
  }, [selectedCountry, state.cities, dispatch]);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const cacheKey = `cities_${selectedCountry}`;
      const citiesList = state.cities[cacheKey] || [];
      const filtered = citiesList
        .filter(city =>
          city.Name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 8);
      setFilteredCities(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchTerm, selectedCountry, state.cities]);

  const handleCitySelect = (city) => {
    setSearchTerm(city.Name);
    setShowSuggestions(false);
    onCitySelect(city);
  };

  const handleCountryChange = (e) => {
    setSelectedCountry(e.target.value);
    setSearchTerm('');
    setShowSuggestions(false);
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Country Selector */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="w-4 h-4 inline mr-1" />
              Select Country
            </label>
            <select
              value={selectedCountry}
              onChange={handleCountryChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-base"
            >
              <option value="">Select a country</option>
              {countries.map((country) => (
                <option key={country.Code} value={country.Code}>
                  {country.Name}
                </option>
              ))}
            </select>
          </div>

          {/* City Search */}
          <div className="md:col-span-2 relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Search City
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search cities in ${countries.find(c => c.Code === selectedCountry)?.Name || 'selected country'}...`}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-base"
                disabled={!selectedCountry}
              />
            </div>
            
            {showSuggestions && filteredCities.length > 0 && (
              <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-10 max-h-80 overflow-y-auto">
                {filteredCities.map((city) => (
                  <button
                    key={city.Code}
                    onClick={() => handleCitySelect(city)}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3 border-b last:border-b-0 transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-gray-800">{city.Name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}