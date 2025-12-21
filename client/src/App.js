import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import HotelDetailsPage from './pages/HotelDetailsPage';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';
import { Hotel, LogOut, Shield } from 'lucide-react';
import './styles/Auth.css';

// Navigation Header Component
const NavHeader = () => {
  const { currentUser, userData, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="nav-header">
      <Link to="/" className="nav-logo">
        <Hotel size={28} />
        Zoltan Hotels
      </Link>
      <div className="nav-links">
        {currentUser ? (
          <>
            {isAdmin && (
              <Link to="/admin" className="nav-link">
                <Shield size={18} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
                Admin
              </Link>
            )}
            <div className="user-info-nav">
              <div className="user-avatar-nav">
                {getInitials(userData?.username || currentUser?.email)}
              </div>
              <span style={{ color: 'white', fontSize: '0.875rem' }}>
                {userData?.username || currentUser?.email?.split('@')[0]}
              </span>
            </div>
            <button className="nav-button nav-button-secondary" onClick={handleLogout}>
              <LogOut size={16} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/signin" className="nav-link">
              Sign In
            </Link>
            <Link to="/signup" className="nav-button">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

// Layout wrapper with navigation
const Layout = ({ children, showNav = true }) => {
  return (
    <>
      {showNav && <NavHeader />}
      <main style={{ paddingTop: showNav ? '70px' : '0' }}>{children}</main>
    </>
  );
};

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <HomePage />
          </Layout>
        }
      />
      <Route
        path="/hotel/:hotelId"
        element={
          <Layout>
            <HotelDetailsPage />
          </Layout>
        }
      />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;

