import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import HotelDetailsPage from './pages/HotelDetailsPage';
import GuestDetailsPage from './pages/GuestDetailsPage';
import PaymentPage from './pages/PaymentPage';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import { Hotel, LogOut, Shield, Heart, HelpCircle, User, Sun, Moon } from 'lucide-react';
import './styles/Auth.css';
import logo from './assets/logo.png';

// Navigation Header Component
const NavHeader = () => {
  const { currentUser, userData, isAdmin, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
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
    <header className="nav-header theme-transition dark:bg-slate-900 dark:border-slate-700">
      <Link to="/" className="nav-logo">
        <img style={{ height: '50px' }} src={logo} alt="Zovotel Logo" />
      </Link>

      <div className="nav-links">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-300 mr-2 group"
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <Sun size={20} className="text-yellow-400 group-hover:animate-wiggle" />
          ) : (
            <Moon size={20} className="text-slate-600 group-hover:animate-wiggle" />
          )}
        </button>

        {currentUser ? (
          <>
            {/* Help Link */}
            <Link to="/help" className="nav-link dark:text-slate-300 dark:hover:text-white">
              <HelpCircle size={18} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
              Help
            </Link>

            {/* Saved Link - goes to profile */}
            <Link to="/profile" className="nav-link dark:text-slate-300 dark:hover:text-white">
              <Heart size={18} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
              Saved
            </Link>

            {/* Admin Link */}
            {isAdmin && (
              <Link to="/admin" className="nav-link dark:text-slate-300 dark:hover:text-white">
                <Shield size={18} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
                Admin
              </Link>
            )}

            {/* User Info - clickable to profile */}
            <Link to="/profile" className="user-info-nav dark:bg-slate-800" style={{ textDecoration: 'none', cursor: 'pointer' }}>
              <div className="user-avatar-nav">
                {getInitials(userData?.username || currentUser?.email)}
              </div>
              <span className="dark:text-slate-200" style={{ color: 'var(--agoda-dark)', fontSize: '0.875rem', fontWeight: 500 }}>
                {userData?.username || currentUser?.email?.split('@')[0]}
              </span>
            </Link>

            {/* Logout Button */}
            <button className="nav-button nav-button-secondary dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </>
        ) : (
          <>
            {/* Help Link */}
            <Link to="/help" className="nav-link dark:text-slate-300 dark:hover:text-white">
              <HelpCircle size={18} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
              Help
            </Link>

            {/* Sign In Link */}
            <Link to="/signin" className="nav-link dark:text-slate-300 dark:hover:text-white">
              Sign In
            </Link>

            {/* Sign Up Button */}
            <Link to="/signup" className="nav-button">
              <User size={16} />
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
    <div className="min-h-screen bg-white dark:bg-slate-900 theme-transition">
      {showNav && <NavHeader />}
      <main style={{ paddingTop: showNav ? '70px' : '0' }}>{children}</main>
    </div>
  );
};

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={<LandingPage />}
      />
      <Route
        path="/search"
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
      <Route
        path="/checkout"
        element={
          <Layout>
            <GuestDetailsPage />
          </Layout>
        }
      />
      <Route
        path="/payment"
        element={
          <Layout>
            <PaymentPage />
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
      {/* Profile Page */}
      <Route
        path="/profile"
        element={
          <Layout>
            <ProfilePage />
          </Layout>
        }
      />
      {/* Redirect wishlist to profile */}
      <Route
        path="/wishlist"
        element={<Navigate to="/profile" replace />}
      />
      <Route
        path="/help"
        element={
          <Layout>
            <div style={{
              minHeight: 'calc(100vh - 70px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--agoda-bg)',
              padding: '2rem'
            }}>
              <div style={{
                textAlign: 'center',
                background: 'white',
                padding: '3rem',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <HelpCircle size={64} style={{ color: 'var(--agoda-blue)', marginBottom: '1rem' }} />
                <h2 style={{ color: 'var(--agoda-dark)', marginBottom: '0.5rem' }}>Help Center</h2>
                <p style={{ color: 'var(--agoda-gray)' }}>Need assistance? We're here to help!</p>
              </div>
            </div>
          </Layout>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
