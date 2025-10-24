// src/store/slices/citiesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchCityList } from '../../api/tboApi';

export const loadCityList = createAsyncThunk('cities/loadCityList', async () => {
  const res = await fetchCityList(); // returns parsed JSON { CityList: [...] }
  return res.CityList || [];
});

const citiesSlice = createSlice({
  name: 'cities',
  initialState: {
    list: [],      // array of { Code, Name }
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCityList.pending, (s) => { s.status = 'loading'; })
      .addCase(loadCityList.fulfilled, (s, a) => { s.status = 'succeeded'; s.list = a.payload; })
      .addCase(loadCityList.rejected, (s, a) => { s.status = 'failed'; s.error = a.error.message; });
  },
});

export default citiesSlice.reducer;
