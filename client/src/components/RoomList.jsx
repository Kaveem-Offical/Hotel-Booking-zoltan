import React from 'react';
import { IndianRupee, CheckCircle, XCircle, Info, Tag, Calendar, UtensilsCrossed, AlertCircle } from 'lucide-react';

export function RoomList({ searchResults }) {
  if (!searchResults || !searchResults.Status) {
    return null;
  }

  // Handle "No rooms available" response
  if (searchResults.Status.Code === 201) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 text-center">
        <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-yellow-800 mb-2">
          No Available Rooms
        </h3>
        <p className="text-yellow-700">
          {searchResults.Status.Description || 'No rooms available for the selected dates. Please try different dates.'}
        </p>
      </div>
    );
  }

  // Handle other error codes
  if (searchResults.Status.Code !== 200) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center">
        <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-red-800 mb-2">
          Search Failed
        </h3>
        <p className="text-red-700">
          {searchResults.Status.Description || 'Something went wrong. Please try again.'}
        </p>
      </div>
    );
  }

  const hotelResult = searchResults.HotelResult?.[0];
  const rooms = hotelResult?.Rooms || [];

  if (rooms.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-8 text-center">
        <Info className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">No rooms found</p>
      </div>
    );
  }

  const getMealTypeLabel = (mealType) => {
    const mealTypes = {
      'Room_Only': 'Room Only',
      'BreakFast': 'Breakfast Included',
      'Breakfast_For_2': 'Breakfast for 2',
      'Breakfast_For_1': 'Breakfast for 1',
      'All_Inclusive_All_Meal': 'All Inclusive',
      'HalfBoard': 'Half Board',
      'FullBoard': 'Full Board'
    };
    return mealTypes[mealType] || mealType;
  };

  const formatCurrency = (amount, currency = 'INR') => {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
    return `${amount.toFixed(2)} ${currency}`;
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800">
          Available Rooms ({rooms.length})
        </h3>
        <div className="text-sm text-gray-500">
          Currency: {hotelResult.Currency || 'INR'}
        </div>
      </div>

      <div className="grid gap-6">
        {rooms.map((room, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
            {/* Room Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-800 mb-2">
                    {room.Name && room.Name.length > 0 ? room.Name[0] : 'Room'}
                  </h4>
                  
                  {room.Inclusion && (
                    <div className="flex items-start gap-2 text-sm text-gray-700 bg-white/50 rounded-lg p-2 mb-2">
                      <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                      <span>{room.Inclusion}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 mt-3">
                    {/* Refundable Badge */}
                    {room.IsRefundable ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        <CheckCircle className="w-3 h-3" />
                        Refundable
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                        <XCircle className="w-3 h-3" />
                        Non-refundable
                      </span>
                    )}

                    {/* Meal Type Badge */}
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                      <UtensilsCrossed className="w-3 h-3" />
                      {getMealTypeLabel(room.MealType)}
                    </span>

                    {/* Transfers Badge */}
                    {room.WithTransfers && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                        <CheckCircle className="w-3 h-3" />
                        Transfers Included
                      </span>
                    )}
                  </div>
                </div>

                {/* Price Section */}
                <div className="text-right bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-3xl font-bold text-blue-600 flex items-center justify-end">
                    <IndianRupee className="w-7 h-7" />
                    {room.TotalFare?.toLocaleString('en-IN')}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    + ₹{room.TotalTax?.toLocaleString('en-IN')} taxes
                  </div>
                  <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
                    Total: ₹{(room.TotalFare + room.TotalTax).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* Room Body */}
            <div className="p-6">
              {/* Promotions */}
              {room.RoomPromotion && room.RoomPromotion.length > 0 && (
                <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-green-700" />
                    <span className="font-semibold text-green-800">
                      {room.RoomPromotion.join(' • ').replace(/\|/g, '')}
                    </span>
                  </div>
                </div>
              )}

              {/* Day Rates */}
              {room.DayRates && room.DayRates.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Daily Rate Breakdown
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {room.DayRates[0]?.map((day, idx) => (
                      <div key={idx} className="bg-gray-50 rounded p-2 text-center">
                        <div className="text-xs text-gray-600">Day {idx + 1}</div>
                        <div className="text-sm font-semibold text-gray-800">
                          ₹{day.BasePrice?.toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cancellation Policies */}
              {room.CancelPolicies && room.CancelPolicies.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">
                    Cancellation Policy
                  </h5>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    {room.CancelPolicies.map((policy, idx) => (
                      <div key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span>
                          From <strong>{formatDate(policy.FromDate)}</strong>: 
                          {policy.ChargeType === 'Percentage' ? (
                            <span className="ml-1 font-semibold text-red-600">
                              {policy.CancellationCharge}% charge
                            </span>
                          ) : policy.CancellationCharge === 0 ? (
                            <span className="ml-1 font-semibold text-green-600">
                              Free cancellation
                            </span>
                          ) : (
                            <span className="ml-1 font-semibold text-red-600">
                              ₹{policy.CancellationCharge.toLocaleString('en-IN')} charge
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Supplements */}
              {room.Supplements && room.Supplements.length > 0 && room.Supplements[0]?.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">
                    Additional Charges
                  </h5>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 space-y-2">
                    {room.Supplements[0].map((supplement, idx) => (
                      <div key={idx} className="text-sm text-gray-700 flex justify-between items-center">
                        <span>
                          {supplement.Description} 
                          <span className="text-xs text-gray-500 ml-1">
                            ({supplement.Type === 'AtProperty' ? 'Pay at hotel' : 'Included'})
                          </span>
                        </span>
                        <span className="font-semibold">
                          {formatCurrency(supplement.Price, supplement.Currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Book Button */}
              <button
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl"
                onClick={() => alert(`Booking Code: ${room.BookingCode}\n\nBooking functionality coming soon!`)}
              >
                Book This Room
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
