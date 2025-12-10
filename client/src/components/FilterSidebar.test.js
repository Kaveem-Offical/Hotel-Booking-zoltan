import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FilterSidebar from './FilterSidebar';

describe('FilterSidebar', () => {
    const mockFilters = {
        priceRange: { min: 0, max: 1000 },
        starRating: [],
        guestRating: [],
        propertyType: [],
        amenities: [],
        mealPlans: [],
        cancellation: [],
        payment: []
    };

    const mockOnFilterChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders all filter sections', () => {
        render(<FilterSidebar filters={mockFilters} onFilterChange={mockOnFilterChange} />);

        expect(screen.getByText('Price per night')).toBeInTheDocument();
        expect(screen.getByText('Star rating')).toBeInTheDocument();
        expect(screen.getByText('Guest rating')).toBeInTheDocument();
        expect(screen.getByText('Property type')).toBeInTheDocument();
    });

    test('toggles checkbox filters', () => {
        render(<FilterSidebar filters={mockFilters} onFilterChange={mockOnFilterChange} />);

        const hotelCheckbox = screen.getByLabelText('Hotel');
        fireEvent.click(hotelCheckbox);

        expect(mockOnFilterChange).toHaveBeenCalledWith({
            ...mockFilters,
            propertyType: ['Hotel']
        });
    });

    test('updates price range', () => {
        render(<FilterSidebar filters={mockFilters} onFilterChange={mockOnFilterChange} />);

        // Find the slider input
        // Note: In a real app, we might need a more specific selector or test id
        const slider = screen.getByRole('slider');
        fireEvent.change(slider, { target: { value: '500' } });

        expect(mockOnFilterChange).toHaveBeenCalled();
        const newFilters = mockOnFilterChange.mock.calls[0][0];
        expect(newFilters.priceRange.max).toBe(500);
    });

    test('clears all filters', () => {
        render(<FilterSidebar filters={mockFilters} onFilterChange={mockOnFilterChange} />);

        const clearButton = screen.getByText('Clear all');
        fireEvent.click(clearButton);

        expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({
            starRating: [],
            propertyType: []
        }));
    });

    test('collapses and expands sections', () => {
        render(<FilterSidebar filters={mockFilters} onFilterChange={mockOnFilterChange} />);

        // Amenities is closed by default in our implementation
        // We need to find the toggle. The text is visible, but the content shouldn't be.
        // Let's check for a known amenity
        expect(screen.queryByText('Free WiFi')).not.toBeInTheDocument();

        const amenitiesHeader = screen.getByText('Amenities');
        fireEvent.click(amenitiesHeader);

        expect(screen.getByText('Free WiFi')).toBeInTheDocument();
    });
});
