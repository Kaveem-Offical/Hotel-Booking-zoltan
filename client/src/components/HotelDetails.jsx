import React, { useState, useEffect } from 'react';
import { ChevronLeft, MapPin, Phone, Mail, Globe, Star, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { api } from '../services/api';

export function HotelDetails({ hotel, onBack }) {
  const { state, dispatch } = useAppContext();
  const [loading, setLoading] = useState(false);
  const hotelCode = hotel.HotelCode;
  const details = state.hotelDetails[hotelCode];

  useEffect(() => {
    // Fetch hotel details only if not already in Redux
    if (!details) {
      setLoading(true);
      api.getHotelDetails(hotelCode)
        .then(data => {
          if (data.Status && data.Status.Code === 200 && data.HotelDetails && data.HotelDetails.length > 0) {
            dispatch({ 
              type: 'SET_HOTEL_DETAILS', 
              hotelCode,
              payload: data.HotelDetails[0]
            });
          }
        })
        .catch(err => {
          console.error('Error fetching hotel details:', err);
          dispatch({ type: 'SET_ERROR', payload: err.message });
        })
        .finally(() => setLoading(false));
    }
  }, [hotelCode, details, dispatch]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
        <p className="text-gray-600">Loading hotel details...</p>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Hotel details not available</p>
        <button
          onClick={onBack}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          ← Back to Hotels
        </button>
      </div>
    );
  }

  const stars = details.HotelRating || 0;

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Hotels
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {details.Images && details.Images.length > 0 && (
          <img 
            src={details.Images[0]} 
            alt={details.HotelName}
            className="w-full h-64 object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-800">{details.HotelName}</h1>
            {stars > 0 && (
              <div className="flex items-center gap-1">
                {[...Array(stars)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-700">{details.Address}</p>
                <p className="text-sm text-gray-500">
                  {details.CityName}, {details.CountryName}
                  {details.PinCode && ` - ${details.PinCode}`}
                </p>
              </div>
            </div>

            {details.PhoneNumber && (
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-gray-400" />
                <a href={`tel:${details.PhoneNumber}`} className="text-blue-600 hover:underline">
                  {details.PhoneNumber}
                </a>
              </div>
            )}

            {details.Email && (
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-400" />
                <a href={`mailto:${details.Email}`} className="text-blue-600 hover:underline">
                  {details.Email}
                </a>
              </div>
            )}

            {details.HotelWebsiteUrl && (
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-gray-400" />
                <a 
                  href={details.HotelWebsiteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Visit Website
                </a>
              </div>
            )}
          </div>

          {details.Description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">About</h2>
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: details.Description }}
              />
            </div>
          )}

          {details.HotelFacilities && details.HotelFacilities.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Facilities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {details.HotelFacilities.map((facility, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span>{facility}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

