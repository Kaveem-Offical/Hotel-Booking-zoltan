import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  cities: [],
  hotels: {},
  hotelDetails: {},
  loading: false,
  error: null
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_CITIES':
      return { ...state, cities: action.payload };
    case 'SET_HOTELS':
      return { 
        ...state, 
        hotels: { ...state.hotels, [action.cityCode]: action.payload }
      };
    case 'SET_HOTEL_DETAILS':
      return { 
        ...state, 
        hotelDetails: { ...state.hotelDetails, [action.hotelCode]: action.payload }
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
