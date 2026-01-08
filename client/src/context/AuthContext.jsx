import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    signInWithPopup,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
} from 'firebase/auth';
import { ref, set, get, onValue, update, remove } from 'firebase/database';
import { auth, database, googleProvider } from '../config/firebase';

const AuthContext = createContext();

// Admin emails - add your admin email addresses here
const ADMIN_EMAILS = ['admin@zoltan.com'];

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [likedHotels, setLikedHotels] = useState({});
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is admin
    const isAdmin = (email) => {
        return ADMIN_EMAILS.includes(email?.toLowerCase());
    };

    // Save user data to Firebase Realtime Database
    const saveUserData = async (uid, data) => {
        try {
            const userRef = ref(database, `users/${uid}`);
            await set(userRef, {
                ...data,
                createdAt: new Date().toISOString(),
                isAdmin: isAdmin(data.email),
            });
        } catch (err) {
            console.error('Error saving user data:', err);
            throw err;
        }
    };

    // Get user data from database
    const getUserData = async (uid) => {
        try {
            const userRef = ref(database, `users/${uid}`);
            const snapshot = await get(userRef);
            if (snapshot.exists()) {
                return snapshot.val();
            }
            return null;
        } catch (err) {
            console.error('Error getting user data:', err);
            return null;
        }
    };

    // Sign up with email and password
    const signUp = async (email, password, username, phoneNumber) => {
        try {
            setError(null);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Save additional user data to database
            await saveUserData(user.uid, {
                email: user.email,
                username,
                phoneNumber,
                provider: 'email',
            });

            return user;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Sign in with email and password
    const signIn = async (email, password) => {
        try {
            setError(null);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Sign in with Google
    const signInWithGoogle = async () => {
        try {
            setError(null);
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if user already exists in database
            const existingData = await getUserData(user.uid);

            if (!existingData) {
                // Save new user data
                await saveUserData(user.uid, {
                    email: user.email,
                    username: user.displayName || user.email.split('@')[0],
                    phoneNumber: user.phoneNumber || '',
                    provider: 'google',
                    photoURL: user.photoURL || '',
                });
            }

            return user;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Sign out
    const logout = async () => {
        try {
            setError(null);
            await signOut(auth);
            setUserData(null);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Get all users (for admin)
    const getAllUsers = (callback) => {
        const usersRef = ref(database, 'users');
        return onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const usersArray = Object.entries(data).map(([uid, userData]) => ({
                    uid,
                    ...userData,
                }));
                callback(usersArray);
            } else {
                callback([]);
            }
        });
    };

    // Update user profile (phone number, username)
    const updateUserProfile = async (updates) => {
        if (!currentUser) throw new Error('No user logged in');
        try {
            setError(null);
            const userRef = ref(database, `users/${currentUser.uid}`);
            await update(userRef, {
                ...updates,
                updatedAt: new Date().toISOString(),
            });
            // Refresh user data
            const data = await getUserData(currentUser.uid);
            setUserData(data);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Change password (requires current password for reauthentication)
    const changePassword = async (currentPassword, newPassword) => {
        if (!currentUser) throw new Error('No user logged in');
        try {
            setError(null);
            // Reauthenticate user first
            const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
            await reauthenticateWithCredential(currentUser, credential);
            // Update password
            await updatePassword(currentUser, newPassword);
            return true;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Like a hotel
    const likeHotel = async (hotelCode, hotelData) => {
        if (!currentUser) throw new Error('Please sign in to save hotels');
        try {
            const likedRef = ref(database, `users/${currentUser.uid}/likedHotels/${hotelCode}`);
            await set(likedRef, {
                ...hotelData,
                likedAt: new Date().toISOString(),
            });
            setLikedHotels(prev => ({ ...prev, [hotelCode]: hotelData }));
            return true;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Unlike a hotel
    const unlikeHotel = async (hotelCode) => {
        if (!currentUser) throw new Error('Please sign in');
        try {
            const likedRef = ref(database, `users/${currentUser.uid}/likedHotels/${hotelCode}`);
            await remove(likedRef);
            setLikedHotels(prev => {
                const updated = { ...prev };
                delete updated[hotelCode];
                return updated;
            });
            return true;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Check if hotel is liked
    const isHotelLiked = (hotelCode) => {
        return !!likedHotels[hotelCode];
    };

    // Add a booking
    const addBooking = async (bookingData) => {
        if (!currentUser) throw new Error('Please sign in');
        try {
            const bookingId = `booking_${Date.now()}`;
            const bookingRef = ref(database, `users/${currentUser.uid}/bookings/${bookingId}`);
            const booking = {
                ...bookingData,
                bookingId,
                status: 'booked', // booked, cancelled, completed
                createdAt: new Date().toISOString(),
            };
            await set(bookingRef, booking);
            setBookings(prev => [...prev, booking]);
            return booking;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Update booking status
    const updateBookingStatus = async (bookingId, status) => {
        if (!currentUser) throw new Error('Please sign in');
        try {
            const bookingRef = ref(database, `users/${currentUser.uid}/bookings/${bookingId}`);
            await update(bookingRef, {
                status,
                updatedAt: new Date().toISOString()
            });
            setBookings(prev => prev.map(b =>
                b.bookingId === bookingId ? { ...b, status } : b
            ));
            return true;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Load liked hotels for current user
    useEffect(() => {
        if (!currentUser) {
            setLikedHotels({});
            return;
        }
        const likedRef = ref(database, `users/${currentUser.uid}/likedHotels`);
        const unsubscribe = onValue(likedRef, (snapshot) => {
            const data = snapshot.val();
            setLikedHotels(data || {});
        });
        return () => unsubscribe();
    }, [currentUser]);

    // Load bookings for current user
    useEffect(() => {
        if (!currentUser) {
            setBookings([]);
            return;
        }
        const bookingsRef = ref(database, `users/${currentUser.uid}/bookings`);
        const unsubscribe = onValue(bookingsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const bookingsArray = Object.values(data).sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setBookings(bookingsArray);
            } else {
                setBookings([]);
            }
        });
        return () => unsubscribe();
    }, [currentUser]);

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                const data = await getUserData(user.uid);
                setUserData(data);
            } else {
                setUserData(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userData,
        likedHotels,
        bookings,
        loading,
        error,
        signUp,
        signIn,
        signInWithGoogle,
        logout,
        getAllUsers,
        updateUserProfile,
        changePassword,
        likeHotel,
        unlikeHotel,
        isHotelLiked,
        addBooking,
        updateBookingStatus,
        isAdmin: userData?.isAdmin || isAdmin(currentUser?.email),
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
