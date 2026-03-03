const axios = require('axios');
const config = require('../config/config');

/**
 * TBO Authentication Service
 * 
 * Manages the TBO API TokenId by calling the Authenticate endpoint.
 * The token is valid for 24 hours (00:00 AM to 11:59 PM).
 * Caches the token in memory and auto-refreshes when the date changes
 * or when a request fails due to an expired/invalid token.
 */

let cachedToken = null;
let cachedMember = null;
let tokenDate = null; // The date (YYYY-MM-DD) when the token was obtained

/**
 * Authenticate with TBO API and obtain a TokenId
 * @returns {Object} { tokenId, member, status }
 */
const authenticate = async () => {
    try {
        const endUserIp = process.env.TBO_END_USER_IP || '192.168.11.120';

        const requestBody = {
            ClientId: config.tboApi.clientId,
            UserName: config.tboApi.apiAuth.username,
            Password: config.tboApi.apiAuth.password,
            EndUserIp: endUserIp
        };

        console.log('\n=== TBO Authenticate Request ===');
        console.log(`URL: ${config.tboApi.authenticateUrl}`);
        console.log(`ClientId: ${requestBody.ClientId}`);
        console.log(`UserName: ${requestBody.UserName}`);
        console.log(`EndUserIp: ${requestBody.EndUserIp}`);

        const response = await axios.post(
            config.tboApi.authenticateUrl,
            requestBody,
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );

        const data = response.data;

        // Check response status
        // Status: NotSet=0, Successful=1, Failed=2, InCorrectUserName=3, InCorrectPassword=4, PasswordExpired=5
        if (data.Status !== 1) {
            const statusMessages = {
                0: 'Not Set',
                2: 'Authentication Failed',
                3: 'Incorrect Username',
                4: 'Incorrect Password',
                5: 'Password Expired'
            };
            const errorMsg = data.Error?.ErrorMessage || statusMessages[data.Status] || 'Unknown error';
            throw new Error(`TBO Authentication failed (Status: ${data.Status}): ${errorMsg}`);
        }

        // Check for error codes
        if (data.Error && data.Error.ErrorCode !== 0) {
            throw new Error(`TBO Authentication error (Code: ${data.Error.ErrorCode}): ${data.Error.ErrorMessage}`);
        }

        // Cache the token
        cachedToken = data.TokenId;
        cachedMember = data.Member;
        tokenDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        console.log('=== TBO Authenticate Success ===');
        console.log(`TokenId: ${cachedToken}`);
        console.log(`Member: ${cachedMember?.FirstName} ${cachedMember?.LastName}`);
        console.log(`AgencyId: ${cachedMember?.AgencyId}`);
        console.log(`Token Date: ${tokenDate}`);

        return {
            tokenId: cachedToken,
            member: cachedMember,
            status: data.Status
        };
    } catch (error) {
        // Clear cached token on error
        cachedToken = null;
        cachedMember = null;
        tokenDate = null;

        if (error.response) {
            console.error('TBO Authenticate API Error:', error.response.status, error.response.data);
            throw new Error(`TBO Authenticate API returned ${error.response.status}: ${JSON.stringify(error.response.data)}`);
        }

        console.error('TBO Authenticate Error:', error.message);
        throw error;
    }
};

/**
 * Check if the cached token is still valid
 * Token is valid for 24 hours (00:00 AM to 11:59 PM of the same day)
 * @returns {boolean}
 */
const isTokenValid = () => {
    if (!cachedToken || !tokenDate) return false;

    const today = new Date().toISOString().split('T')[0];
    return tokenDate === today;
};

/**
 * Get a valid TokenId, re-authenticating if necessary
 * This is the primary method to use when you need a TokenId
 * @returns {string} A valid TokenId
 */
const getTokenId = async () => {
    if (isTokenValid()) {
        console.log(`Using cached TokenId (obtained on ${tokenDate})`);
        return cachedToken;
    }

    console.log('Token expired or not available, re-authenticating...');
    const result = await authenticate();
    return result.tokenId;
};

/**
 * Force a fresh authentication (e.g., after a token-related error)
 * @returns {string} A fresh TokenId
 */
const refreshToken = async () => {
    console.log('Force refreshing TBO token...');
    cachedToken = null;
    cachedMember = null;
    tokenDate = null;
    const result = await authenticate();
    return result.tokenId;
};

/**
 * Get cached member info (if authenticated)
 * @returns {Object|null}
 */
const getMemberInfo = () => cachedMember;

module.exports = {
    authenticate,
    getTokenId,
    refreshToken,
    isTokenValid,
    getMemberInfo
};
