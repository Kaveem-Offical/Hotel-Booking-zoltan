import React, { useState } from 'react';
import { Calendar, Users, Loader2 } from 'lucide-react';

export function SearchForm({ hotelCode, onSearch, loading }) {
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    adults: 2,
    children: 0,
    rooms: 0
  });

  // Set default dates (today and tomorrow)
  React.useEffect(() => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);

    setFormData(prev => ({
      ...prev,
      checkIn: tomorrow.toISOString().split('T')[0],
      checkOut: dayAfter.toISOString().split('T')[0]
    }));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate dates
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      alert('Check-in date cannot be in the past');
      return;
    }

    if (checkOutDate <= checkInDate) {
      alert('Check-out date must be after check-in date');
      return;
    }

    const searchParams = {
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      hotelCodes: hotelCode.toString(),
      guestNationality: 'IN',
      noOfRooms: parseInt(formData.rooms),
      paxRooms: Array(parseInt(formData.rooms)).fill({
        Adults: parseInt(formData.adults),
        Children: parseInt(formData.children),
        ChildrenAges: []
      }),
      isDetailedResponse: true
    };

    onSearch(searchParams);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Check Availability & Prices</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="w-4 h-4 inline mr-1" />
            Check-in
          </label>
          <input
            type="date"
            value={formData.checkIn}
            onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="w-4 h-4 inline mr-1" />
            Check-out
          </label>
          <input
            type="date"
            value={formData.checkOut}
            onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
            min={formData.checkIn}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Users className="w-4 h-4 inline mr-1" />
            Adults
          </label>
          <select
            value={formData.adults}
            onChange={(e) => setFormData({ ...formData, adults: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
              <option key={num} value={num}>{num} {num === 1 ? 'Adult' : 'Adults'}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rooms
          </label>
          <select
            value={formData.rooms}
            onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[1, 2, 3, 4].map(num => (
              <option key={num} value={num}>{num} {num === 1 ? 'Room' : 'Rooms'}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Searching...
          </>
        ) : (
          'Search Availability'
        )}
      </button>
    </form>
  );
}
