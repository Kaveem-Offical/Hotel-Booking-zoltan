// src/store/slices/hotelsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchHotelCodeList } from '../../api/tboApi';

// fetch hotels for a given cityCode. We cache per cityCode.
export const loadHotelsForCity = createAsyncThunk('hotels/loadHotelsForCity',
  async (cityCode, { getState }) => {
    // no duplicate calls handled by the thunk caller (but we also handle caching in state)
    const res = await fetchHotelCodeList({ CityCode: cityCode });
    return { cityCode, hotels: res.Hotels || [] };
  }
);

const hotelsSlice = createSlice({
  name: 'hotels',
  initialState: {
    byCity: {},   // cityCode => { status, list: [hotel objects], error }
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadHotelsForCity.pending, (s, a) => {
        s.byCity[a.meta.arg] = { status: 'loading', list: [], error: null };
      })
      .addCase(loadHotelsForCity.fulfilled, (s, a) => {
        s.byCity[a.payload.cityCode] = { status: 'succeeded', list: a.payload.hotels, error: null };
      })
      .addCase(loadHotelsForCity.rejected, (s, a) => {
        s.byCity[a.meta.arg] = { status: 'failed', list: [], error: a.error.message };
      });
  },
});

export default hotelsSlice.reducer;
