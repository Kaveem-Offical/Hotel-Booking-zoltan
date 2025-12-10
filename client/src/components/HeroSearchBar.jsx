import React, { useState, useEffect, useRef } from 'react';
import { Search, Calendar, User, MapPin, Minus, Plus, ChevronDown } from 'lucide-react';
import { fetchCities } from '../services/api';

const HeroSearchBar = ({ onSearch }) => {
  const [destination, setDestination] = useState('');
  const [selectedCityCode, setSelectedCityCode] = useState(null);
  const [cityList, setCityList] = useState([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [checkInDate, setCheckInDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });

  const [guests, setGuests] = useState({
    rooms: 1,
    adults: 2,
    children: 0,
    childrenAges: []
  });
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);

  const dropdownRef = useRef(null);
  const cityInputRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowGuestDropdown(false);
      }
      if (cityInputRef.current && !cityInputRef.current.contains(event.target)) {
        setShowCityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch cities on input change (debounced)
  useEffect(() => {
    const getCities = async () => {
      if (destination.length > 1) {
        try {
          const data = await fetchCities('IN'); // Defaulting to IN as per prompt example
          if (data && data.CityList && Array.isArray(data.CityList)) {
            const filtered = data.CityList.filter(city =>
              city.Name.toLowerCase().includes(destination.toLowerCase())
            );
            setCityList(filtered.slice(0, 10)); // Limit results
            setShowCityDropdown(true);
          }
        } catch (error) {
          console.error("Failed to fetch cities", error);
        }
      } else {
        setCityList([]);
        setShowCityDropdown(false);
      }
    };

    const timeoutId = setTimeout(getCities, 300);
    return () => clearTimeout(timeoutId);
  }, [destination]);

  const handleGuestChange = (type, operation) => {
    setGuests(prev => {
      const newGuests = { ...prev };
      if (type === 'rooms') {
        newGuests.rooms = operation === 'inc' ? Math.min(prev.rooms + 1, 4) : Math.max(prev.rooms - 1, 1);
      } else if (type === 'adults') {
        newGuests.adults = operation === 'inc' ? Math.min(prev.adults + 1, 8) : Math.max(prev.adults - 1, 1);
      } else if (type === 'children') {
        const newCount = operation === 'inc' ? Math.min(prev.children + 1, 4) : Math.max(prev.children - 1, 0);
        newGuests.children = newCount;
        if (newCount > prev.childrenAges.length) {
          newGuests.childrenAges = [...prev.childrenAges, 0];
        } else if (newCount < prev.childrenAges.length) {
          newGuests.childrenAges = prev.childrenAges.slice(0, newCount);
        }
      }
      return newGuests;
    });
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch({
        destination,
        cityCode: selectedCityCode,
        checkInDate,
        checkOutDate,
        guests
      });
    }
  };

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: 'url("https://cdn6.agoda.net/images/MVC/default/background_image/illustrations/bg-agoda-homepage.png")' }}>
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative z-10 w-full max-w-5xl px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-2">
            HOTELS, RESORTS, HOSTELS & MORE
          </h1>
          <p className="text-xl text-white drop-shadow-md">
            Get the best prices on 2,000,000+ properties, worldwide
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-2 flex flex-col md:flex-row gap-2 items-center">

          {/* Destination Search */}
          <div className="relative flex-1 w-full md:w-auto" ref={cityInputRef}>
            <div className="flex items-center px-4 py-3 border border-gray-200 rounded-xl hover:border-gray-400 transition-colors cursor-text" onClick={() => cityInputRef.current.querySelector('input').focus()}>
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <div className="flex-1">
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    setSelectedCityCode(null); // Reset code on manual edit
                  }}
                  placeholder="Enter a destination or property"
                  className="w-full outline-none text-gray-800 font-medium placeholder-gray-400"
                />
              </div>
            </div>

            {showCityDropdown && cityList.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                {cityList.map((city) => (
                  <div
                    key={city.Code}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center transition-colors"
                    onClick={() => {
                      setDestination(city.Name);
                      setSelectedCityCode(city.Code);
                      setShowCityDropdown(false);
                    }}
                  >
                    <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-700">{city.Name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Date Picker */}
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <div className="flex items-center px-4 py-3 border border-gray-200 rounded-xl hover:border-gray-400 transition-colors bg-white relative group w-full md:w-40">
              <Calendar className="w-5 h-5 text-gray-400 mr-3 group-hover:text-blue-500 transition-colors" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium">Check-in</span>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="outline-none text-gray-800 font-bold text-sm w-full bg-transparent p-0"
                />
              </div>
            </div>

            <div className="flex items-center px-4 py-3 border border-gray-200 rounded-xl hover:border-gray-400 transition-colors bg-white relative group w-full md:w-40">
              <Calendar className="w-5 h-5 text-gray-400 mr-3 group-hover:text-blue-500 transition-colors" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium">Check-out</span>
                <input
                  type="date"
                  value={checkOutDate}
                  min={checkInDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="outline-none text-gray-800 font-bold text-sm w-full bg-transparent p-0"
                />
              </div>
            </div>
          </div>

          {/* Guest Selector */}
          <div className="relative w-full md:w-auto" ref={dropdownRef}>
            <div
              className="flex items-center px-4 py-3 border border-gray-200 rounded-xl hover:border-gray-400 transition-colors cursor-pointer bg-white w-full md:w-64"
              onClick={() => setShowGuestDropdown(!showGuestDropdown)}
            >
              <User className="w-5 h-5 text-gray-400 mr-3" />
              <div className="flex flex-col flex-1">
                <span className="text-gray-800 font-bold text-sm">
                  {guests.adults} Adults, {guests.children} Children
                </span>
                <span className="text-xs text-gray-500">
                  {guests.rooms} Room{guests.rooms > 1 ? 's' : ''}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showGuestDropdown ? 'rotate-180' : ''}`} />
            </div>

            {showGuestDropdown && (
              <div className="absolute top-full right-0 mt-2 w-full md:w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-6 z-50">
                {/* Rooms */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-gray-700 font-medium">Rooms</span>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleGuestChange('rooms', 'dec')}
                      disabled={guests.rooms <= 1}
                      className="p-2 rounded-full border border-gray-200 hover:border-blue-500 hover:text-blue-500 disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-gray-400 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-4 text-center font-bold text-gray-800">{guests.rooms}</span>
                    <button
                      onClick={() => handleGuestChange('rooms', 'inc')}
                      disabled={guests.rooms >= 4}
                      className="p-2 rounded-full border border-gray-200 hover:border-blue-500 hover:text-blue-500 disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-gray-400 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Adults */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-gray-700 font-medium">Adults</span>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleGuestChange('adults', 'dec')}
                      disabled={guests.adults <= 1}
                      className="p-2 rounded-full border border-gray-200 hover:border-blue-500 hover:text-blue-500 disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-gray-400 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-4 text-center font-bold text-gray-800">{guests.adults}</span>
                    <button
                      onClick={() => handleGuestChange('adults', 'inc')}
                      disabled={guests.adults >= 8}
                      className="p-2 rounded-full border border-gray-200 hover:border-blue-500 hover:text-blue-500 disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-gray-400 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col">
                    <span className="text-gray-700 font-medium">Children</span>
                    <span className="text-xs text-gray-400">Ages 0-17</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleGuestChange('children', 'dec')}
                      disabled={guests.children <= 0}
                      className="p-2 rounded-full border border-gray-200 hover:border-blue-500 hover:text-blue-500 disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-gray-400 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-4 text-center font-bold text-gray-800">{guests.children}</span>
                    <button
                      onClick={() => handleGuestChange('children', 'inc')}
                      disabled={guests.children >= 4}
                      className="p-2 rounded-full border border-gray-200 hover:border-blue-500 hover:text-blue-500 disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-gray-400 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
          >
            <span className="text-lg">SEARCH</span>
          </button>

        </div>
      </div>
    </div>
  );
};

export default HeroSearchBar;
