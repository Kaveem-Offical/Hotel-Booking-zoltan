import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Star, X, Filter, MapPin } from 'lucide-react';

const FilterSection = ({ title, children, isOpen, onToggle }) => (
    <div className="border-b border-gray-200 py-4">
        <div
            className="flex items-center justify-between cursor-pointer mb-2"
            onClick={onToggle}
        >
            <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
            {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </div>
        {isOpen && <div className="mt-2 space-y-2">{children}</div>}
    </div>
);

const CheckboxFilter = ({ label, checked, onChange, count }) => (
    <label className="flex items-center justify-between cursor-pointer group">
        <div className="flex items-center">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="w-5 h-5 border-2 border-gray-300 rounded checked:bg-blue-600 checked:border-blue-600 focus:ring-0 focus:ring-offset-0 transition-colors"
            />
            <span className="ml-3 text-gray-700 text-sm group-hover:text-blue-600 transition-colors">{label}</span>
        </div>
        {count !== undefined && <span className="text-xs text-gray-400">{count}</span>}
    </label>
);

const FilterSidebar = ({ filters, onFilterChange, availableHotels = [] }) => {
    const [openSections, setOpenSections] = useState({
        price: true,
        starRating: true,
        guestRating: true,
        propertyType: true,
        amenities: false,
        mealPlans: false,
        cancellation: false,
        payment: false
    });

    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleCheckboxChange = (category, value) => {
        const currentValues = filters[category] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        onFilterChange({ ...filters, [category]: newValues });
    };

    const handlePriceChange = (min, max) => {
        onFilterChange({ ...filters, priceRange: { min, max } });
    };

    const clearAll = () => {
        onFilterChange({
            priceRange: { min: 0, max: 1000 },
            starRating: [],
            guestRating: [],
            propertyType: [],
            amenities: [],
            mealPlans: [],
            cancellation: [],
            payment: []
        });
    };

    const activeFilterCount = Object.entries(filters).reduce((acc, [key, value]) => {
        if (key === 'priceRange') return acc; // Don't count price unless modified from default (omitted for simplicity)
        return acc + (Array.isArray(value) ? value.length : 0);
    }, 0);

    return (
        <>
            {/* Mobile Toggle */}
            <div className="lg:hidden mb-4">
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 font-bold rounded-lg border border-blue-100"
                >
                    <Filter className="w-4 h-4" />
                    Filter Results {activeFilterCount > 0 && `(${activeFilterCount})`}
                </button>
            </div>

            {/* Sidebar Container */}
            <div className={`
        fixed inset-0 z-50 bg-white transform transition-transform duration-300 lg:relative lg:transform-none lg:block lg:w-72 lg:bg-transparent
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="h-full overflow-y-auto p-4 lg:p-0 bg-white lg:bg-transparent lg:sticky lg:top-4">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 lg:hidden">
                        <h2 className="text-xl font-bold text-gray-800">Filters</h2>
                        <button onClick={() => setIsMobileOpen(false)} className="p-2">
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>

                    {/* Map Placeholder (Agoda style) */}
                    <div className="hidden lg:flex items-center justify-center h-24 bg-blue-100 rounded-lg mb-4 border border-blue-200 cursor-pointer hover:bg-blue-200 transition-colors relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://cdn6.agoda.net/images/MVC/default/background_image/illustrations/bg-agoda-homepage.png')] bg-cover bg-center"></div>
                        <span className="text-blue-700 font-bold relative z-10 flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> Show on map
                        </span>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {/* Filter Header */}
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                            <span className="font-bold text-gray-700">Filter by</span>
                            <button
                                onClick={clearAll}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Clear all
                            </button>
                        </div>

                        <div className="p-4">
                            {/* Price Range */}
                            <FilterSection
                                title="Price per night"
                                isOpen={openSections.price}
                                onToggle={() => toggleSection('price')}
                            >
                                <div className="px-2">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="border border-gray-300 rounded p-2 w-24 text-center">
                                            <span className="text-xs text-gray-500 block">Min</span>
                                            <span className="font-bold text-gray-800">${filters.priceRange?.min || 0}</span>
                                        </div>
                                        <div className="h-[1px] w-4 bg-gray-300"></div>
                                        <div className="border border-gray-300 rounded p-2 w-24 text-center">
                                            <span className="text-xs text-gray-500 block">Max</span>
                                            <span className="font-bold text-gray-800">${filters.priceRange?.max || 1000}+</span>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1000"
                                        value={filters.priceRange?.max || 1000}
                                        onChange={(e) => handlePriceChange(filters.priceRange?.min || 0, parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>
                            </FilterSection>

                            {/* Star Rating */}
                            <FilterSection
                                title="Star rating"
                                isOpen={openSections.starRating}
                                onToggle={() => toggleSection('starRating')}
                            >
                                {[5, 4, 3, 2, 1].map(star => (
                                    <CheckboxFilter
                                        key={star}
                                        label={
                                            <div className="flex items-center">
                                                <div className="flex text-yellow-400">
                                                    {[...Array(star)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                                                </div>
                                                <span className="ml-2 text-sm text-gray-600">{star} Star</span>
                                            </div>
                                        }
                                        checked={filters.starRating?.includes(star)}
                                        onChange={() => handleCheckboxChange('starRating', star)}
                                    />
                                ))}
                            </FilterSection>

                            {/* Guest Rating */}
                            <FilterSection
                                title="Guest rating"
                                isOpen={openSections.guestRating}
                                onToggle={() => toggleSection('guestRating')}
                            >
                                {['9+', '8+', '7+', '6+'].map(rating => (
                                    <CheckboxFilter
                                        key={rating}
                                        label={`Excellent ${rating}`}
                                        checked={filters.guestRating?.includes(rating)}
                                        onChange={() => handleCheckboxChange('guestRating', rating)}
                                    />
                                ))}
                            </FilterSection>

                            {/* Property Type */}
                            <FilterSection
                                title="Property type"
                                isOpen={openSections.propertyType}
                                onToggle={() => toggleSection('propertyType')}
                            >
                                {['Hotel', 'Apartment', 'Resort', 'Villa', 'Hostel'].map(type => (
                                    <CheckboxFilter
                                        key={type}
                                        label={type}
                                        checked={filters.propertyType?.includes(type)}
                                        onChange={() => handleCheckboxChange('propertyType', type)}
                                    />
                                ))}
                            </FilterSection>

                            {/* Amenities */}
                            <FilterSection
                                title="Amenities"
                                isOpen={openSections.amenities}
                                onToggle={() => toggleSection('amenities')}
                            >
                                {['Free WiFi', 'Swimming Pool', 'Parking', 'Restaurant', 'Gym', 'Spa', 'Airport Shuttle', 'Pet Friendly'].map(amenity => (
                                    <CheckboxFilter
                                        key={amenity}
                                        label={amenity}
                                        checked={filters.amenities?.includes(amenity)}
                                        onChange={() => handleCheckboxChange('amenities', amenity)}
                                    />
                                ))}
                            </FilterSection>

                            {/* Meal Plans */}
                            <FilterSection
                                title="Meal plans"
                                isOpen={openSections.mealPlans}
                                onToggle={() => toggleSection('mealPlans')}
                            >
                                {['Room Only', 'Breakfast', 'Half Board', 'Full Board', 'All Inclusive'].map(plan => (
                                    <CheckboxFilter
                                        key={plan}
                                        label={plan}
                                        checked={filters.mealPlans?.includes(plan)}
                                        onChange={() => handleCheckboxChange('mealPlans', plan)}
                                    />
                                ))}
                            </FilterSection>

                            {/* Cancellation Policy */}
                            <FilterSection
                                title="Cancellation policy"
                                isOpen={openSections.cancellation}
                                onToggle={() => toggleSection('cancellation')}
                            >
                                {['Free cancellation', 'Non-refundable'].map(policy => (
                                    <CheckboxFilter
                                        key={policy}
                                        label={policy}
                                        checked={filters.cancellation?.includes(policy)}
                                        onChange={() => handleCheckboxChange('cancellation', policy)}
                                    />
                                ))}
                            </FilterSection>

                            {/* Payment Options */}
                            <FilterSection
                                title="Payment options"
                                isOpen={openSections.payment}
                                onToggle={() => toggleSection('payment')}
                            >
                                {['Pay now', 'Pay at property'].map(option => (
                                    <CheckboxFilter
                                        key={option}
                                        label={option}
                                        checked={filters.payment?.includes(option)}
                                        onChange={() => handleCheckboxChange('payment', option)}
                                    />
                                ))}
                            </FilterSection>
                        </div>

                        {/* Mobile Apply Button */}
                        <div className="lg:hidden p-4 border-t border-gray-200 sticky bottom-0 bg-white">
                            <button
                                onClick={() => setIsMobileOpen(false)}
                                className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg"
                            >
                                Show Results
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                ></div>
            )}
        </>
    );
};


export default FilterSidebar;
