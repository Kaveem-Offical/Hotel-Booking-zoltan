import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Shield, Search, Mail, Phone, Calendar, LogOut, Home, Hotel, MoreVertical, Edit2, Trash2 } from 'lucide-react';
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
            <div className="admin-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
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
                <Link to="/" className="nav-logo">
                    <Hotel size={24} />
                    <span>Zoltan Hotels</span>
                </Link>
                <div className="user-menu">
                    <Link to="/" className="nav-link">
                        <Home size={18} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
                        Home
                    </Link>
                    <div className="user-info-nav">
                        <div className="user-avatar-nav">
                            {getInitials(userData?.username || currentUser?.email)}
                        </div>
                        <span style={{ color: 'var(--agoda-dark)', fontSize: '0.875rem', fontWeight: 500 }}>
                            {userData?.username || currentUser?.email?.split('@')[0]}
                        </span>
                    </div>
                    <button className="nav-button nav-button-secondary" onClick={handleLogout}>
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </header>

            <div style={{ paddingTop: '90px', padding: '90px 2rem 2rem' }}>
                {/* Header with Admin Badge */}
                <div className="admin-header">
                    <h1 className="admin-title">
                        <Users size={28} />
                        User Management
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="admin-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <Shield size={14} />
                            Admin Access
                        </span>
                    </div>
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
                            <Users size={64} />
                            <p>No users found</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
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
                                                        <svg width="14" height="14" viewBox="0 0 24 24" style={{ verticalAlign: 'middle' }}>
                                                            <path
                                                                fill="currentColor"
                                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                            />
                                                        </svg>
                                                    )}
                                                    {user.provider === 'email' && <Mail size={14} style={{ verticalAlign: 'middle' }} />}
                                                    <span style={{ marginLeft: '0.25rem' }}>
                                                        {user.provider === 'google' ? 'Google' : 'Email'}
                                                    </span>
                                                </span>
                                            </td>
                                            <td>
                                                {user.isAdmin ? (
                                                    <span className="admin-badge">
                                                        <Shield size={12} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
                                                        Admin
                                                    </span>
                                                ) : (
                                                    <span style={{ color: 'var(--agoda-light-gray)' }}>User</span>
                                                )}
                                            </td>
                                            <td style={{ color: 'var(--agoda-gray)', fontSize: '0.8rem' }}>
                                                {formatDate(user.createdAt)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer Stats */}
                <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: 'var(--agoda-white)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--agoda-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--agoda-gray)' }}>
                        Showing <strong>{filteredUsers.length}</strong> of <strong>{totalUsers}</strong> users
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--agoda-light-gray)' }}>
                        Last updated: {new Date().toLocaleString('en-IN')}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
