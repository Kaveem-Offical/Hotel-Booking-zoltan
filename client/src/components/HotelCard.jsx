import React from 'react';
import { MapPin, Star } from 'lucide-react';

export function HotelCard({ hotel, onClick }) {
  const getStarCount = (rating) => {
    if (rating === 'FiveStar' || rating === 5) return 5;
    if (rating === 'FourStar' || rating === 4) return 4;
    if (rating === 'ThreeStar' || rating === 3) return 3;
    if (rating === 'TwoStar' || rating === 2) return 2;
    if (rating === 'OneStar' || rating === 1) return 1;
    return 0;
  };

  const stars = getStarCount(hotel.HotelRating);

  return (
    <button
      onClick={() => onClick(hotel)}
      className="w-full bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-4 text-left border border-gray-100"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg text-gray-800 pr-2">{hotel.HotelName}</h3>
        {stars > 0 && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {[...Array(stars)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
        )}
      </div>
      
      <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span className="line-clamp-2">{hotel.Address}</span>
      </div>
      
      <div className="text-xs text-gray-500">
        {hotel.CityName}, {hotel.CountryName}
      </div>
    </button>
  );
}
