import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Star, ThumbsUp, Wifi, Car, Coffee, Utensils, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const HotelCard = ({ hotel, onSelect }) => {
  const navigate = useNavigate();
  const { currentUser, isHotelLiked, likeHotel, unlikeHotel } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  // Helper to handle missing data
  const getVal = (val, fallback = "NA") => (val !== undefined && val !== null && val !== "") ? val : fallback;

  // Helper to parse StarRating
  const parseStars = (rating) => {
    if (!rating) return 0;
    if (typeof rating === 'number') return rating;
    if (typeof rating === 'string') {
      const lower = rating.toLowerCase();
      if (lower.includes('one')) return 1;
      if (lower.includes('two')) return 2;
      if (lower.includes('three')) return 3;
      if (lower.includes('four')) return 4;
      if (lower.includes('five')) return 5;
      const num = parseInt(rating);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };

  // Map API data to UI props
  const name = getVal(hotel.HotelName || hotel.name);
  const image = getVal(hotel.HotelPicture || hotel.image, "https://cdn6.agoda.net/images/MVC/default/background_image/illustrations/bg-agoda-homepage.png");
  const stars = parseStars(hotel.StarRating || hotel.stars);
  const location = getVal(hotel.HotelAddress || hotel.location);
  const description = getVal(hotel.HotelDescription || hotel.description, "");
  const distance = getVal(hotel.distance, "Distance NA");
  const rating = getVal(hotel.Rating || hotel.rating);
  const ratingText = getVal(hotel.ratingText, "Rating NA");
  const reviews = getVal(hotel.reviews, "0");

  // Amenities mapping
  const amenitiesList = hotel.Facilities || hotel.amenities;
  const amenities = Array.isArray(amenitiesList) && amenitiesList.length > 0 ? amenitiesList : ["Amenities NA"];

  // Room info
  // The API response structure for rooms is hotel.Rooms[0]
  const roomData = hotel.Rooms?.[0] || {};
  const roomType = getVal(roomData.Name?.[0] || hotel.roomType);

  // Price handling
  // API structure: hotel.Rooms[0].TotalFare or hotel.Rooms[0].DayRates[0][0].BasePrice
  const totalFare = roomData.TotalFare;
  const originalPrice = totalFare ? Math.round(totalFare) : "NA";

  // If we have a price, we can try to show a discount if applicable, or just show the price.
  // The prompt asked for "real data", so if no discount info is in API, we shouldn't fake it.
  // However, to keep the UI looking similar, we can show just the price.
  const finalPrice = originalPrice;
  const discount = 0; // No discount data in provided API response example

  const freeCancellation = roomData.IsRefundable === true;
  const mealPlan = getVal(roomData.MealType, "Meal Plan NA");

  const tax = roomData.TotalTax ? Math.round(roomData.TotalTax) : "NA";

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row overflow-hidden cursor-pointer group mb-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect && onSelect(hotel)}
    >
      {/* Image Section */}
      <div className="relative w-full md:w-[300px] h-[200px] md:h-auto flex-shrink-0 bg-gray-200 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => { e.target.src = "https://cdn6.agoda.net/images/MVC/default/background_image/illustrations/bg-agoda-homepage.png"; }}
        />
        <button
          className={`absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors z-10 ${likeLoading ? 'opacity-50 cursor-wait' : ''
            } ${isHotelLiked(hotel.HotelCode) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
          onClick={async (e) => {
            e.stopPropagation();
            if (!currentUser) {
              // Redirect to sign in if not logged in
              navigate('/signin');
              return;
            }
            if (likeLoading) return;
            setLikeLoading(true);
            try {
              const hotelCode = hotel.HotelCode;
              if (isHotelLiked(hotelCode)) {
                await unlikeHotel(hotelCode);
              } else {
                // Save essential hotel data for profile display
                await likeHotel(hotelCode, {
                  HotelCode: hotelCode,
                  HotelName: name,
                  HotelPicture: image,
                  HotelAddress: location,
                  StarRating: hotel.StarRating,
                  Rating: rating,
                  TotalFare: originalPrice,
                });
              }
            } catch (err) {
              console.error('Error toggling like:', err);
            } finally {
              setLikeLoading(false);
            }
          }}
          disabled={likeLoading}
          aria-label={isHotelLiked(hotel.HotelCode) ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`w-5 h-5 ${isHotelLiked(hotel.HotelCode) ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
            -{discount}% TODAY
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col md:flex-row p-4 gap-4">

        {/* Info Column */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                {name}
              </h3>
              <div className="flex items-center mt-1">
                <div className="flex text-yellow-400 mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < stars ? 'fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                  {stars > 0 ? `${stars}-Star` : "Rating NA"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center text-blue-600 text-sm font-medium mt-1">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="underline hover:text-blue-800 line-clamp-1" title={location}>{location}</span>
            {/* <span className="text-gray-500 no-underline ml-2 text-xs">• {distance}</span> */}
          </div>

          {/* Description (Truncated) */}
          {description && (
            <p className="text-xs text-gray-500 line-clamp-2 mt-1">
              {description.replace(/<[^>]*>?/gm, '')} {/* Simple HTML strip */}
            </p>
          )}

          {/* Amenities */}
          <div className="flex flex-wrap gap-2 mt-2">
            {amenities.slice(0, 4).map((amenity, idx) => (
              <div key={idx} className="flex items-center text-xs text-gray-600 border border-gray-200 rounded px-2 py-1">
                {typeof amenity === 'string' && amenity.includes('WiFi') && <Wifi className="w-3 h-3 mr-1" />}
                {typeof amenity === 'string' && amenity.includes('Parking') && <Car className="w-3 h-3 mr-1" />}
                {typeof amenity === 'string' && amenity.includes('Breakfast') && <Coffee className="w-3 h-3 mr-1" />}
                {typeof amenity === 'string' && amenity.includes('Restaurant') && <Utensils className="w-3 h-3 mr-1" />}
                {typeof amenity === 'string' && !amenity.match(/WiFi|Parking|Breakfast|Restaurant/) && <ThumbsUp className="w-3 h-3 mr-1" />}
                {amenity}
              </div>
            ))}
          </div>

          {/* Room & Badges */}
          <div className="mt-auto pt-3 border-t border-dashed border-gray-200">
            <p className="text-sm font-bold text-gray-700 line-clamp-1">{roomType}</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {freeCancellation && (
                <span className="text-xs text-green-700 font-medium flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1.5"></span>
                  Free cancellation
                </span>
              )}
              <span className="text-xs text-green-700 font-medium flex items-center">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1.5"></span>
                {mealPlan}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Column */}
        <div className="w-full md:w-48 flex flex-col justify-between border-l border-gray-100 md:pl-4">

          {/* Rating Badge */}
          <div className="flex items-center justify-end mb-4">
            <div className="text-right mr-2">
              <div className="text-sm font-bold text-gray-800">{ratingText}</div>
              <div className="text-xs text-gray-500">{reviews} reviews</div>
            </div>
            <div className="bg-blue-600 text-white font-bold text-lg p-2 rounded-lg shadow-sm flex items-center justify-center w-10 h-10">
              {rating !== "NA" ? rating : "-"}
            </div>
          </div>

          {/* Price Info */}
          <div className="text-right mt-auto">
            {discount > 0 && (
              <div className="text-xs text-red-500 font-bold bg-red-50 inline-block px-2 py-0.5 rounded mb-1">
                SAVE {discount}%
              </div>
            )}
            {/* Only show original price if there is a discount, otherwise it's confusing */}
            {discount > 0 && (
              <div className="text-gray-400 text-sm line-through decoration-red-500">
                ₹ {originalPrice}
              </div>
            )}

            <div className="text-3xl font-bold text-gray-800 leading-none">
              {finalPrice !== "NA" ? `₹ ${finalPrice}` : "Price NA"}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {tax !== "NA" ? `+ ₹ ${tax} taxes & fees` : "+ Taxes & fees NA"}
            </div>

            <button className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow hover:shadow-md transition-all flex items-center justify-center gap-1 group-hover:translate-y-[-2px]">
              View Deals <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
