import React, { useState } from 'react';
import { Users, Loader2 } from 'lucide-react';
import DateRangePicker from './DateRangePicker';

export function SearchForm({ hotelCode, onSearch, loading }) {
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    adults: 2,
    children: 0,
    childrenAges: [],
    rooms: 1
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

  const handleChildrenChange = (e) => {
    const newChildrenCount = parseInt(e.target.value);
    setFormData(prev => {
      let newAges = [...(prev.childrenAges || [])];
      if (newChildrenCount > newAges.length) {
        newAges = [...newAges, ...Array(newChildrenCount - newAges.length).fill(5)];
      } else if (newChildrenCount < newAges.length) {
        newAges = newAges.slice(0, newChildrenCount);
      }
      return { ...prev, children: newChildrenCount, childrenAges: newAges };
    });
  };

  const handleChildAgeChange = (index, value) => {
    setFormData(prev => {
      const newAges = [...prev.childrenAges];
      newAges[index] = parseInt(value);
      return { ...prev, childrenAges: newAges };
    });
  };

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
      noOfRooms: Math.max(1, parseInt(formData.rooms)),
      paxRooms: Array.from({ length: Math.max(1, parseInt(formData.rooms)) }).map((_, index) => {
        const totalAdults = parseInt(formData.adults) || 2;
        const totalChildren = parseInt(formData.children) || 0;
        const rooms = Math.max(1, parseInt(formData.rooms));
        
        const baseAdults = Math.floor(totalAdults / rooms);
        const extraAdults = totalAdults % rooms;
        const adultsCount = baseAdults + (index < extraAdults ? 1 : 0);

        const baseChildren = Math.floor(totalChildren / rooms);
        const extraChildren = totalChildren % rooms;
        const childrenCount = baseChildren + (index < extraChildren ? 1 : 0);
        
        let ages = formData.childrenAges || [];
        // Ensure ages array has enough elements
        if (ages.length < totalChildren) {
          ages = [...ages, ...Array(totalChildren - ages.length).fill(5)];
        }
        
        const childAgesStart = index * baseChildren + Math.min(index, extraChildren);
        const childAgesEnd = childAgesStart + childrenCount;
        
        // Ensure we pass integers
        const assignedAges = ages.slice(childAgesStart, childAgesEnd).map(age => parseInt(age) || 5);
        
        return {
            Adults: Math.max(1, adultsCount),
            Children: childrenCount,
            ChildrenAges: assignedAges
        };
      }),
      isDetailedResponse: true
    };

    onSearch(searchParams);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Check Availability & Prices</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Dates</label>
          <DateRangePicker
            checkInDate={formData.checkIn}
            checkOutDate={formData.checkOut}
            onCheckInChange={(val) => setFormData({ ...formData, checkIn: val })}
            onCheckOutChange={(val) => setFormData({ ...formData, checkOut: val })}
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
            Children (0-17 yrs)
          </label>
          <select
            value={formData.children}
            onChange={handleChildrenChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[0, 1, 2, 3, 4].map(num => (
              <option key={num} value={num}>{num} {num === 1 ? 'Child' : 'Children'}</option>
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

      {formData.children > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Child Ages</label>
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: formData.children }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Child {idx + 1}:</span>
                <select
                  value={formData.childrenAges[idx] || 5}
                  onChange={(e) => handleChildAgeChange(idx, e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded-md text-sm outline-none bg-white"
                >
                  {[...Array(18)].map((_, i) => (
                    <option key={i} value={i}>{i} {i === 1 ? 'yr' : 'yrs'}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
