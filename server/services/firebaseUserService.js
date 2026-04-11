/**
 * Firebase User Service
 * Handles Firebase Authentication user operations (Admin SDK)
 */

const { admin } = require('../config/firebaseAdmin');

/**
 * Get user by UID from Firebase Auth
 */
const getUserByUid = async (uid) => {
    try {
        const userRecord = await admin.auth().getUser(uid);
        return userRecord;
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            return null;
        }
        console.error('Error fetching user from Firebase:', error.message);
        throw error;
    }
};

/**
 * Get user by email from Firebase Auth
 */
const getUserByEmail = async (email) => {
    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        return userRecord;
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            return null;
        }
        console.error('Error fetching user by email from Firebase:', error.message);
        throw error;
    }
};

/**
 * Delete user from Firebase Auth
 */
const deleteUser = async (uid) => {
    try {
        await admin.auth().deleteUser(uid);
        console.log(`Firebase user ${uid} deleted successfully`);
        return true;
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            console.log(`Firebase user ${uid} not found, skipping deletion`);
            return true;
        }
        console.error('Error deleting Firebase user:', error.message);
        throw error;
    }
};

/**
 * Update user custom claims (for role management)
 */
const setCustomUserClaims = async (uid, claims) => {
    try {
        await admin.auth().setCustomUserClaims(uid, claims);
        console.log(`Custom claims set for user ${uid}:`, claims);
        return true;
    } catch (error) {
        console.error('Error setting custom claims:', error.message);
        throw error;
    }
};

/**
 * Update user email
 */
const updateUserEmail = async (uid, email) => {
    try {
        await admin.auth().updateUser(uid, { email });
        console.log(`Email updated for user ${uid}`);
        return true;
    } catch (error) {
        console.error('Error updating user email:', error.message);
        throw error;
    }
};

/**
 * Update user password
 */
const updateUserPassword = async (uid, password) => {
    try {
        await admin.auth().updateUser(uid, { password });
        console.log(`Password updated for user ${uid}`);
        return true;
    } catch (error) {
        console.error('Error updating user password:', error.message);
        throw error;
    }
};

/**
 * Disable/Enable user account
 */
const setUserDisabled = async (uid, disabled) => {
    try {
        await admin.auth().updateUser(uid, { disabled });
        console.log(`User ${uid} ${disabled ? 'disabled' : 'enabled'}`);
        return true;
    } catch (error) {
        console.error('Error updating user disabled status:', error.message);
        throw error;
    }
};

/**
 * List all Firebase Auth users (paginated)
 */
const listAllUsers = async (maxResults = 1000) => {
    try {
        const listUsersResult = await admin.auth().listUsers(maxResults);
        return listUsersResult.users.map(user => ({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            phoneNumber: user.phoneNumber,
            photoURL: user.photoURL,
            disabled: user.disabled,
            emailVerified: user.emailVerified,
            metadata: user.metadata,
            customClaims: user.customClaims,
            providerData: user.providerData
        }));
    } catch (error) {
        console.error('Error listing Firebase users:', error.message);
        throw error;
    }
};

/**
 * Sync Firebase user to MySQL (returns user data for MySQL insert/update)
 */
const prepareUserDataForMySQL = (firebaseUser) => {
    return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
        phoneNumber: firebaseUser.phoneNumber || '',
        photoURL: firebaseUser.photoURL || '',
        provider: firebaseUser.providerData?.[0]?.providerId || 'email',
        emailVerified: firebaseUser.emailVerified,
        disabled: firebaseUser.disabled
    };
};

module.exports = {
    getUserByUid,
    getUserByEmail,
    deleteUser,
    setCustomUserClaims,
    updateUserEmail,
    updateUserPassword,
    setUserDisabled,
    listAllUsers,
    prepareUserDataForMySQL
};
