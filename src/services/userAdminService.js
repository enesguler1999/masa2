import axios from 'axios';
import { config } from '../config/env.js';

const authApiClient = axios.create({
    baseURL: config.authApi,
    headers: { 'Content-Type': 'application/json' },
});

authApiClient.interceptors.request.use((req) => {
    const token = localStorage.getItem('accessToken');
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
});

export const ROLES = {
    superAdmin: 'superAdmin',
    admin: 'admin',
    user: 'user',
};

export const userAdminService = {
    /**
     * List users with optional filters and pagination
     */
    listUsers: async (params = {}) => {
        const response = await authApiClient.get('/v1/users', { params });
        return response.data;
    },

    /**
     * Search users by keyword (elasticsearch)
     * @param {string} keyword – minimum 3 chars
     * @param {Object} params – optional roleId, mobile
     */
    searchUsers: async (keyword, params = {}) => {
        const response = await authApiClient.get('/v1/searchusers', {
            params: { keyword, ...params },
        });
        return response.data;
    },

    /**
     * Get a single user by id
     */
    getUser: async (userId) => {
        const response = await authApiClient.get(`/v1/users/${userId}`);
        return response.data;
    },

    /**
     * Create a user (admin only)
     */
    createUser: async (userData) => {
        const response = await authApiClient.post('/v1/users', userData);
        return response.data;
    },

    /**
     * Update user profile info (fullname, avatar, mobile, isPublic)
     */
    updateUser: async (userId, data) => {
        const response = await authApiClient.patch(`/v1/users/${userId}`, data);
        return response.data;
    },

    /**
     * Update user role (superAdmin → any, admin → user only)
     */
    updateUserRole: async (userId, roleId) => {
        const response = await authApiClient.patch(`/v1/userrole/${userId}`, { roleId });
        return response.data;
    },

    /**
     * Update user password by admin
     */
    updateUserPassword: async (userId, password) => {
        const response = await authApiClient.patch(`/v1/userpasswordbyadmin/${userId}`, { password });
        return response.data;
    },

    /**
     * Delete a user (superAdmin can delete admins, admins can delete users)
     */
    deleteUser: async (userId) => {
        const response = await authApiClient.delete(`/v1/users/${userId}`);
        return response.data;
    },
};
