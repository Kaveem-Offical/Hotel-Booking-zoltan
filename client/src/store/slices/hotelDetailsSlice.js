// src/store/slices/hotelDetailsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchHotelDetails } from '../../api/tboApi';

export const loadHotelDetails = createAsyncThunk('hotelDetails/loadHotelDetails',
  async ({ hotelCode }, { getState }) => {
    const res = await fetchHotelDetails({ Hotelcodes: hotelCode, Language: 'EN', IsRoomDetailRequired: true });
    // The sample return had HotelDetails as an array; normalize to first element
    return { hotelCode, details: (res.HotelDetails && res.HotelDetails[0]) || null };
  }
);

const hotelDetailsSlice = createSlice({
  name: 'hotelDetails',
  initialState: {
    byCode: {}, // hotelCode -> { status, data, error }
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadHotelDetails.pending, (s, a) => {
        s.byCode[a.meta.arg.hotelCode] = { status: 'loading', data: null, error: null };
      })
      .addCase(loadHotelDetails.fulfilled, (s, a) => {
        s.byCode[a.payload.hotelCode] = { status: 'succeeded', data: a.payload.details, error: null };
      })
      .addCase(loadHotelDetails.rejected, (s, a) => {
        s.byCode[a.meta.arg.hotelCode] = { status: 'failed', data: null, error: a.error.message };
      });
  },
});

export default hotelDetailsSlice.reducer;
