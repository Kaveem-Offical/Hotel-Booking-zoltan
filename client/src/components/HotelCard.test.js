import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HotelCard from './HotelCard';

describe('HotelCard', () => {
    const mockHotel = {
        id: 1,
        name: "Test Hotel",
        image: "test-image.jpg",
        stars: 5,
        location: "Test Location",
        distance: "1 km from center",
        rating: 9.0,
        ratingText: "Excellent",
        reviews: 100,
        amenities: ["Free WiFi", "Pool"],
        roomType: "Deluxe Room",
        originalPrice: 200,
        discount: 10,
        freeCancellation: true,
        mealPlan: "Breakfast included"
    };

    test('renders hotel information correctly', () => {
        render(<HotelCard hotel={mockHotel} />);

        expect(screen.getByText('Test Hotel')).toBeInTheDocument();
        expect(screen.getByText('Test Location')).toBeInTheDocument();
        expect(screen.getByText('Excellent')).toBeInTheDocument();
        expect(screen.getByText('100 reviews')).toBeInTheDocument();
        expect(screen.getByText('Free WiFi')).toBeInTheDocument();
    });

    test('calculates and displays correct prices', () => {
        render(<HotelCard hotel={mockHotel} />);

        // Original price: 200
        // Discount: 10% -> 20 off -> Final: 180
        expect(screen.getByText('$200')).toBeInTheDocument(); // Original
        expect(screen.getByText('$180')).toBeInTheDocument(); // Final
        expect(screen.getByText('SAVE 10%')).toBeInTheDocument();
    });

    test('renders free cancellation badge when applicable', () => {
        render(<HotelCard hotel={mockHotel} />);
        expect(screen.getByText('Free cancellation')).toBeInTheDocument();
    });

    test('does not render free cancellation badge when not applicable', () => {
        const hotelNoCancel = { ...mockHotel, freeCancellation: false };
        render(<HotelCard hotel={hotelNoCancel} />);
        expect(screen.queryByText('Free cancellation')).not.toBeInTheDocument();
    });

    test('calls onSelect when clicked', () => {
        const mockOnSelect = jest.fn();
        render(<HotelCard hotel={mockHotel} onSelect={mockOnSelect} />);

        fireEvent.click(screen.getByText('Test Hotel'));
        expect(mockOnSelect).toHaveBeenCalledWith(mockHotel);
    });

    test('toggles favorite heart icon', () => {
        render(<HotelCard hotel={mockHotel} />);

        const heartButton = screen.getByLabelText('Add to favorites');

        // Initial state: not favorite (gray)
        // Note: We can't easily test color classes without style computation, but we can check if the class changes
        // or just check if the click handler works if we mocked it. 
        // Since state is internal, we can check if the SVG inside has the 'fill-red-500' class after click.

        fireEvent.click(heartButton);

        // After click, the heart icon should have the active class
        // The SVG is the first child of the button
        const svg = heartButton.querySelector('svg');
        expect(svg).toHaveClass('fill-red-500');

        fireEvent.click(heartButton);
        expect(svg).not.toHaveClass('fill-red-500');
    });
});

