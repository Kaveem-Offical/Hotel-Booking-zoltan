const { database } = require('../config/firebaseAdmin');

class PricingEngine {
    constructor() {
        this.strategies = {};
        this.lastFetched = null;
        this.cacheTTL = 5 * 60 * 1000; // 5 minutes cache
    }

    /**
     * Fetch configurations from Firebase and cache them
     */
    async loadConfigurations() {
        const now = Date.now();
        if (this.lastFetched && (now - this.lastFetched < this.cacheTTL)) {
            return this.strategies; // return cached
        }

        try {
            const snap = await database.ref('settings/pricing_strategies').once('value');
            this.strategies = snap.val() || {};
            this.lastFetched = now;
            console.log('Pricing strategies loaded from Firebase');
        } catch (error) {
            console.error('Error loading pricing strategies:', error.message);
            // Fallback to existing cache if possible
        }

        return this.strategies;
    }

    /**
     * Clear the cache to force reloading
     */
    clearCache() {
        this.lastFetched = null;
        this.strategies = {};
    }

    /**
     * Apply all enabled pricing strategies sequentially
     */
    async applyPricingStrategies(hotelResults, context) {
        await this.loadConfigurations();

        if (!hotelResults || !Array.isArray(hotelResults) || hotelResults.length === 0) {
            return hotelResults;
        }

        // We prepare demand logic and user loyalty once for the batch to save DB calls if needed
        // For simplicity, we assume context provides necessary stats, or we calculate them here.
        let userBookingsCount = context.userBookingsCount || 0;
        let recentBookingsForHotel = context.recentBookingsForHotel || {};

        return hotelResults.map(hotel => {
            if (!hotel.Rooms || !Array.isArray(hotel.Rooms)) return hotel;

            hotel.Rooms = hotel.Rooms.map(room => {
                let adjustmentAmount = 0;
                let originalTotalFare = room.TotalFare;

                // 1. Device-Based Pricing
                const deviceConfig = this.strategies['device_pricing'];
                if (deviceConfig?.is_enabled) {
                    const device = (context.deviceType || 'desktop').toLowerCase();
                    const markupPct = parseFloat(deviceConfig.parameters[`${device}_markup`] || 0);
                    if (markupPct !== 0) {
                        const amt = originalTotalFare * (markupPct / 100);
                        adjustmentAmount += amt;
                        this.logAdjustment(hotel.HotelName, 'Device Pricing', amt);
                    }
                }

                // 2. Inventory-Based Pricing
                const inventoryConfig = this.strategies['inventory_pricing'];
                if (inventoryConfig?.is_enabled) {
                    // Try to extract available rooms, default to 50 if not provided by TBO to prevent accidental hikes
                    const roomsLeft = room.AvailableRooms || 50;
                    
                    let markupPct = 0;
                    if (roomsLeft < 10) markupPct = parseFloat(inventoryConfig.parameters.markup_under_10 || 20);
                    else if (roomsLeft < 20) markupPct = parseFloat(inventoryConfig.parameters.markup_under_20 || 10);
                    else if (roomsLeft < 50) markupPct = parseFloat(inventoryConfig.parameters.markup_under_50 || 5);

                    if (markupPct !== 0) {
                        const amt = originalTotalFare * (markupPct / 100);
                        adjustmentAmount += amt;
                        this.logAdjustment(hotel.HotelName, 'Inventory Pricing', amt);
                    }
                }

                // 3. Behavioral Pricing
                const behavioralConfig = this.strategies['behavioral_pricing'];
                if (behavioralConfig?.is_enabled) {
                    const visits = parseInt(context.userVisits || 1);
                    let markupPct = 0;
                    if (visits >= 7) markupPct = parseFloat(behavioralConfig.parameters.markup_7_plus || 10);
                    else if (visits >= 4) markupPct = parseFloat(behavioralConfig.parameters.markup_4_to_6 || 5);

                    if (markupPct !== 0) {
                        const amt = originalTotalFare * (markupPct / 100);
                        adjustmentAmount += amt;
                        this.logAdjustment(hotel.HotelName, 'Behavioral Pricing', amt);
                    }
                }

                // 4. Demand-Based Pricing
                const demandConfig = this.strategies['demand_pricing'];
                if (demandConfig?.is_enabled) {
                    // Number of bookings in last 1 hour for this hotel
                    const recentBookings = recentBookingsForHotel[hotel.HotelCode] || 0;
                    let markupPct = 0;
                    if (recentBookings >= 20) markupPct = parseFloat(demandConfig.parameters.markup_20_plus || 12);
                    else if (recentBookings >= 10) markupPct = parseFloat(demandConfig.parameters.markup_10_to_19 || 7);
                    else if (recentBookings >= 5) markupPct = parseFloat(demandConfig.parameters.markup_5_to_9 || 3);

                    if (markupPct !== 0) {
                        const amt = originalTotalFare * (markupPct / 100);
                        adjustmentAmount += amt;
                        this.logAdjustment(hotel.HotelName, 'Demand Pricing', amt);
                    }
                }

                // 5. Time-Based Pricing
                const timeConfig = this.strategies['time_based_pricing'];
                if (timeConfig?.is_enabled && context.checkIn) {
                    const checkInDate = new Date(context.checkIn);
                    const today = new Date();
                    const diffTime = Math.abs(checkInDate - today);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

                    let markupPct = 0;
                    if (diffDays > 30) markupPct = parseFloat(timeConfig.parameters.markup_greater_30 || -10);
                    else if (diffDays < 7) markupPct = parseFloat(timeConfig.parameters.markup_less_7 || 8);

                    if (markupPct !== 0) {
                        const amt = originalTotalFare * (markupPct / 100);
                        adjustmentAmount += amt;
                        this.logAdjustment(hotel.HotelName, 'Time-Based Pricing', amt);
                    }
                }

                // 6. Geo-Based Pricing
                const geoConfig = this.strategies['geo_pricing'];
                if (geoConfig?.is_enabled) {
                    const country = (context.userCountry || 'IN').toUpperCase(); // Fallback IN
                    // Assuming parameters store country code to markup mapping like {"USA": 10, "EUR": 8}
                    let markupPct = 0;
                    if (country === 'US' || country === 'USA') markupPct = parseFloat(geoConfig.parameters.usa_markup || 10);
                    else if (['GB', 'DE', 'FR', 'IT', 'ES', 'EUR'].includes(country)) markupPct = parseFloat(geoConfig.parameters.europe_markup || 8);
                    
                    // You could make parameters completely dynamic, e.g. geoConfig.parameters[country]
                    const customMarkup = geoConfig.parameters[`${country}_markup`];
                    if (customMarkup !== undefined) {
                        markupPct = parseFloat(customMarkup);
                    }

                    if (markupPct !== 0) {
                        const amt = originalTotalFare * (markupPct / 100);
                        adjustmentAmount += amt;
                        this.logAdjustment(hotel.HotelName, `Geo Pricing (${country})`, amt);
                    }
                }

                // 7. Channel-Based Pricing
                const channelConfig = this.strategies['channel_pricing'];
                if (channelConfig?.is_enabled) {
                    const channel = (context.channel || 'website').toLowerCase(); // website, android, ios
                    const markupPct = parseFloat(channelConfig.parameters[`${channel}_markup`] || 0);

                    if (markupPct !== 0) {
                        const amt = originalTotalFare * (markupPct / 100);
                        adjustmentAmount += amt;
                        this.logAdjustment(hotel.HotelName, `Channel Pricing (${channel})`, amt);
                    }
                }

                // 8. Weekend / Peak Pricing
                const weekendConfig = this.strategies['weekend_pricing'];
                if (weekendConfig?.is_enabled && context.checkIn) {
                    const checkInDate = new Date(context.checkIn);
                    const dayOfWeek = checkInDate.getDay(); // 0 is Sunday, 5 is Friday, 6 is Saturday
                    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0;

                    if (isWeekend) {
                        const markupPct = parseFloat(weekendConfig.parameters.weekend_markup || 10);
                        if (markupPct !== 0) {
                            const amt = originalTotalFare * (markupPct / 100);
                            adjustmentAmount += amt;
                            this.logAdjustment(hotel.HotelName, 'Weekend Pricing', amt);
                        }
                    }
                }

                // 9. Loyalty Pricing
                const loyaltyConfig = this.strategies['loyalty_pricing'];
                if (loyaltyConfig?.is_enabled && userBookingsCount > 0) {
                    let markupPct = 0;
                    if (userBookingsCount >= 4) markupPct = parseFloat(loyaltyConfig.parameters.markup_4_plus || -10);
                    else if (userBookingsCount >= 1 && userBookingsCount <= 3) markupPct = parseFloat(loyaltyConfig.parameters.markup_1_to_3 || -5);

                    if (markupPct !== 0) {
                        const amt = originalTotalFare * (markupPct / 100);
                        adjustmentAmount += amt;
                        this.logAdjustment(hotel.HotelName, 'Loyalty Pricing', amt);
                    }
                }

                // 10. Competitor Adjustment Placeholder
                const competitorConfig = this.strategies['competitor_pricing'];
                if (competitorConfig?.is_enabled) {
                    // Logic to adjust price based on competitors would go here
                    // e.g. fetchCompetitorPrice('MakeMyTrip', hotel.HotelCode)
                    const markupPct = parseFloat(competitorConfig.parameters.competitor_adjustment || 0);
                    if (markupPct !== 0) {
                        const amt = originalTotalFare * (markupPct / 100);
                        adjustmentAmount += amt;
                        this.logAdjustment(hotel.HotelName, 'Competitor Pricing', amt);
                    }
                }

                // Apply the final calculated adjustments
                room.TotalFare = parseFloat((room.TotalFare + adjustmentAmount).toFixed(2));
                // Assuming tax scales proportionally or remains the same, but let's just adjust fare.
                // We will adjust TotalTax if we want, or just add the adjustment to TotalFare.
                // Add tracking for frontend
                room.StrategyAdjustmentsAmount = parseFloat(adjustmentAmount.toFixed(2));

                return room;
            });

            // Adjust Hotel level MinPrice and PublishedPrice
            // Calculate an average or min room adjustment to reflect on hotel level
            if (hotel.Rooms.length > 0) {
                // Find minimum adjustment for the minprice reflection
                const minAdjustment = Math.min(...hotel.Rooms.map(r => r.StrategyAdjustmentsAmount || 0));
                
                if (hotel.MinPrice) {
                    hotel.MinPrice = parseFloat((hotel.MinPrice + minAdjustment).toFixed(2));
                }
                
                if (hotel.PublishedPrice) {
                    // Using same min adjustment for published price placeholder
                    hotel.PublishedPrice = parseFloat((hotel.PublishedPrice + minAdjustment).toFixed(2));
                }

                if (minAdjustment !== 0) {
                    console.log(`\nBase Price (with standard markup): ${hotel.Rooms[0].OriginalTotalFare}`);
                    console.log(`Final Price: ${hotel.Rooms[0].TotalFare}`);
                    console.log(`Net Strategy Adjustment: ${minAdjustment}`);
                }
            }

            return hotel;
        });
    }

    logAdjustment(hotelName, strategyName, amount) {
        if (amount !== 0) {
            const sign = amount > 0 ? '+' : '';
            console.log(`[PricingEngine] ${hotelName} -> ${strategyName}: ${sign}${amount.toFixed(2)}`);
        }
    }
}

module.exports = new PricingEngine();
