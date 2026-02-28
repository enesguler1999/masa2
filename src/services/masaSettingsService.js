import axios from 'axios';
import { config } from '../config/env.js';

const masaSettingsApiClient = axios.create({
    baseURL: config.masaSettingsApi,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Inject access token into every request
masaSettingsApiClient.interceptors.request.use((req) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

// ─────────────────────────────────────────────
//  CarouselSlide
// ─────────────────────────────────────────────
export const carouselSlideService = {
    list: async () => {
        const response = await masaSettingsApiClient.get('/v1/carouselslides');
        return response.data;
    },
    get: async (carouselSlideId) => {
        const response = await masaSettingsApiClient.get(`/v1/carouselslides/${carouselSlideId}`);
        return response.data;
    },
    create: async (data) => {
        const response = await masaSettingsApiClient.post('/v1/carouselslides', data);
        return response.data;
    },
    update: async (carouselSlideId, data) => {
        const response = await masaSettingsApiClient.patch(`/v1/carouselslides/${carouselSlideId}`, data);
        return response.data;
    },
    delete: async (carouselSlideId) => {
        const response = await masaSettingsApiClient.delete(`/v1/carouselslides/${carouselSlideId}`);
        return response.data;
    },
};

// ─────────────────────────────────────────────
//  LoginCarouselSlide
// ─────────────────────────────────────────────
export const loginCarouselSlideService = {
    list: async () => {
        const response = await masaSettingsApiClient.get('/v1/logincarouselslides');
        return response.data;
    },
    get: async (loginCarouselSlideId) => {
        const response = await masaSettingsApiClient.get(`/v1/logincarouselslides/${loginCarouselSlideId}`);
        return response.data;
    },
    create: async (data) => {
        const response = await masaSettingsApiClient.post('/v1/logincarouselslides', data);
        return response.data;
    },
    update: async (loginCarouselSlideId, data) => {
        const response = await masaSettingsApiClient.patch(`/v1/logincarouselslides/${loginCarouselSlideId}`, data);
        return response.data;
    },
    delete: async (loginCarouselSlideId) => {
        const response = await masaSettingsApiClient.delete(`/v1/logincarouselslides/${loginCarouselSlideId}`);
        return response.data;
    },
};

// ─────────────────────────────────────────────
//  SupportedCountry
// ─────────────────────────────────────────────
export const supportedCountryService = {
    list: async () => {
        const response = await masaSettingsApiClient.get('/v1/supportedcountries');
        return response.data;
    },
    get: async (supportedCountryId) => {
        const response = await masaSettingsApiClient.get(`/v1/supportedcountries/${supportedCountryId}`);
        return response.data;
    },
    create: async (data) => {
        const response = await masaSettingsApiClient.post('/v1/supportedcountries', data);
        return response.data;
    },
    update: async (supportedCountryId, data) => {
        const response = await masaSettingsApiClient.patch(`/v1/supportedcountries/${supportedCountryId}`, data);
        return response.data;
    },
    delete: async (supportedCountryId) => {
        const response = await masaSettingsApiClient.delete(`/v1/supportedcountries/${supportedCountryId}`);
        return response.data;
    },
};
