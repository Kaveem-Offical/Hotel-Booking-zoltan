/**
 * Firebase Admin SDK Configuration
 * Uses the same Firebase project as the client app
 * 
 * Supports two modes:
 * 1. Environment variable FIREBASE_SERVICE_ACCOUNT (for Render / production)
 * 2. Local serviceAccountKey.json file (for local development)
 */

const admin = require('firebase-admin');
const path = require('path');

// Path to your Firebase service account key file (local dev fallback)
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

// Firebase configuration
const firebaseConfig = {
    projectId: 'zoltan-51993',
    databaseURL: 'https://zoltan-51993-default-rtdb.firebaseio.com'
};

// Check if Firebase is already initialized
if (!admin.apps.length) {
    let serviceAccount;

    // Method 1: Load from environment variable (Render / production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            console.log('Loaded Firebase service account from environment variable');
        } catch (parseError) {
            console.error('Error parsing FIREBASE_SERVICE_ACCOUNT env var:', parseError.message);
            throw new Error('Firebase Admin initialization failed: Invalid FIREBASE_SERVICE_ACCOUNT JSON');
        }
    } else {
        // Method 2: Load from local JSON file (local development)
        try {
            serviceAccount = require(serviceAccountPath);
            console.log('Loaded Firebase service account from local file');
        } catch (fileError) {
            console.error('Error loading service account key:', fileError.message);
            console.error('Either set FIREBASE_SERVICE_ACCOUNT env var or place serviceAccountKey.json at:', serviceAccountPath);
            throw new Error('Firebase Admin initialization failed: Service account key not found');
        }
    }

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: firebaseConfig.databaseURL
    });
    console.log('Firebase Admin initialized successfully');
}

const database = admin.database();

module.exports = { admin, database };
