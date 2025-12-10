import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSearchBar from '../components/HeroSearchBar';
import FilterSidebar from '../components/FilterSidebar';
import HotelCard from '../components/HotelCard';
import { searchHotels, fetchHotels } from '../services/api';

function HomePage() {
    const [hotels, setHotels] = useState([]);
    const [staticHotelsMap, setStaticHotelsMap] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        priceRange: { min: 0, max: 50000 },
        starRating: [],
        guestRating: [],
        propertyType: [],
        amenities: [],
        mealPlans: [],
        cancellation: [],
        payment: []
    });

    const navigate = useNavigate();

    const handleSearch = async (searchData) => {
        console.log('Search Data:', searchData);
        setLoading(true);
        setError(null);
        try {
            let hotelCodes = "1000,1001,1002"; // Default fallback
            let currentStaticMap = {};

            // If cityCode is provided, fetch hotels for that city first
            if (searchData.cityCode) {
                try {
                    const hotelListResponse = await fetchHotels(searchData.cityCode);
                    if (hotelListResponse && hotelListResponse.Hotels && Array.isArray(hotelListResponse.Hotels)) {
                        // Create a map of HotelCode -> Hotel Details for fast lookup
                        const map = {};
                        hotelListResponse.Hotels.forEach(h => {
                            map[h.HotelCode] = h;
                        });
                        currentStaticMap = map;
                        setStaticHotelsMap(map);

                        // Extract hotel codes
                        const codes = hotelListResponse.Hotels.slice(0, 200).map(h => h.HotelCode).join(',');
                        if (codes) {
                            hotelCodes = codes;
                        }
                    }
                } catch (err) {
                    console.error('Failed to fetch hotel list for city:', err);
                }
            }

            // Construct API payload
            const payload = {
                checkIn: searchData.checkInDate || new Date().toISOString().split('T')[0],
                checkOut: searchData.checkOutDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
                hotelCodes: hotelCodes,
                guestNationality: "IN",
                noOfRooms: searchData.guests?.rooms || 1,
                paxRooms: [
                    {
                        Adults: searchData.guests?.adults || 2,
                        Children: searchData.guests?.children || 0,
                        ChildrenAges: searchData.guests?.childrenAges || []
                    }
                ]
            };

            const data = await searchHotels(payload);

            if (data.HotelResult && data.HotelResult.length > 0) {
                // Merge search results with static data
                const mergedHotels = data.HotelResult
                    .filter(result => result.Rooms && result.Rooms.length > 0)
                    .map(result => {
                        const staticData = currentStaticMap[result.HotelCode] || {};
                        return {
                            ...staticData, // Name, Address, Stars, etc. from /hotels
                            ...result,     // Price, Rooms, etc. from /search
                            // Ensure essential fields are present and correctly mapped
                            HotelName: staticData.HotelName || result.HotelName,
                            StarRating: staticData.HotelRating || staticData.StarRating || result.StarRating,
                            HotelAddress: staticData.Address || result.HotelAddress,
                            HotelPicture: staticData.HotelPicture || result.HotelPicture,
                            HotelDescription: staticData.Description || result.HotelDescription,
                            Latitude: staticData.Latitude || result.Latitude,
                            Longitude: staticData.Longitude || result.Longitude
                        };
                    });
                setHotels(mergedHotels);
            } else {
                setHotels([]);
                setError('No hotels found.');
            }
        } catch (err) {
            console.error('Search failed:', err);
            setError('Failed to fetch hotels. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        console.log('Filters:', newFilters);
    };

    // Apply filters
    const filteredHotels = hotels.filter(hotel => {
        // Price Filter
        const price = hotel.Rooms?.[0]?.TotalFare || 0;
        if (price < filters.priceRange.min || price > filters.priceRange.max) return false;

        // Star Rating Filter
        if (filters.starRating.length > 0) {
            const stars = parseInt(hotel.StarRating) || 0;
            if (!filters.starRating.includes(stars)) return false;
        }

        return true;
    });

    const handleHotelSelect = (hotel) => {
        // Navigate to details page with search params
        // We need to pass current search params (dates, guests)
        // For now, we'll just pass the ID and let the details page use defaults or state if we had a global store
        // Ideally, we should put search params in the URL query string
        const params = new URLSearchParams();
        // We don't have easy access to current search inputs here unless we store them in state
        // But we can pass what we have
        navigate(`/hotel/${hotel.HotelCode}?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <HeroSearchBar onSearch={handleSearch} />

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar */}
                    <div className="lg:w-72 flex-shrink-0">
                        <FilterSidebar
                            filters={filters}
                            onFilterChange={handleFilterChange}
                        />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">
                                {loading ? 'Searching...' : `Showing ${filteredHotels.length} properties`}
                            </h2>
                            <div className="text-gray-600">
                                Sort by: <span className="font-bold text-blue-600 cursor-pointer">Best Match</span>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                                <strong className="font-bold">Error: </strong>
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading && (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        )}

                        {/* Hotel Cards */}
                        {!loading && filteredHotels.map((hotel, index) => (
                            <HotelCard
                                key={hotel.HotelCode || index}
                                hotel={hotel}
                                onSelect={handleHotelSelect}
                            />
                        ))}

                        {!loading && filteredHotels.length === 0 && !error && (
                            <div className="text-center py-12 text-gray-500">
                                {hotels.length > 0 ? 'No hotels match your filters.' : 'Use the search bar to find hotels.'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
