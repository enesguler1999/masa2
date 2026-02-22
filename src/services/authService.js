import axios from 'axios';
import { config } from '../config/env.js';

const authApiClient = axios.create({
    baseURL: config.authApi,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Since preview options may fail to use cookies, explicitly provide access token
// as a header if available
authApiClient.interceptors.request.use((req) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export const authService = {
    /**
     * Register a new user
     * @param {Object} userData 
     * @param {string} [userData.avatar]
     * @param {string} userData.password
     * @param {string} userData.fullname
     * @param {string} userData.email
     * @param {string} [userData.mobile]
     * @param {string} [userData.accountType]
     * @param {string} [userData.companyAddress]
     * @param {string} [userData.companyName]
     * @param {string} [userData.companyPhone]
     * @param {string} [userData.companyWebsite]
     * @param {boolean} userData.isPublic
     * @param {string} [userData.socialCode] - Pass if completing a social login registration
     * @returns {Promise<Object>} Response data wrapper
     * @example
     * // Success response:
     * // {
     * //   "status": "OK",
     * //   "statusCode": "201",
     * //   "elapsedMs": 126,
     * //   "userId": "ID",
     * //   "user": {
     * //     "id": "ID",
     * //     "email": "String",
     * //     "fullname": "String",
     * //     "avatar": "String",
     * //     "roleId": "String",
     * //     "mobile": "String",
     * //     "mobileVerified": "Boolean",
     * //     "emailVerified": "Boolean"
     * //     // ... other fields
     * //   },
     * //   "emailVerificationNeeded": true, // conditionally returned
     * //   "mobileVerificationNeeded": true // conditionally returned
     * // }
     */
    registerUser: async (userData) => {
        const response = await authApiClient.post('/v1/registeruser', userData);
        return response.data;
    },

    /**
     * Login user
     * @param {Object} credentials
     * @param {string} credentials.username - email or username
     * @param {string} credentials.password
     * @returns {Promise<Object>} Session object
     * @example
     * // Success response:
     * // {
     * //   "sessionId": "e81c7d2b-4e95-9b1e-842e-3fb9c8c1df38",
     * //   "userId": "d92b9d4c-9b1e-4e95-842e-3fb9c8c1df38",
     * //   "email": "user@example.com",
     * //   "fullname": "John Doe",
     * //   "accessToken": "ey7....",
     * //   "userBucketToken": "e56d...."
     * // }
     */
    login: async (credentials) => {
        const response = await authApiClient.post('/login', credentials);
        if (response.data && response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
        }
        return response.data;
    },

    /**
     * Logout user
     * @returns {Promise<Object>} OK confirmation
     * @example
     * // Success response:
     * // { "status": "OK", "message": "User logged out successfully" }
     */
    logout: async () => {
        try {
            const response = await authApiClient.post('/logout');
            return response.data;
        } finally {
            localStorage.removeItem('accessToken');
        }
    },

    /**
     * Get current user
     * @returns {Promise<Object>} Session object
     * @example
     * // Success response:
     * // {
     * //   "sessionId": "9cf23fa8-07d4-4e7c-80a6-ec6d6ac96bb9",
     * //   "userId": "d92b9d4c-9b1e-4e95-842e-3fb9c8c1df38",
     * //   "email": "user@example.com",
     * //   "fullname": "John Doe",
     * //   "roleId": "user",
     * //   "tenantId": "abc123",
     * //   "accessToken": "jwt-token-string",
     * //   "...": "..."
     * // }
     */
    getCurrentUser: async () => {
        const response = await authApiClient.get('/currentuser');
        return response.data;
    },

    /**
     * Initiates social login flow by redirecting the browser
     * @param {string} provider - Social provider (e.g., 'google')
     */
    initiateSocialLogin: (provider) => {
        window.location.href = `${config.authApi}/auth/${provider}`;
    },

    /**
     * Fetches the social login result using the socialCode
     * @param {string} socialCode - The hash received from the redirect URL
     * @returns {Promise<Object>} Session object or Registration needed info
     * @example
     * // Success (Login) response:
     * // {
     * //   "sessionId": "uuid",
     * //   "userId": "uuid",
     * //   "email": "user@example.com",
     * //   "fullname": "John Doe",
     * //   "accessToken": "jwt-token-string",
     * //   // ...
     * // }
     * 
     * // Success (Registration Needed) response:
     * // {
     * //   "type": "RegisterNeededForSocialLogin",
     * //   "socialCode": "md5-hash-string",
     * //   "accountInfo": {
     * //     "email": "user@example.com",
     * //     "fullname": "John Doe",
     * //     // ...
     * //   }
     * // }
     */
    getSocialLoginResult: async (socialCode) => {
        const response = await authApiClient.post('/auth/social-login-result', { socialCode });
        if (response.data && response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
        }
        return response.data;
    },
};

export const verificationService = {
    /**
     * Starts email verification
     * @param {string} email
     * @returns {Promise<Object>}
     * @example
     * // Success response:
     * // {
     * //   "status": "OK", 
     * //   "codeIndex": 1,
     * //   "timeStamp": 1784578660000,
     * //   "date": "Mon Jul 20 2026 23:17:40 GMT+0300 (GMT+03:00)",
     * //   "expireTime": 86400,
     * //   "verificationType": "byLink",
     * //   "secretCode": "123456", // in testMode
     * //   "userId": "user-uuid"   // in testMode
     * // }
     */
    startEmailVerification: async (email) => {
        const response = await authApiClient.post('/verification-services/email-verification/start', { email });
        return response.data;
    },

    /**
     * Completes email verification
     * @param {string} email
     * @param {string} secretCode
     * @returns {Promise<Object>}
     * @example
     * // Success response:
     * // {
     * //   "status": "OK", 
     * //   "isVerified": true,
     * //   "email": "user@email.com",
     * //   "userId": "user-uuid" // in testMode
     * // }
     */
    completeEmailVerification: async (email, secretCode) => {
        const response = await authApiClient.post('/verification-services/email-verification/complete', { email, secretCode });
        return response.data;
    },

    /**
     * Starts mobile verification
     * @param {string} email
     * @returns {Promise<Object>}
     * @example
     * // Success response:
     * // {
     * //   "status": "OK", 
     * //   "codeIndex": 1,
     * //   "timeStamp": 1784578660000,
     * //   "date": "Mon Jul 20 2026 23:17:40 GMT+0300 (GMT+03:00)",
     * //   "expireTime": 180,
     * //   "verificationType": "byCode",
     * //   "secretCode": "123456", // in testMode
     * //   "userId": "user-uuid"   // in testMode
     * // }
     */
    startMobileVerification: async (email) => {
        const response = await authApiClient.post('/verification-services/mobile-verification/start', { email });
        return response.data;
    },

    /**
     * Completes mobile verification
     * @param {string} email
     * @param {string} secretCode
     * @returns {Promise<Object>}
     * @example
     * // Success response:
     * // {
     * //   "status": "OK", 
     * //   "isVerified": true,
     * //   "mobile": "+1 333 ...",
     * //   "userId": "user-uuid" // in testMode
     * // }
     */
    completeMobileVerification: async (email, secretCode) => {
        const response = await authApiClient.post('/verification-services/mobile-verification/complete', { email, secretCode });
        return response.data;
    },

    /**
     * Starts password reset by email
     * @param {string} email
     * @returns {Promise<Object>}
     * @example
     * // Success response:
     * // {
     * //   "userId": "user-uuid",
     * //   "email": "user@example.com",
     * //   "codeIndex": 1,
     * //   "secretCode": "123456", 
     * //   "timeStamp": 1765484354,
     * //   "expireTime": 86400,
     * //   "date": "2024-04-29T10:00:00.000Z",
     * //   "verificationType": "byLink"
     * // }
     */
    startPasswordResetByEmail: async (email) => {
        const response = await authApiClient.post('/verification-services/password-reset-by-email/start', { email });
        return response.data;
    },

    /**
     * Completes password reset by email
     * @param {string} email
     * @param {string} secretCode
     * @param {string} password
     * @returns {Promise<Object>}
     * @example
     * // Success response:
     * // {
     * //   "userId": "user-uuid",
     * //   "email": "user@example.com",
     * //   "isVerified": true
     * // }
     */
    completePasswordResetByEmail: async (email, secretCode, password) => {
        const response = await authApiClient.post('/verification-services/password-reset-by-email/complete', { email, secretCode, password });
        return response.data;
    },

    /**
     * Starts password reset by mobile
     * @param {string} email
     * @returns {Promise<Object>}
     * @example
     * // Success response:
     * // {
     * //   "status": "OK",
     * //   "codeIndex": 1,
     * //   "timeStamp": 133241255,
     * //   "mobile": "+905.....67",
     * //   "secretCode": "123456", 
     * //   "expireTime": 86400,
     * //   "date": "2024-04-29T10:00:00.000Z",
     * //   "verificationType": "byLink"
     * // }
     */
    startPasswordResetByMobile: async (email) => {
        const response = await authApiClient.post('/verification-services/password-reset-by-mobile/start', { email });
        return response.data;
    },

    /**
     * Completes password reset by mobile
     * @param {string} email
     * @param {string} secretCode
     * @param {string} password
     * @returns {Promise<Object>}
     * @example
     * // Success response:
     * // {
     * //   "userId": "user-uuid",
     * //   "isVerified": true
     * // }
     */
    completePasswordResetByMobile: async (email, secretCode, password) => {
        const response = await authApiClient.post('/verification-services/password-reset-by-mobile/complete', { email, secretCode, password });
        return response.data;
    },
};
