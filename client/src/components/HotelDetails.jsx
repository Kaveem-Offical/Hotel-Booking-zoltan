// src/components/HotelDetails.jsx
import React from 'react';

export default function HotelDetails({ hotel, status }) {
  if (!hotel) {
    if (status === 'loading') return <div className="p-4 bg-white rounded shadow">Loading hotel details…</div>;
    return <div className="p-4 bg-white rounded shadow">No details loaded.</div>;
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-xl font-bold text-blue-600 mb-2">{hotel.HotelName}</h3>
      <div className="text-sm text-gray-700 mb-3" dangerouslySetInnerHTML={{ __html: hotel.Description || '' }} />
      <div className="text-sm text-gray-800"><strong>Address:</strong> {hotel.Address}</div>
      <div className="text-sm text-gray-800"><strong>Phone:</strong> {hotel.PhoneNumber}</div>
      <div className="text-sm text-gray-800"><strong>Rating:</strong> {hotel.HotelRating}</div>

      {hotel.Images && hotel.Images.length > 0 && (
        <img src={hotel.Images[0]} alt={hotel.HotelName} className="w-full mt-3 rounded" />
      )}

      {hotel.HotelFacilities && hotel.HotelFacilities.length > 0 && (
        <div className="mt-3">
          <h4 className="font-semibold">Facilities</h4>
          <ul className="list-disc ml-5 text-sm text-gray-700">
            {hotel.HotelFacilities.slice(0, 8).map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
