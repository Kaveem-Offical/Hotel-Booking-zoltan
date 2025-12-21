import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Shield, Search, Mail, Phone, Calendar, LogOut, Home } from 'lucide-react';
import '../styles/Auth.css';

const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const { currentUser, userData, isAdmin, getAllUsers, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect if not admin
        if (!loading && (!currentUser || !isAdmin)) {
            navigate('/signin');
            return;
        }

        // Fetch all users
        const unsubscribe = getAllUsers((usersData) => {
            setUsers(usersData);
            setFilteredUsers(usersData);
            setLoading(false);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [currentUser, isAdmin, getAllUsers, navigate, loading]);

    useEffect(() => {
        // Filter users based on search term
        if (searchTerm.trim() === '') {
            setFilteredUsers(users);
        } else {
            const term = searchTerm.toLowerCase();
            const filtered = users.filter(
                (user) =>
                    user.username?.toLowerCase().includes(term) ||
                    user.email?.toLowerCase().includes(term) ||
                    user.phoneNumber?.includes(term)
            );
            setFilteredUsers(filtered);
        }
    }, [searchTerm, users]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/signin');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(date);
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

    if (loading) {
        return (
            <div className="admin-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="loading-spinner">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    const totalUsers = users.length;
    const googleUsers = users.filter((u) => u.provider === 'google').length;
    const emailUsers = users.filter((u) => u.provider === 'email').length;
    const adminUsers = users.filter((u) => u.isAdmin).length;

    return (
        <div className="admin-container">
            {/* Navigation Header */}
            <header className="nav-header">
                <a href="/" className="nav-logo">
                    <Shield size={28} />
                    Admin Panel
                </a>
                <div className="user-menu">
                    <div className="user-info-nav">
                        <div className="user-avatar-nav">
                            {getInitials(userData?.username || currentUser?.email)}
                        </div>
                        <span>{userData?.username || currentUser?.email}</span>
                    </div>
                    <button className="nav-link" onClick={() => navigate('/')} style={{ cursor: 'pointer', background: 'none', border: 'none' }}>
                        <Home size={18} style={{ marginRight: '0.25rem' }} />
                        Home
                    </button>
                    <button className="nav-button nav-button-secondary" onClick={handleLogout}>
                        <LogOut size={16} style={{ marginRight: '0.25rem' }} />
                        Logout
                    </button>
                </div>
            </header>

            <div style={{ paddingTop: '80px' }}>
                {/* Header */}
                <div className="admin-header">
                    <h1 className="admin-title">
                        <Users size={32} />
                        User Management
                    </h1>
                </div>

                {/* Stats Cards */}
                <div className="admin-stats">
                    <div className="stat-card">
                        <div className="stat-value">{totalUsers}</div>
                        <div className="stat-label">Total Users</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{emailUsers}</div>
                        <div className="stat-label">Email Sign-ups</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{googleUsers}</div>
                        <div className="stat-label">Google Sign-ups</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{adminUsers}</div>
                        <div className="stat-label">Admin Users</div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="users-table-container">
                    <div className="table-header">
                        <h2 className="table-title">All Registered Users</h2>
                        <div className="search-wrapper">
                            <Search className="search-icon" size={18} />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search by name, email, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {filteredUsers.length === 0 ? (
                        <div className="empty-state">
                            <Users size={80} />
                            <p>No users found</p>
                        </div>
                    ) : (
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>
                                        <Mail size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                        Email
                                    </th>
                                    <th>
                                        <Phone size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                        Phone
                                    </th>
                                    <th>Provider</th>
                                    <th>Role</th>
                                    <th>
                                        <Calendar size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                        Joined
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.uid}>
                                        <td>
                                            <div className="user-info">
                                                <div className="user-avatar">
                                                    {getInitials(user.username || user.email)}
                                                </div>
                                                <div>
                                                    <div className="user-name">{user.username || 'N/A'}</div>
                                                    <div className="user-email">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>{user.phoneNumber || 'N/A'}</td>
                                        <td>
                                            <span
                                                className={`provider-badge ${user.provider === 'google' ? 'provider-google' : 'provider-email'
                                                    }`}
                                            >
                                                {user.provider === 'google' && (
                                                    <svg width="14" height="14" viewBox="0 0 24 24" style={{ marginRight: '0.25rem' }}>
                                                        <path
                                                            fill="currentColor"
                                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                        />
                                                    </svg>
                                                )}
                                                {user.provider === 'email' && <Mail size={14} style={{ marginRight: '0.25rem' }} />}
                                                {user.provider === 'google' ? 'Google' : 'Email'}
                                            </span>
                                        </td>
                                        <td>
                                            {user.isAdmin && <span className="admin-badge">Admin</span>}
                                            {!user.isAdmin && <span style={{ color: 'rgba(255,255,255,0.5)' }}>User</span>}
                                        </td>
                                        <td>{formatDate(user.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
