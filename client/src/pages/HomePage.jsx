import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSearchBar from '../components/HeroSearchBar';
import FilterSidebar from '../components/FilterSidebar';
import HotelCard from '../components/HotelCard';
import { searchHotels, fetchHotels, fetchHotelCardInfo } from '../services/api';

const CHUNK_SIZE = 100; // Number of hotel codes per API request

function HomePage() {
    const [hotels, setHotels] = useState([]);
    const [staticHotelsMap, setStaticHotelsMap] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
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

    // Pagination state
    const [allHotelCodes, setAllHotelCodes] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [searchParams, setSearchParams] = useState(null);
    const [currentStaticMap, setCurrentStaticMap] = useState({});

    // Ref for infinite scroll sentinel
    const sentinelRef = useRef(null);

    const navigate = useNavigate();

    // Function to search hotels for a specific chunk of hotel codes
    const searchHotelChunk = useCallback(async (codes, searchData, staticMap, appendResults = false) => {
        if (codes.length === 0) {
            setHasMore(false);
            return [];
        }

        const payload = {
            checkIn: searchData.checkInDate || new Date().toISOString().split('T')[0],
            checkOut: searchData.checkOutDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
            hotelCodes: codes.join(','),
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
            // Extract hotel codes from search results to fetch card info
            const resultHotelCodes = data.HotelResult
                .filter(result => result.Rooms && result.Rooms.length > 0)
                .map(result => String(result.HotelCode));

            // Fetch card info for these hotels (images, amenities, rating, reviews)
            let hotelCardInfo = {};
            if (resultHotelCodes.length > 0) {
                try {
                    const cardInfoResponse = await fetchHotelCardInfo(resultHotelCodes);
                    hotelCardInfo = cardInfoResponse.hotelInfo || {};
                    console.log(`Loaded hotel card info: ${Object.keys(hotelCardInfo).length} cached/fetched`);
                } catch (infoError) {
                    console.error('Failed to fetch hotel card info:', infoError);
                }
            }

            const mergedHotels = data.HotelResult
                .filter(result => result.Rooms && result.Rooms.length > 0)
                .map(result => {
                    const staticData = staticMap[result.HotelCode] || {};
                    const cachedInfo = hotelCardInfo[String(result.HotelCode)] || {};
                    return {
                        ...staticData,
                        ...result,
                        HotelName: staticData.HotelName || result.HotelName,
                        StarRating: staticData.HotelRating || staticData.StarRating || result.StarRating,
                        HotelAddress: staticData.Address || result.HotelAddress,
                        // Priority: cached data > static data > result data
                        HotelPicture: cachedInfo.imageUrl || staticData.HotelPicture || result.HotelPicture,
                        HotelDescription: cachedInfo.description || staticData.Description || result.HotelDescription,
                        // Merge amenities/facilities from cached info
                        Facilities: cachedInfo.amenities?.length > 0 ? cachedInfo.amenities : (staticData.Facilities || result.Facilities),
                        // Merge rating and reviews from cached info
                        Rating: cachedInfo.rating || staticData.Rating || result.Rating,
                        reviews: cachedInfo.reviews || staticData.reviews || 0,
                        ratingText: cachedInfo.ratingText || staticData.ratingText,
                        Latitude: staticData.Latitude || result.Latitude,
                        Longitude: staticData.Longitude || result.Longitude
                    };
                });

            if (appendResults) {
                setHotels(prev => [...prev, ...mergedHotels]);
            } else {
                setHotels(mergedHotels);
            }
            return mergedHotels;
        }
        return [];
    }, []);

    // Initial search handler
    const handleSearch = async (searchData) => {
        console.log('Search Data:', searchData);
        setLoading(true);
        setError(null);
        setHotels([]);
        setCurrentPage(0);
        setHasMore(true);

        try {
            let hotelCodesList = [];
            let staticMap = {};

            // Fetch all hotel codes for the city
            if (searchData.cityCode) {
                try {
                    const hotelListResponse = await fetchHotels(searchData.cityCode);
                    if (hotelListResponse && hotelListResponse.Hotels && Array.isArray(hotelListResponse.Hotels)) {
                        // Create a map of HotelCode -> Hotel Details for fast lookup
                        hotelListResponse.Hotels.forEach(h => {
                            staticMap[h.HotelCode] = h;
                        });
                        setStaticHotelsMap(staticMap);
                        setCurrentStaticMap(staticMap);

                        // Extract all hotel codes
                        hotelCodesList = hotelListResponse.Hotels.map(h => h.HotelCode);
                        console.log(`Total hotels for city: ${hotelCodesList.length}`);
                    }
                } catch (err) {
                    console.error('Failed to fetch hotel list for city:', err);
                }
            }

            if (hotelCodesList.length === 0) {
                setError('No hotels found for this city.');
                setLoading(false);
                return;
            }

            // Store all hotel codes and search params for pagination
            setAllHotelCodes(hotelCodesList);
            setSearchParams(searchData);

            // Get first chunk (first 100 hotels)
            const firstChunk = hotelCodesList.slice(0, CHUNK_SIZE);
            console.log(`Searching first ${firstChunk.length} hotels...`);

            await searchHotelChunk(firstChunk, searchData, staticMap, false);

            // Check if there are more hotels to load
            if (hotelCodesList.length <= CHUNK_SIZE) {
                setHasMore(false);
            }

        } catch (err) {
            console.error('Search failed:', err);
            setError('Failed to fetch hotels. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Load more hotels (for infinite scroll)
    const loadMoreHotels = useCallback(async () => {
        if (loadingMore || !hasMore || !searchParams || allHotelCodes.length === 0) {
            return;
        }

        const nextPage = currentPage + 1;
        const startIdx = nextPage * CHUNK_SIZE;
        const endIdx = startIdx + CHUNK_SIZE;
        const nextChunk = allHotelCodes.slice(startIdx, endIdx);

        console.log(`Loading page ${nextPage + 1}: hotels ${startIdx} to ${endIdx}`);

        if (nextChunk.length === 0) {
            setHasMore(false);
            return;
        }

        setLoadingMore(true);

        try {
            await searchHotelChunk(nextChunk, searchParams, currentStaticMap, true);
            setCurrentPage(nextPage);

            // Check if there are more to load
            if (endIdx >= allHotelCodes.length) {
                setHasMore(false);
            }
        } catch (err) {
            console.error('Failed to load more hotels:', err);
        } finally {
            setLoadingMore(false);
        }
    }, [loadingMore, hasMore, searchParams, allHotelCodes, currentPage, currentStaticMap, searchHotelChunk]);

    // IntersectionObserver for infinite scroll
    useEffect(() => {
        if (!sentinelRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
                    loadMoreHotels();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(sentinelRef.current);

        return () => observer.disconnect();
    }, [hasMore, loading, loadingMore, loadMoreHotels]);

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
        const params = new URLSearchParams();
        navigate(`/hotel/${hotel.HotelCode}?${params.toString()}`);
    };

    // Calculate loaded/total counts for display
    const loadedCount = hotels.length;
    const totalCount = allHotelCodes.length;

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
                                {loading ? 'Searching...' :
                                    totalCount > 0
                                        ? `Showing ${filteredHotels.length} of ${loadedCount} loaded (${totalCount} total)`
                                        : `Showing ${filteredHotels.length} properties`
                                }
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

                        {/* Initial Loading State */}
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

                        {/* Sentinel element for infinite scroll */}
                        {!loading && hotels.length > 0 && (
                            <div ref={sentinelRef} className="h-10" />
                        )}

                        {/* Loading More Indicator */}
                        {loadingMore && (
                            <div className="flex flex-col justify-center items-center py-8">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
                                <p className="text-gray-600 text-sm">Loading more hotels...</p>
                            </div>
                        )}

                        {/* End of Results */}
                        {!loading && !hasMore && hotels.length > 0 && (
                            <div className="text-center py-6 text-gray-500 border-t border-gray-200 mt-4">
                                <p className="font-medium">You've seen all {loadedCount} hotels</p>
                            </div>
                        )}

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
