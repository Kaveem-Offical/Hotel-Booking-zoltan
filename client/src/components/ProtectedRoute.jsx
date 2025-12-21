import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { currentUser, isAdmin, loading } = useAuth();

    // Show loading state if still checking auth
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '3px solid rgba(255, 255, 255, 0.1)',
                    borderTopColor: '#667eea',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                }} />
            </div>
        );
    }

    // Redirect to signin if not authenticated
    if (!currentUser) {
        return <Navigate to="/signin" replace />;
    }

    // Redirect to home if admin access required but user is not admin
    if (adminOnly && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
