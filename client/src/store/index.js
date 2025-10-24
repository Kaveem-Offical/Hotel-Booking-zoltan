// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import citiesReducer from './slices/citiesSlice';
import hotelsReducer from './slices/hotelsSlice';
import hotelDetailsReducer from './slices/hotelDetailsSlice';

const store = configureStore({
  reducer: {
    cities: citiesReducer,
    hotels: hotelsReducer,
    hotelDetails: hotelDetailsReducer,
  },
});

export default store;
