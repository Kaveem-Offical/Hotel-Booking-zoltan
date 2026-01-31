import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSearchBar from '../components/HeroSearchBar';
import FilterSidebar from '../components/FilterSidebar';
import HotelCard from '../components/HotelCard';
import { searchHotels, fetchHotels, fetchHotelCardInfo } from '../services/api';

const CHUNK_SIZE = 100; // Number of hotel codes per API request

// Helper to parse StarRating from string like "FourStar" to number
const parseStarRating = (rating) => {
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

function HomePage() {
    const [hotels, setHotels] = useState([]);
    const [staticHotelsMap, setStaticHotelsMap] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);

    // Pagination state
    const [allHotelCodes, setAllHotelCodes] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [searchParams, setSearchParams] = useState(null);
    const [currentStaticMap, setCurrentStaticMap] = useState({});

    // Ref for infinite scroll sentinel
    const sentinelRef = useRef(null);

    const navigate = useNavigate();

    // Compute dynamic filter options from hotels
    const filterOptions = useMemo(() => {
        if (hotels.length === 0) return {};

        const starRatings = {};
        const guestRatings = { '9': 0, '8': 0, '7': 0, '6': 0 };
        const amenities = {};
        const mealPlans = {};
        const cancellation = { 'Free Cancellation': 0, 'Non-refundable': 0 };

        hotels.forEach(hotel => {
            // Count star ratings
            const stars = parseStarRating(hotel.StarRating);
            if (stars >= 1 && stars <= 5) {
                starRatings[stars] = (starRatings[stars] || 0) + 1;
            }

            // Count guest ratings
            const rating = parseFloat(hotel.Rating) || 0;
            if (rating >= 9) guestRatings['9']++;
            if (rating >= 8) guestRatings['8']++;
            if (rating >= 7) guestRatings['7']++;
            if (rating >= 6) guestRatings['6']++;

            // Count amenities
            const hotelAmenities = hotel.Facilities || [];
            hotelAmenities.forEach(amenity => {
                if (typeof amenity === 'string' && amenity.trim()) {
                    amenities[amenity] = (amenities[amenity] || 0) + 1;
                }
            });

            // Count meal plans from first room
            const roomData = hotel.Rooms?.[0];
            if (roomData?.MealType) {
                const mealType = roomData.MealType;
                mealPlans[mealType] = (mealPlans[mealType] || 0) + 1;
            }

            // Count cancellation policies
            if (roomData?.IsRefundable === true) {
                cancellation['Free Cancellation']++;
            } else if (roomData?.IsRefundable === false) {
                cancellation['Non-refundable']++;
            }
        });

        // Remove zero counts from guest ratings
        Object.keys(guestRatings).forEach(key => {
            if (guestRatings[key] === 0) delete guestRatings[key];
        });

        // Remove zero counts from cancellation
        Object.keys(cancellation).forEach(key => {
            if (cancellation[key] === 0) delete cancellation[key];
        });

        return {
            starRatings,
            guestRatings,
            amenities,
            mealPlans,
            cancellation
        };
    }, [hotels]);

    // Compute price bounds from hotels
    const priceBounds = useMemo(() => {
        if (hotels.length === 0) return { min: 0, max: 100000 };

        let minPrice = Infinity;
        let maxPrice = 0;

        hotels.forEach(hotel => {
            const price = hotel.Rooms?.[0]?.TotalFare || 0;
            if (price > 0) {
                minPrice = Math.min(minPrice, price);
                maxPrice = Math.max(maxPrice, price);
            }
        });

        // Round to nice values
        minPrice = minPrice === Infinity ? 0 : Math.floor(minPrice / 500) * 500;
        maxPrice = maxPrice === 0 ? 100000 : Math.ceil(maxPrice / 500) * 500;

        return { min: minPrice, max: maxPrice };
    }, [hotels]);

    // Initialize filters with dynamic price range
    const [filters, setFilters] = useState({
        priceRange: { min: 0, max: 100000 },
        starRating: [],
        guestRating: [],
        amenities: [],
        mealPlans: [],
        cancellation: [],
    });

    // Sort state
    const [sortBy, setSortBy] = useState('bestMatch');

    // Update price range when bounds change (only on first load)
    useEffect(() => {
        if (hotels.length > 0 && filters.priceRange.max === 100000) {
            setFilters(prev => ({
                ...prev,
                priceRange: { min: priceBounds.min, max: priceBounds.max }
            }));
        }
    }, [priceBounds, hotels.length]);

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
            noOfRooms: searchData.guests?.rooms || 0,
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
        // Reset filters on new search
        setFilters({
            priceRange: { min: 0, max: 100000 },
            starRating: [],
            guestRating: [],
            amenities: [],
            mealPlans: [],
            cancellation: [],
        });

        try {
            let hotelCodesList = [];
            let staticMap = {};

            // Check if searching for a specific hotel or a city
            if (searchData.hotelCode) {
                // Single hotel search - use hotelInfo from search bar if available
                console.log(`Searching for specific hotel: ${searchData.hotelCode}`);

                // Build static map from carried-over hotel info
                if (searchData.hotelInfo) {
                    staticMap[searchData.hotelCode] = {
                        HotelCode: searchData.hotelCode,
                        HotelName: searchData.hotelInfo.HotelName,
                        HotelAddress: searchData.hotelInfo.HotelAddress,
                        Address: searchData.hotelInfo.HotelAddress,
                        HotelRating: searchData.hotelInfo.StarRating,
                        StarRating: searchData.hotelInfo.StarRating,
                        Latitude: searchData.hotelInfo.Latitude,
                        Longitude: searchData.hotelInfo.Longitude
                    };
                    setStaticHotelsMap(staticMap);
                    setCurrentStaticMap(staticMap);
                }

                hotelCodesList = [searchData.hotelCode];
                setAllHotelCodes(hotelCodesList);
                setSearchParams(searchData);
                setHasMore(false); // Only one hotel, no pagination needed

                const results = await searchHotelChunk(hotelCodesList, searchData, staticMap, false);

                if (!results || results.length === 0) {
                    setError(`No rooms available for "${searchData.destination}" on the selected dates. Try different dates.`);
                }

            } else if (searchData.cityCode) {
                // City search - existing logic
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
            } else {
                setError('Please select a city or hotel to search.');
                setLoading(false);
                return;
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

    // Apply filters with improved logic
    const filteredHotels = useMemo(() => {
        return hotels.filter(hotel => {
            // Price Filter
            const price = hotel.Rooms?.[0]?.TotalFare || 0;
            if (price < filters.priceRange.min || price > filters.priceRange.max) return false;

            // Star Rating Filter
            if (filters.starRating.length > 0) {
                const stars = parseStarRating(hotel.StarRating);
                if (!filters.starRating.includes(stars)) return false;
            }

            // Guest Rating Filter
            if (filters.guestRating.length > 0) {
                const rating = parseFloat(hotel.Rating) || 0;
                // Check if hotel meets any of the selected rating thresholds
                const meetsRating = filters.guestRating.some(threshold => rating >= parseInt(threshold));
                if (!meetsRating) return false;
            }

            // Amenities Filter
            if (filters.amenities.length > 0) {
                const hotelAmenities = hotel.Facilities || [];
                const hasAmenity = filters.amenities.some(amenity =>
                    hotelAmenities.some(ha =>
                        typeof ha === 'string' && ha.toLowerCase().includes(amenity.toLowerCase())
                    )
                );
                if (!hasAmenity) return false;
            }

            // Meal Plans Filter
            if (filters.mealPlans.length > 0) {
                const mealType = hotel.Rooms?.[0]?.MealType || '';
                if (!filters.mealPlans.includes(mealType)) return false;
            }

            // Cancellation Filter
            if (filters.cancellation.length > 0) {
                const isRefundable = hotel.Rooms?.[0]?.IsRefundable;
                const hasFreeCancel = filters.cancellation.includes('Free Cancellation') && isRefundable === true;
                const hasNonRefund = filters.cancellation.includes('Non-refundable') && isRefundable === false;
                if (!hasFreeCancel && !hasNonRefund) return false;
            }

            return true;
        });
    }, [hotels, filters]);

    // Apply sorting to filtered hotels
    const sortedHotels = useMemo(() => {
        const sorted = [...filteredHotels];
        switch (sortBy) {
            case 'priceLowHigh':
                return sorted.sort((a, b) => (a.Rooms?.[0]?.TotalFare || 0) - (b.Rooms?.[0]?.TotalFare || 0));
            case 'priceHighLow':
                return sorted.sort((a, b) => (b.Rooms?.[0]?.TotalFare || 0) - (a.Rooms?.[0]?.TotalFare || 0));
            case 'starRating':
                return sorted.sort((a, b) => parseStarRating(b.StarRating) - parseStarRating(a.StarRating));
            case 'guestRating':
                return sorted.sort((a, b) => (parseFloat(b.Rating) || 0) - (parseFloat(a.Rating) || 0));
            case 'nameAZ':
                return sorted.sort((a, b) => (a.HotelName || '').localeCompare(b.HotelName || ''));
            case 'bestMatch':
            default:
                return sorted; // Keep original API order
        }
    }, [filteredHotels, sortBy]);

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
                            filterOptions={filterOptions}
                            priceBounds={priceBounds}
                        />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex flex-wrap justify-between items-center gap-4">
                            <h2 className="text-xl font-bold text-gray-800">
                                {loading ? 'Searching...' :
                                    totalCount > 0
                                        ? `Showing ${sortedHotels.length} of ${loadedCount}`
                                        : `Showing ${sortedHotels.length} properties`
                                }
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600 text-sm">Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 bg-white hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-all"
                                >
                                    <option value="bestMatch">Best Match</option>
                                    <option value="priceLowHigh">Price: Low to High</option>
                                    <option value="priceHighLow">Price: High to Low</option>
                                    <option value="starRating">Star Rating</option>
                                    <option value="guestRating">Guest Rating</option>
                                    <option value="nameAZ">Name: A-Z</option>
                                </select>
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
                            <div className="flex flex-col justify-center items-center py-16">
                                <div className="relative">
                                    <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-200"></div>
                                    <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-600 border-t-transparent absolute inset-0"></div>
                                </div>
                                <p className="text-gray-600 mt-4 animate-pulse">Searching for best deals...</p>
                            </div>
                        )}

                        {/* Hotel Cards with staggered animation */}
                        {!loading && sortedHotels.map((hotel, index) => (
                            <HotelCard
                                key={hotel.HotelCode || index}
                                hotel={hotel}
                                onSelect={handleHotelSelect}
                                index={index}
                            />
                        ))}

                        {/* Sentinel element for infinite scroll */}
                        {!loading && hotels.length > 0 && (
                            <div ref={sentinelRef} className="h-10" />
                        )}

                        {/* Loading More Indicator - Enhanced */}
                        {loadingMore && (
                            <div className="flex flex-col justify-center items-center py-8 animate-fade-in">
                                <div className="flex space-x-2">
                                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                                <p className="text-gray-600 text-sm mt-3">Loading more hotels...</p>
                            </div>
                        )}

                        {/* End of Results - Enhanced */}
                        {!loading && !hasMore && hotels.length > 0 && (
                            <div className="text-center py-6 text-gray-500 border-t border-gray-200 mt-4 animate-fade-in">
                                <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    <p className="font-medium">You've seen all {loadedCount} hotels</p>
                                </div>
                            </div>
                        )}

                        {!loading && sortedHotels.length === 0 && !error && (
                            <div className="text-center py-12 text-gray-500">
                                {hotels.length > 0 ? 'No hotels match your filters. Try adjusting your filters.' : 'Use the search bar to find hotels.'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
