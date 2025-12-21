import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    signInWithPopup,
} from 'firebase/auth';
import { ref, set, get, onValue } from 'firebase/database';
import { auth, database, googleProvider } from '../config/firebase';

const AuthContext = createContext();

// Admin emails - add your admin email addresses here
const ADMIN_EMAILS = ['admin@zoltan.com'];

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
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
        loading,
        error,
        signUp,
        signIn,
        signInWithGoogle,
        logout,
        getAllUsers,
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
