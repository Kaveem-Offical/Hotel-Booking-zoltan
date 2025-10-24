// src/components/SearchBar.jsx
import React, { useState, useMemo } from 'react';

/**
 * props:
 *  - cities: array of { Code, Name }
 *  - onCitySelect: function(city)
 */
export default function SearchBar({ cities = [], onCitySelect }) {
  const [text, setText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    if (!text) return [];
    const q = text.toLowerCase();
    // match anywhere in name; also allow partial word starts
    return cities
      .filter(c => c.Name && c.Name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [text, cities]);

  const handleSelect = (c) => {
    setText(c.Name);
    setShowSuggestions(false);
    onCitySelect(c);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // If there's an exact match, pick it; if there's at least one suggestion, pick first
    const exact = cities.find(c => c.Name.toLowerCase() === text.trim().toLowerCase());
    if (exact) return handleSelect(exact);
    if (suggestions.length > 0) return handleSelect(suggestions[0]);
    alert('City not found. Try typing something else or wait for list to load.');
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl">
      <div className="relative">
        <input
          className="w-full p-3 rounded-lg border bg-white"
          placeholder="Search city (country = India). Try 'ra' for Rajasthan or 'bang' for Bangalore"
          value={text}
          onChange={(e) => { setText(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(()=>setShowSuggestions(false), 150)}
        />
        <button className="absolute right-2 top-2 bg-blue-600 text-white px-3 py-1 rounded">Search</button>
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-20 bg-white w-full mt-12 rounded shadow max-h-60 overflow-auto">
            {suggestions.map(s => (
              <div
                key={s.Code}
                className="p-3 hover:bg-gray-100 cursor-pointer"
                onMouseDown={() => handleSelect(s)}
              >
                <div className="text-sm font-medium text-gray-800">{s.Name}</div>
                <div className="text-xs text-gray-500">Code: {s.Code}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}
