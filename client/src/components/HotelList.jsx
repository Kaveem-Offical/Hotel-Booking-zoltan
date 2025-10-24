// src/components/HotelList.jsx
import React from 'react';

export default function HotelList({ hotels = [], loading, onSelect }) {
  if (loading) return <div className="p-4 bg-white rounded shadow">Loading hotels…</div>;
  if (!hotels || hotels.length === 0) return <div className="p-4 bg-white rounded shadow">No hotels found.</div>;

  return (
    <div className="space-y-3">
      {hotels.map(h => (
        <div key={h.HotelCode} className="bg-white p-4 rounded shadow hover:shadow-md cursor-pointer" onClick={() => onSelect(h.HotelCode)}>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-blue-600">{h.HotelName}</h3>
              <div className="text-xs text-gray-600 mt-1">{h.Address}</div>
              <div className="text-xs text-gray-500 mt-1">{h.CityName} • {h.CountryName}</div>
            </div>
            <div className="text-sm text-gray-700">{h.HotelRating}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
