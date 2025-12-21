/**
 * Firebase Admin SDK Configuration
 * Uses the same Firebase project as the client app
 */

const admin = require('firebase-admin');
const path = require('path');

// Path to your Firebase service account key file
// Download this from: Firebase Console → Project Settings → Service Accounts → Generate new private key
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

// Firebase configuration
const firebaseConfig = {
    projectId: 'zoltan-51993',
    databaseURL: 'https://zoltan-51993-default-rtdb.firebaseio.com'
};

// Check if Firebase is already initialized
if (!admin.apps.length) {
    try {
        // Try to load service account key file
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: firebaseConfig.databaseURL
        });
        console.log('Firebase Admin initialized with service account credentials');
    } catch (error) {
        console.error('Error loading service account key:', error.message);
        console.error('Please download the service account key from Firebase Console and save it at:', serviceAccountPath);
        throw new Error('Firebase Admin initialization failed: Service account key not found');
    }
}

const database = admin.database();

module.exports = { admin, database };
