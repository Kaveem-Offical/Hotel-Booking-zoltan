import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import HotelDetailsPage from './pages/HotelDetailsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/hotel/:hotelId" element={<HotelDetailsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
