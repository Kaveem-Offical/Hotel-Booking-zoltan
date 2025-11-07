import React from 'react';
import { IndianRupee, CheckCircle, XCircle, Info } from 'lucide-react';

export function RoomList({ searchResults }) {
  if (!searchResults || !searchResults.HotelResult || searchResults.HotelResult.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-600">No rooms available for selected dates</p>
      </div>
    );
  }

  const hotelResult = searchResults.HotelResult[0];
  const rooms = hotelResult.Rooms || [];

  if (rooms.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-600">No rooms available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">
        Available Rooms ({rooms.length})
      </h3>

      {rooms.map((room, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                {room.Name && room.Name.length > 0 ? room.Name.join(', ') : 'Room'}
              </h4>
              
              {room.Inclusion && (
                <p className="text-sm text-gray-600 mb-2">
                  <Info className="w-4 h-4 inline mr-1" />
                  {room.Inclusion}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1">
                  {room.IsRefundable ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Refundable</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-red-600">Non-refundable</span>
                    </>
                  )}
                </div>

                {room.MealType && (
                  <div className="text-gray-700">
                    <strong>Meal:</strong> {room.MealType.replace(/_/g, ' ')}
                  </div>
                )}

                {room.WithTransfers && (
                  <div className="text-green-600">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Transfers Included
                  </div>
                )}
              </div>
            </div>

            <div className="text-right ml-4">
              <div className="text-2xl font-bold text-blue-600 flex items-center">
                <IndianRupee className="w-6 h-6" />
                {room.TotalFare?.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-gray-500">
                + ₹{room.TotalTax?.toLocaleString('en-IN')} taxes
              </div>
              {room.RecommendedSellingRate && (
                <div className="text-xs text-gray-500 mt-1">
                  Min. selling: ₹{room.RecommendedSellingRate}
                </div>
              )}
            </div>
          </div>

          {room.CancelPolicies && room.CancelPolicies.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <h5 className="text-sm font-semibold text-gray-700 mb-2">Cancellation Policy</h5>
              <div className="space-y-1">
                {room.CancelPolicies.map((policy, idx) => (
                  <div key={idx} className="text-xs text-gray-600">
                    From {new Date(policy.FromDate).toLocaleDateString()}: 
                    <span className="font-medium ml-1">
                      {policy.ChargeType === 'Percentage' ? `${policy.CancellationCharge}%` : `₹${policy.CancellationCharge}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {room.RoomPromotion && room.RoomPromotion.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded p-3 mt-4">
              <p className="text-sm text-green-800">
                <strong>Promotion:</strong> {room.RoomPromotion.join(', ')}
              </p>
            </div>
          )}

          <button
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => alert('Booking functionality coming soon!')}
          >
            Book This Room
          </button>
        </div>
      ))}
    </div>
  );
}