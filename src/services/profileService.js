import axios from 'axios';
import { config } from '../config/env.js';

const profileApiClient = axios.create({
    baseURL: config.authApi,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Since preview options may fail to use cookies, explicitly provide access token
// as a header if available
profileApiClient.interceptors.request.use((req) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export const profileService = {
    /**
     * Get user profile
     * @param {string} userId
     * @returns {Promise<Object>} Response data wrapper
     * @example
     * // Success response:
     * // {
     * //   "status": "OK",
     * //   "statusCode": "200",
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
     * //     "emailVerified": "Boolean",
     * //     // ... other fields
     * //     "_owner": "ID"
     * //   }
     * // }
     */
    getUser: async (userId) => {
        const response = await profileApiClient.get(`/v1/users/${userId}`);
        return response.data;
    },

    /**
     * Update user profile
     * @param {string} userId
     * @param {Object} profileData
     * @param {string} [profileData.fullname]
     * @param {string} [profileData.avatar]
     * @param {string} [profileData.mobile]
     * @param {string} [profileData.accountType]
     * @param {string} [profileData.companyAddress]
     * @param {string} [profileData.companyName]
     * @param {string} [profileData.companyPhone]
     * @param {string} [profileData.companyWebsite]
     * @param {boolean} [profileData.isPublic]
     * @returns {Promise<Object>} Response data wrapper
     * @example
     * // Success response:
     * // {
     * //   "status": "OK",
     * //   "statusCode": "200",
     * //   "userId": "ID",
     * //   "user": { ... updated user profile ... }
     * // }
     */
    updateProfile: async (userId, profileData) => {
        const response = await profileApiClient.patch(`/v1/profile/${userId}`, profileData);
        return response.data;
    },

    /**
     * Update user password
     * @param {string} userId
     * @param {string} oldPassword
     * @param {string} newPassword
     * @returns {Promise<Object>} Response data wrapper
     * @example
     * // Success response:
     * // {
     * //   "status": "OK",
     * //   "statusCode": "200",
     * //   "userId": "ID",
     * //   "user": { ... updated user profile ... }
     * // }
     */
    updateUserPassword: async (userId, oldPassword, newPassword) => {
        const response = await profileApiClient.patch(`/v1/userpassword/${userId}`, {
            oldPassword,
            newPassword,
        });
        return response.data;
    },

    /**
     * Archive user profile
     * @param {string} userId
     * @returns {Promise<Object>} Response data wrapper
     * @example
     * // Success response:
     * // {
     * //   "status": "OK",
     * //   "statusCode": "200",
     * //   "userId": "ID",
     * //   "user": { ... "isActive": false ... }
     * // }
     */
    archiveProfile: async (userId) => {
        const response = await profileApiClient.delete(`/v1/archiveprofile/${userId}`);
        return response.data;
    },
};
